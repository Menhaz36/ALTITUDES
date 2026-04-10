import axios from 'axios';
import "dotenv/config"

// ── Axios instance ────────────────────────────────────────────────
const flightAPI = axios.create({
  baseURL: process.env.FLIGHT_API_BASE_URL,
  headers: {
    'x-rapidapi-key':  process.env.FLIGHT_API_KEY,
    'x-rapidapi-host': process.env.FLIGHT_API_HOST,
    'Content-Type':    'application/json',
  },
  timeout: 15000,
});

// ── Cache ─────────────────────────────────────────────────────────
const cache = new Map();
const getCached = (key) => {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
};
const setCache = (key, data, ttlSecs = 300) =>
  cache.set(key, { data, expiresAt: Date.now() + ttlSecs * 1000 });

// ── Normalize → shape your frontend expects ───────────────────────
const normalizeFlight = (f, index) => ({
  FlightID:    f.flight_number   ?? f.id             ?? `FL-${index}`,
  FlightName:  f.airline_name    ?? f.carrier         ?? 'Unknown Airline',
  Source:      f.from_airport    ?? f.departure_iata  ?? '',
  Destination: f.to_airport      ?? f.arrival_iata    ?? '',
  ArrivalTime: f.arrival_time    ?? f.arrival         ?? '',
  Price:       f.price           ?? f.total_price     ?? null, // bonus field
});

// ── Search one-way flights ────────────────────────────────────────
export const searchFlights = async ({ source, destination, date }) => {
    console.log("2. Service calling API with:", { source, destination, date });
  try {
    const key = `flights:${source}:${destination}:${date}`;
    const cached = getCached(key);
    if (cached) return cached;

  const { data } = await flightAPI.post('/api/google_flights/roundtrip/v1', {
    departure_date:   date,
    return_date:      date,  // same day — adjust if you support return trips
    from_airport:     source,
    to_airport:       destination,
  }); 
  console.log("3. API Call successful");


  // Log raw once during dev so you can inspect actual response shape
  console.log('RAW API RESPONSE:', JSON.stringify(data, null, 2));

  // Google Flights API nests results — unwrap whatever layer holds the array
  const raw = data?.flights        // try common shapes
           ?? data?.data?.flights
           ?? data?.data
           ?? data?.results
           ?? [];

  const results = Array.isArray(raw) ? raw.map(normalizeFlight) : [];
  setCache(key, results);
  return results;
} catch (err) {
    console.error("External API Error:", err.response?.data || err.message);
    throw err;
  }
};

export const getAirportInfo = async (iataCode) => {
  const key = `airport:${iataCode}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await flightAPI.get('/api/google_flights/airports', {
    params: { iata_code: iataCode },
  });

  setCache(key, data, 3600);
  return data;
};


export const getRouteInfo = async ({ origin, destination }) => {
  const key = `route:${origin}:${destination}`;
  const cached = getCached(key);
  if (cached) return cached;

  const { data } = await flightAPI.get('/api/google_flights/routes', {
    params: { dep_iata: origin, arr_iata: destination },
  });

  setCache(key, data, 3600);
  return data;
};
