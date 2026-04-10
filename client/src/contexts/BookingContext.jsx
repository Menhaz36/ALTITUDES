import { createContext, useState, useEffect } from "react";
import { setItem, getItem, removeItem } from "../utils/localStorage";

// eslint-disable-next-line react-refresh/only-export-components
export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const defaultBooking = { user: {}, selectedFlight: [], seats: [], totalPrice: 0 };

    const [bookingData, setBookingData] = useState(() => {
        return getItem("bookingData") || defaultBooking;
    });

    useEffect(() => {
        if (bookingData) setItem("bookingData", bookingData);
    }, [bookingData]);

    const updateBookingData = (newData) => {
        setBookingData((prev) => ({ ...prev, ...newData }));
    };

    const clearBookingData = () => {
        setBookingData(defaultBooking);
        removeItem("bookingData");
    };

    return (
        <BookingContext.Provider
            value={{ bookingData, updateBookingData, clearBookingData }}
        >
            {children}
        </BookingContext.Provider>
    );
};
