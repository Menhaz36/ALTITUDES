import React, { useEffect, useState } from "react";
import axios from "axios";
import Flight_id from "../components/bookSeat/Flight_id";
import { UseBooking } from "../contexts/Useboooking";
import { useLocation } from "react-router-dom";  //read the state passed via navigate

const SeatSelect = () => {
  const { bookingData } = UseBooking();
  const selectedFlight = bookingData?.selectedFlight;
  const location = useLocation();

  const totalPassenger = location.state?.TotalPassenger || 1;  //navigate se pass hua tha
  
  const [flight, setFlight] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine flight ID from context or location
    const flightId = selectedFlight?.flightID ?? location.state?.flightId;
    if (!flightId) return;
    console.log("Fetching data for Flight ID:", flightId);
    console.log("totalPassenger in SeatSelect:", totalPassenger);

  //   const fetchFlightData = async () => {
  //     try {
  //       const response = await axios.get(`/api/flight/${flightId}`); //PHIR SE API CALL KI ZARURAT NAHI DB SE FETCH KR LENGE
  //       const flightData = response.data; 

  //       setFlight(flightData);

  //       // Map booked seats
  //       // Assuming your API returns only booked seats  
  //       //API SEAT RETURN HI NAHI KARTAAAAAA ToT
  //       const booked = flightData?.map(seat => seat.SeatNumber) ?? [];
  //       setBookedSeats(booked);

  //       console.log("Flight ID requested:", flightId);
  //       console.log("Booked seat response:", flightData);
  //     } catch (error) {
  //       console.error("Error fetching flight:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchFlightData();
  // }, [selectedFlight, location.state]);

  const fetchBookedSeats = async () => {
      try {
        //  Hit YOUR MongoDB, not Duffel
        const response = await axios.get(`/api/seats/${flightId}`); //find booked seats so that seatmap can disable them
        setBookedSeats(response.data.bookedSeats ?? []);
      } catch (error) {
        console.error("Error fetching booked seats:", error);
        setBookedSeats([]); //  don't block the seat map
      } finally {
        setLoading(false);
      }
    };
    fetchBookedSeats();
  }, [selectedFlight, location.state]);

  if (!selectedFlight) {
    return (
      <p className="text-lg text-center text-red-500 mt-10">
        Please select a flight first.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-lg text-center text-gray-600 mt-10">
        Loading flight seats...
      </p>
    );
  }

//problem is ki length nhi nikal sakte kyuki flightdata array hai nhi.

  // if (!flight?.length) { 
  //   return (
  //     <p className="text-lg text-center text-gray-600 mt-10">
  //       No seats available for this flight.
  //     </p>
  //   );
  // }

  //ABHI KE LIYE COMMENT OUT KAR DI HU TAKI SEAT PAGE RENDER HO SAKE.
  

  return (
      <>
      {/* <h1 className="text-2xl font-bold text-center mb-6">
        Seat Selection - {selectedFlight.flightName}
      </h1> */}

        <Flight_id 
          bookedSeats={bookedSeats} 
          MaxSeatSelection={totalPassenger} 
          flightId={selectedFlight?.FlightID ?? location.state?.flightId} /> 
      </> //flightId bhi pass kar rshe taki wo post ho sake seat select krne pe
      //yaha pe selectedflight.flightID use karenge if available, otherwise jo naviagate se aya tha wo use hoga
  );  //not much of a difference, just to make sure ki mess up naa ho jaye. sort of a fallback mechanism.
};

export default SeatSelect;
