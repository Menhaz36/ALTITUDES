import React from "react";
import { UseBooking } from "../../contexts/Useboooking";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Payment_Button from "../paymentButton/Payment_Button";

const Seat_map = ({

        //props with default values
        layout = { rows: 6, seatsPerRow: 6, aisleAfterSeat: 3 },
        seatTypes = {
          available: "bg-gray-500/50",
          booked: "bg-red-500/50",
          selected: "bg-blue-500",
        },
        seatPricing = {
                Business: { rows: [1, 2], price: 8000, style: `bg-lime-400/20` },
                Premium: { rows: [3, 4], price: 5000, style: `bg-blue-400/20` },
                Economy: { rows: [5, 6], price: 3000, style: `bg-purple-400/20` },
            },
        bookedSeats = [],
        MaxSeatSelection = 3,
        flightId,
        // onSeatSelect = () => {},
    }) => {

          const { bookingData, updateBookingData } = UseBooking();
          const navigate = useNavigate();
          const [fetchedBookedSeats, setFetchedBookedSeats] = useState(bookedSeats);

          // const { id: flightId } = useParams(); 
          //  //  Reset seats when flight changes
          useEffect(() => {
            updateBookingData({ seats: [], totalPrice: 0 });
          }, []); //  runs when flight id changes




          // State to store selected seat objects

          const selectedSeats = bookingData.seats || []; // [{ label, category, price }]
          const totalPrice = bookingData.totalPrice || 0;
          const seatSelectionCount = selectedSeats.length;


          useEffect(() => {
              if (!flightId) return;

              const fetchBooked = async () => {
                  try {
                      const res = await fetch(`/api/seats/${flightId}`);
                      const data = await res.json();
                      setFetchedBookedSeats(data.bookedSeats ?? []);
                  } catch (err) {
                      console.error("Failed to fetch booked seats:", err);
                  }
              };

              fetchBooked();
          }, [flightId]);


          // Generate seat letters (A, B, C, ...)
          const seatLetters = Array.from({ length: layout.seatsPerRow }, (_, i) =>
            String.fromCharCode(65 + i)
          );

          // Get seat info (category and price) based on row number
          const getSeatInfo = (rowNumber) => {
            for (const [className, info] of Object.entries(seatPricing)) {
              if (info.rows.includes(rowNumber)) {
                return { className, price: info.price };
              }
            }
            return { className: "Unknown", price: 0 };
          };

          // Handle seat selection and deselection
          const handleSeatClick = (seatLabel) => {
            if (fetchedBookedSeats.includes(seatLabel)) return;

            const rowNumber = parseInt(seatLabel.match(/\d+/)[0]);
            const { className, price } = getSeatInfo(rowNumber);
            const seatObj = { label: seatLabel, category: className, price };

            let updatedSelected;
            const isAlreadySelected = selectedSeats.some((s) => s.label === seatLabel);

            if (isAlreadySelected) {
              // Remove seat
              updatedSelected = selectedSeats.filter((s) => s.label !== seatLabel);
            } else {
              // Add seat
              if (seatSelectionCount >= MaxSeatSelection) return;
              updatedSelected = [...selectedSeats, seatObj];
            }

            // Update context
            updateBookingData({ seats: updatedSelected, totalPrice: updatedSelected.reduce((sum, s) => sum + s.price, 0) });

            // Optional callback
            // onSeatSelect(updatedSelected);

            
          };
          

  return (
    <div className="p-2 w-full flex flex-col gap-2">
      {/* Seat Rows */}
      {Array.from({ length: layout.rows }, (_, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const { className, price } = getSeatInfo(rowNumber);
        return (
          <div
            key={rowNumber}
            className={`flex gap-2 items-center ${seatPricing[className]?.style || ""}`}
          >
            {/* Row Label */}
            <span className="w-4">{rowNumber}</span>

            {/* Seat Letters */}
            {seatLetters.map((letter, seatIndex) => {
              const seatLabel = `${rowNumber}${letter}`;
              const isBooked = fetchedBookedSeats.includes(seatLabel);
              const isSelected = selectedSeats.some(
                (s) => s.label === seatLabel
              );

              let bgClass = seatTypes.available;
              if (isBooked) bgClass = seatTypes.booked;
              else if (isSelected) bgClass = seatTypes.selected;

              const seatStyle =
                seatIndex === layout.aisleAfterSeat ? { marginLeft: "1rem" } : {};

              return (
                <div
                  key={seatLabel}
                  className={`w-8 h-8 cursor-pointer rounded ${bgClass} flex items-center justify-center text-white ${isBooked ? "font-mono" : "font-bold"
                    }`}
                  style={seatStyle}
                  onClick={() => handleSeatClick(seatLabel)}
                  title={`${className} - ₹${price}`}
                >
                  {isBooked ? "X" : letter}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Summary Section */}
      <div className="mt-4 p-3 bg-gray-100/80 shadow-gray-700 rounded-lg text-center font-semibold">
        {selectedSeats.length > 0 ? (
          <>
            <div className="text-left px-4">
              <h3 className="font-semibold  mb-2">Selected Seats:</h3>
              {selectedSeats.map((s) => (
                <div
                  key={s.label}
                  className="text-sm text-gray-200 flex justify-between"
                >
                  <span className="font-medium text-gray-500">
                    {s.label} — {s.category}
                  </span>
                  <span className="font-medium text-gray-900">₹{s.price}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-lg">
              Total Price: <span className="text-gray-400">₹{totalPrice}</span>
            </div>
            
             {/* ✅ Button appears only if totalPrice > 0 */}
            {totalPrice > 0 && (
              <Payment_Button
              >
                "Proceed to Payment"
              </Payment_Button>
            )}
          </>
        ) : (
          "No seats selected"
        )}
      </div>
    </div>
  );
};

export default Seat_map;
