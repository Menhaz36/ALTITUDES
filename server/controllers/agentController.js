import Groq from "groq-sdk";
import * as duffel_fServices from "../services/duffel_fServices.js";
import * as seatService from "../services/seatService.js";
import Booking from "../models/Booking.js";
import { tools } from "../utils/agentTools.js";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const pendingBookings = new Map();
const MODEL = "llama-3.3-70b-versatile";

// Keep only the last N user/assistant turns to avoid token blowup
const MAX_HISTORY_TURNS = 6; // 6 messages = 3 back-and-forth exchanges
const MAX_FLIGHTS = 5;        // only show top 5 flights to LLM

const getSystemPrompt = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const tom = new Date(now); tom.setDate(tom.getDate() + 1);

    return {
        role: "system",
        content: `You are a flight booking assistant for Altitudes. Be brief.

Today: ${fmt(now)}. Tomorrow: ${fmt(tom)}.
IATA: Delhi=DEL Mumbai=BOM Bangalore=BLR Kolkata=CCU Hyderabad=HYD Pune=PNQ

FLOW — follow strictly, one step at a time:

STEP 1 SEARCH: Call search_flights. List results:
"[n]. [FlightName] (ID:[FlightID]) [Dep]-[Arr] ₹[Price]"
Then ask: "Which flight would you like to book?"
Stop here. Do NOT ask for passenger details.

STEP 2 SELECTION: User picks a flight. Say which flight you selected. Then ask in ONE message:
"Please provide: Name, Age, Gender, and Seat preference (Economy or Business)."
Stop here. Do NOT call initiate_payment yet.

STEP 3 PAYMENT: User replies with name+age+gender+seat. As soon as you have ALL 4 fields, you MUST immediately call initiate_payment with:
- flightId, flightName, source, destination, date, departureTime, arrivalTime from the selected flight
- seats: [{ label: "1A", category: <seat preference>, price: <flight price> }]
- passengers: [{ name, age (as number), gender }]
- totalPrice: flight price as number
Do NOT reply with text in this turn. Just call the tool.
After initiate_payment returns, reply ONLY: "Here are your booking details above. Confirm payment?"

STEP 4 CONFIRM: User says yes/confirm → call confirm_booking with the bookingToken.
User says no/cancel → say booking cancelled.

RULES:
- Source is always DEL, destination is always BOM (or wherever they searched).
- Seat label can be "1A" if not specified.
- Never write <function> tags or JSON in replies.
- Never describe which tool you are calling.`,
    };
};

// Slim down messages before sending to Groq to save tokens
const trimHistory = (messages) => {
    // Always keep tool turns paired with their assistant call
    // Strategy: keep system-level tool pairs + last MAX_HISTORY_TURNS user/assistant messages
    const toolPairs = new Set();
    messages.forEach((m, i) => {
        if (m.role === "tool") {
            toolPairs.add(i);
            if (i > 0) toolPairs.add(i - 1); // the assistant message that triggered it
        }
    });

    const userAssistant = messages
        .map((m, i) => ({ m, i }))
        .filter(({ m }) => m.role === "user" || m.role === "assistant");

    const keepFromUA = userAssistant
        .slice(-MAX_HISTORY_TURNS)
        .map(({ i }) => i);

    const keepSet = new Set([...toolPairs, ...keepFromUA]);
    return messages.filter((_, i) => keepSet.has(i));
};

