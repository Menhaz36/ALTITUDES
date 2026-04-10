export const tools = [
  {
    type: "function",
    function: {
      name: "search_flights",
      description: "Search for available flights between two cities on a date",
      parameters: {
        type: "object",
        properties: {
          source:        { type: "string", description: "Departure city IATA code e.g. DEL" },
          destination:   { type: "string", description: "Arrival city IATA code e.g. BOM" },
          departureDate: { type: "string", description: "Date in YYYY-MM-DD format" },
          adults:        { type: "number", description: "Number of adult passengers" },
          children:      { type: "number", description: "Number of child passengers" }
        },
        required: ["source", "destination", "departureDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_bookings",
      description: "Get all existing bookings for the logged in user",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "initiate_payment",
      description: "Called BEFORE booking to present a payment confirmation to the user. Use this when the user has selected a flight and seats and wants to proceed. This shows the user the total price and asks them to confirm payment.",
      parameters: {
        type: "object",
        properties: {
          flightId:    { type: "string", description: "The FlightID from search results" },
          flightName:  { type: "string", description: "Airline name e.g. IndiGo" },
          source:      { type: "string", description: "Departure city IATA code" },
          destination: { type: "string", description: "Arrival city IATA code" },
          date:        { type: "string", description: "Departure date YYYY-MM-DD" },
          departureTime: { type: "string", description: "Departure time from flight data" },
          arrivalTime:   { type: "string", description: "Arrival time from flight data" },
          seats: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label:    { type: "string" },
                category: { type: "string" },
                price:    { type: "number" }
              },
              required: ["label", "category", "price"]
            }
          },
          totalPrice: { type: "number", description: "Total price in INR" },
          passengers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name:   { type: "string" },
                age:    { type: "number" },
                gender: { type: "string" }
              }
            }
          }
        },
        required: ["flightId", "flightName", "source", "destination", "date", "seats", "totalPrice", "passengers"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "confirm_booking",
      description: "Called ONLY after the user explicitly says YES to the payment prompt. This finalises the booking and stores it.",
      parameters: {
        type: "object",
        properties: {
          bookingToken: { type: "string", description: "The booking token returned by initiate_payment" }
        },
        required: ["bookingToken"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "cancel_booking",
      description: "Cancel an existing booking by its ID",
      parameters: {
        type: "object",
        properties: {
          bookingId: { type: "string", description: "MongoDB _id of the booking" }
        },
        required: ["bookingId"]
      }
    }
  }
];