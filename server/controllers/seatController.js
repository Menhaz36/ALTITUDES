
import { getBookedSeats, createFullBooking } from "../services/seatService.js";

export const fetchBookedSeats = async (req, res) => {
  try {
    const bookedSeats = await getBookedSeats(req.params.flightId);
    res.json({ bookedSeats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seats" });
  }
};

// export const createBooking = async (req, res) => {
//   const { flightId, seatNumbers } = req.body;
//   if (!flightId || !seatNumbers?.length) {
//     return res.status(400).json({ error: "flightId and seatNumbers required" });
//   }

//   try {
//     await bookSeats(flightId, seatNumbers);
//     res.json({ success: true });
//   } catch (err) {
//     if (err.code === 11000 || err.writeErrors?.some((e) => e.code === 11000)) {
//       return res.status(409).json({ error: "Seat conflict" });
//     }
//     res.status(500).json({ error: "Booking failed" });
//   }
// };


export const storeBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const booking = await createFullBooking(req.body, userId);
    res.json({ success: true, booking });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Seat conflict" });
    }
    res.status(500).json({ error: "Failed to store booking" });
  }
};