const cleanReply = (text) => {
    if (!text) return text;
    return text
        .replace(/<function[\s\S]*?(?:<\/function>|$)/gi, "")
        .replace(/\{[\s\S]*?"flightId"[\s\S]*?\}/g, "")
        .replace(/\{[\s\S]*?"bookingToken"[\s\S]*?\}/g, "")
        .replace(/I(?:'ll| will)(?: now)? call(?: the)? \w+ function[^.]*\.?/gi, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim() || null;
};

export const handleAgentMessage = async (req, res) => {
    const { messages: rawMessages } = req.body;
    const messages = [...rawMessages];
    const userId = req.user._id;

    global._lastPendingPayment = null;
    global._lastConfirmedBooking = null;

    try {
        const trimmed = trimHistory(messages);

        let response = await client.chat.completions.create({
            model: MODEL,
            messages: [getSystemPrompt(), ...trimmed],
            tools,
            tool_choice: "auto",
            max_tokens: 512, // short replies only
        });

        let iterations = 0;
        while (response.choices[0].finish_reason === "tool_calls" && iterations < 3) {
            iterations++;
            for (const toolCall of response.choices[0].message.tool_calls) {
                let toolResult;
                try {
                    toolResult = await executeTool(
                        toolCall.function.name,
                        JSON.parse(toolCall.function.arguments),
                        userId
                    );
                } catch (err) {
                    toolResult = { error: err.message };
                }

                console.log(`[Tool:${toolCall.function.name}]`, JSON.stringify(toolResult).slice(0, 200));

                // Push to full history (for context continuity across turns)
                messages.push(response.choices[0].message);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult),
                });
            }

            const trimmedNext = trimHistory(messages);
            response = await client.chat.completions.create({
                model: MODEL,
                messages: [getSystemPrompt(), ...trimmedNext],
                tools,
                tool_choice: "auto",
                max_tokens: 512,
            });
        }

        const reply = cleanReply(response.choices[0].message.content ?? "Done! Anything else?");

        res.json({
            reply,
            messages, // send full history back so client can maintain context
            pendingPayment: global._lastPendingPayment ?? null,
            confirmedBooking: global._lastConfirmedBooking ?? null,
        });

        global._lastPendingPayment = null;
        global._lastConfirmedBooking = null;

    } catch (err) {
        const errData = err?.error?.error ?? err;
        console.error("Agent error:", errData);

        // Give user a friendly message for rate limits
        const isRateLimit = errData?.code === "rate_limit_exceeded";
        res.status(isRateLimit ? 429 : 500).json({
            error: "Agent error",
            message: isRateLimit
                ? "I'm temporarily unavailable due to high usage. Please try again in a few minutes."
                : errData?.message ?? err.message,
        });
    }
};

const executeTool = async (toolName, input, userId) => {
    switch (toolName) {
        case "search_flights": {
            const flights = await duffel_fServices.searchFlightsDuffel(input);
            if (!flights?.length) return { flights: [], message: "No flights found." };

            // Slim each flight to just what the LLM needs — fewer tokens
            const slim = flights.slice(0, MAX_FLIGHTS).map(f => ({
                FlightID:      f.FlightID,
                FlightName:    f.FlightName,
                DepartureTime: f.DepartureTime ?? "",
                ArrivalTime:   f.ArrivalTime ?? "",
                Price:         f.Price,
            }));

            return {
                flights: slim,
                count: slim.length,
                message: `Found ${slim.length} flights. List ALL of them now.`,
            };
        }

        case "get_user_bookings":
            return await Booking.find({ userId }).lean();

        case "initiate_payment": {
            const bookingToken = `PAY_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
            pendingBookings.set(bookingToken, { ...input, userId });
            global._lastPendingPayment = { bookingToken, ...input };
            return { success: true, bookingToken, message: "Payment card shown. Awaiting confirmation." };
        }

        case "confirm_booking": {
            const pending = pendingBookings.get(input.bookingToken);
            if (!pending) return { error: "No pending booking found. Start over." };
            pendingBookings.delete(input.bookingToken);

            const booking = await seatService.createFullBooking({
                selectedFlight: {
                    flightID:    pending.flightId,
                    flightName:  pending.flightName,
                    source:      pending.source,
                    destination: pending.destination,
                    date:        pending.date,
                },
                seats:      pending.seats,
                user:       pending.passengers,
                totalPrice: pending.totalPrice,
            }, pending.userId);

            global._lastConfirmedBooking = {
                bookingId:     booking._id.toString(),
                flightId:      pending.flightId,
                flightName:    pending.flightName,
                source:        pending.source,
                destination:   pending.destination,
                date:          pending.date,
                departureTime: pending.departureTime ?? null,
                arrivalTime:   pending.arrivalTime ?? null,
                seats:         pending.seats,
                passengers:    pending.passengers,
                totalPrice:    pending.totalPrice,
                bookedAt:      new Date().toISOString(),
            };

            return { success: true, bookingId: booking._id };
        }

        case "cancel_booking":
            return await Booking.findOneAndDelete({ _id: input.bookingId, userId });

        default:
            return { error: "Unknown tool" };
    }
};