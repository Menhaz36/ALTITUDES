import axios from 'axios';
import "dotenv/config"

const duffelAPI = axios.create({
    baseURL: process.env.DUFFEL_API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
    },
    timeout: 20000,
});

const cache = new Map();
const getCached = (key) => {
    const entry = cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null; }
    return entry.data;
};
const setCache = (key, data, ttlMs = 10 * 60 * 1000) => {
    cache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

const normalizeFlight = (offer) => {
    const segment = offer?.slices?.[0]?.segments?.[0];
    return {
        FlightID:      segment?.marketing_carrier_flight_number ?? null,
        FlightName:    segment?.operating_carrier?.name ?? 'Unknown Airline',
        Source:        segment?.origin?.iata_code ?? '',
        Destination:   segment?.destination?.iata_code ?? '',
        ArrivalTime:   segment?.arriving_at ?? '',
        DepartureTime: segment?.departing_at ?? '',
        Price:         parseFloat(offer?.total_amount ?? 0),
    };
};

const deduplicateAndFilter = (flights, requestedDate) => {
    // Filter: only keep flights that depart on the exact requested date
    const onDate = flights.filter(f => {
        if (!f.DepartureTime) return false;
        // DepartureTime is like "2026-03-20T14:25:00" — compare date portion only
        const flightDate = f.DepartureTime.slice(0, 10);
        return flightDate === requestedDate;
    });

    // Deduplicate: keep cheapest per FlightID
    const cheapest = new Map();
    for (const f of onDate) {
        if (!f.FlightID) continue;
        const existing = cheapest.get(f.FlightID);
        if (!existing || f.Price < existing.Price) {
            cheapest.set(f.FlightID, f);
        }
    }

    // Sort by departure time
    return Array.from(cheapest.values())
        .sort((a, b) => new Date(a.DepartureTime) - new Date(b.DepartureTime));
};

const resolveAndValidateDate = (dateStr) => {
    if (!dateStr) throw new Error("departureDate is required");

    // Use a fixed "now" reference at midnight local time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight local

    let resolved;
    const lower = dateStr.toLowerCase().trim();

    if (lower === 'today') {
        resolved = new Date(today);
    } else if (lower === 'tomorrow') {
        resolved = new Date(today);
        resolved.setDate(resolved.getDate() + 1);
    } else if (lower.startsWith('next ')) {
        const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const targetDay = days.indexOf(lower.replace('next ', ''));
        if (targetDay === -1) throw new Error(`Cannot parse date: "${dateStr}"`);
        resolved = new Date(today);
        const diff = (targetDay - resolved.getDay() + 7) % 7 || 7;
        resolved.setDate(resolved.getDate() + diff);
    } else {
        // Parse YYYY-MM-DD as local date, not UTC (avoids off-by-one issues)
        const parts = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (parts) {
            resolved = new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]));
        } else {
            throw new Error(`Invalid date: "${dateStr}". Use YYYY-MM-DD.`);
        }
    }

    if (resolved < today) {
        throw new Error(`Date must be in the future. Got: "${dateStr}", today is ${
            today.getFullYear() + '-' +
            String(today.getMonth()+1).padStart(2,'0') + '-' +
            String(today.getDate()).padStart(2,'0')
        }`);
    }

    // Return as YYYY-MM-DD string using LOCAL date (not UTC toISOString which can shift the day)
    return resolved.getFullYear() + '-' +
        String(resolved.getMonth() + 1).padStart(2, '0') + '-' +
        String(resolved.getDate()).padStart(2, '0');
};

export const searchFlightsDuffel = async ({
    source, destination, departureDate,
    returnDate = null, adults = 1, children = 0, cabinClass = "economy"
}) => {
    const resolvedDeparture = resolveAndValidateDate(departureDate);
    console.log("Duffel search:", { source, destination, resolvedDeparture });

    let resolvedReturn = null;
    if (returnDate) {
        resolvedReturn = resolveAndValidateDate(returnDate);
        if (resolvedReturn <= resolvedDeparture)
            throw new Error("returnDate must be after departureDate");
    }

    const cacheKey = `${source}:${destination}:${resolvedDeparture}:${resolvedReturn}:${adults}:${children}:${cabinClass}`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log("Duffel cache hit:", cacheKey);
        return cached;
    }

    const slices = [{ origin: source, destination, departure_date: resolvedDeparture }];
    if (resolvedReturn) slices.push({ origin: destination, destination: source, departure_date: resolvedReturn });

    const passengers = [
        ...Array(Number(adults)).fill({ type: "adult" }),
        ...Array(Number(children)).fill({ age: 8 }),
    ];

    try {
        const { data } = await duffelAPI.post('/air/offer_requests', {
            data: { slices, passengers, cabin_class: cabinClass }
        });

        const raw = data?.data?.offers ?? [];
        const allFlights = Array.isArray(raw) ? raw.map(normalizeFlight) : [];
        const results = deduplicateAndFilter(allFlights, resolvedDeparture);

        console.log(`Duffel: ${raw.length} raw offers → ${results.length} unique flights for ${resolvedDeparture}`);
        setCache(cacheKey, results);
        return results;

    } catch (error) {
        const duffelMsg = error.response?.data?.errors?.[0]?.message;
        if (duffelMsg) throw new Error(`Duffel: ${duffelMsg}`);
        console.error("Duffel error:", error.message);
        throw error;
    }
};