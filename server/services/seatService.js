import Booking from "../models/Booking.js";

export const getBookedSeats = async (flightId) => {
  const bookings = await Booking.find({ flightId }, "seats -_id");
  // flatten all seatNumbers arrays into one array
  return bookings.flatMap((b) => b.seats.map((s) => s.label));
};

export const bookSeats = async (flightId, seatNumbers) => {
  // ✅ Check for conflicts BEFORE inserting
  const alreadyBooked = await getBookedSeats(flightId);
  const conflicts = seatNumbers.filter((s) => alreadyBooked.includes(s));

  if (conflicts.length > 0) {
    const err = new Error("Seat conflict");
    err.code = 11000; // reuse same code so controller handles it the same way
    err.conflicts = conflicts;
    throw err;
  }

    await Booking.create({ flightId, seatNumbers });
  };

  export const createFullBooking = async (bookingData, userId) => {
    const { selectedFlight, seats, user, totalPrice } = bookingData;

    //  conflict check first (reuse existing logic)
    const alreadyBooked = await getBookedSeats(selectedFlight.flightID);
    const seatLabels = seats.map((s) => s.label);
    const conflicts = seatLabels.filter((s) => alreadyBooked.includes(s));

    if (conflicts.length > 0) {
      const err = new Error("Seat conflict");
      err.code = 11000;
      throw err;
    }

    //  store full booking in one document
    const booking = await Booking.create({
      userId,
      flightId: selectedFlight.flightID,
      flightName: selectedFlight.flightName,
      seats,
      source: selectedFlight.source,
      destination: selectedFlight.destination,
      date: selectedFlight.date,
      totalPrice,
      passengers: user,
    });

    return booking;
  };