import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookingContext } from "../contexts/BookingContext";

///im storing all user detail in context and passing flightid in url params
const UserDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateBookingData } = useContext(BookingContext);

  // Destructure state from previous page
  const { selectedFlight, TotalPassenger } = location.state || {};

  console.log("Selected Flight:", selectedFlight);//Selected Flight: {flightID: 1, source: 'Delhi', destination: 'Mumbai', date: '2025-10-12', flightName: 'Indigo'}
  console.log("Total Passengers:", TotalPassenger);//Total Passengers: 1

  // Initialize user array with empty objects
  const [user, setUser] = useState(
    Array.from({ length: TotalPassenger || 1 }, () => ({
      name: "",
      age: "",
      gender: "",
    }))
  );

  // Handle input change
  const handleChange = (index, field, value) => {
    setUser((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Proceed to seat selection
  const handleProceed = () => {
    if (!selectedFlight) {
      alert("No flight selected!");
      return;
    }

    // Validate all fields
    if (user.some((u) => !u.name || !u.age || !u.gender)) {
      alert("Please fill in all fields for each passenger.");
      return;
    }

    // Save user data to context
    updateBookingData({
      user,
      selectedFlight: selectedFlight,
    });


    console.log("yeh user detail gya tere context me:", user);
    console.log("Im passing this flight id to SeatSelect ", selectedFlight.flightID);
    // Navigate to seat selection page
    navigate(`/flight/${selectedFlight.flightID}/seatselect`, {
      state: { flightId: selectedFlight.flightID, TotalPassenger: TotalPassenger }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-6 text-center">Passenger Details</h1>

      {selectedFlight ? (
        <p className="mb-6 text-center">
          Flight: {selectedFlight.flightName} ({selectedFlight.source} →{" "}
          {selectedFlight.destination})
        </p>
      ) : (
        <p className="mb-6 text-center text-red-500">No flight selected!</p>
      )}

      {user.map((u, i) => (
        <div
          key={i}
          className="bg-gray-200 p-6 rounded-lg mb-4 shadow-lg border border-gray-300"
        >
          <h3 className="text-lg font-semibold mb-3">
            Passenger {i + 1}
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={u.name}
              onChange={(e) => handleChange(i, "name", e.target.value)}
              className="flex-2 w-full h-10 md:w-1/2 border border-black mb-3 p-2 rounded text-black"
            />

            <input
              type="number"
              placeholder="Age"
              value={u.age}
              onChange={(e) => handleChange(i, "age", e.target.value)}
              className="flex-1 w-full h-10 md:w-1/2 border border-black p-2 rounded text-black"
            />

            <select
              value={u.gender}
              onChange={(e) => handleChange(i, "gender", e.target.value)}
              className="flex-1 w-full h-10 md:w-1/4 border border-black mb-3 p-2 rounded text-black"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      ))}

      <button
        className="px-4 py-2 my-auto max-md:w-full text-white rounded mt-4 
                   bg-gradient-to-r from-black to-gray-600 
                   hover:from-gray-500 hover:to-black 
                   active:scale-95 transition-all duration-200 
                   shadow-md hover:shadow-lg"
        onClick={handleProceed}
      >
        Proceed to seat selection
      </button>
    </div>
  );
};

export default UserDetails;
