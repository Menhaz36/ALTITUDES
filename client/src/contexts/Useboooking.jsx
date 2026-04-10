import { useContext } from "react";
import { BookingContext } from "./BookingContext";

export const UseBooking = () => {
  return useContext(BookingContext);
};
