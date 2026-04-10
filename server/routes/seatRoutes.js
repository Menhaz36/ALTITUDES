import express from "express";
import { fetchBookedSeats, storeBooking } from "../controllers/seatController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:flightId", fetchBookedSeats);
router.post("/bookings", verifyJWT, storeBooking);

export default router;