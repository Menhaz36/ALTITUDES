import React, { useEffect, useRef } from 'react'
import { UseBooking } from '../../contexts/Useboooking.jsx'
import '../../App.css'
import './final.css'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Final = () => {

    const { bookingData } = UseBooking();
    const navigate = useNavigate();
    const hasBooked = useRef(false);

    console.log(bookingData);

    //will directly store the booking data to the backend from here 
    // useEffect(() => {
    //     // Make an API call to store booking data
    //     const storeBookingData = async () => {
    //         try {
    //             const response = await fetch('/api/bookings', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(bookingData),
    //             });

    //             if (!response.ok) {
    //                 throw new Error('Failed to store booking data');
    //             }
    //             alert("Booking Successful!");
    //             const data = await response.json();
    //             console.log('Booking data stored successfully:', data);
    //         } catch (error) {
    //             console.error('Error storing booking data:', error);
    //         }
    //     };

    //     storeBookingData();
    // }, [bookingData]);
        useEffect(() => {
            if (!bookingData?.seats?.length) return; // ✅ guard against empty bookingData
            if(hasBooked.current) return;
            hasBooked.current = true; // ensure we only attempt to book once per session
            const storeBookingData = async () => {
                try {
                    const token = localStorage.getItem("accessToken"); // ✅ get JWT token
                    console.log("Token found:");
                    console.log(bookingData);
                    const response = await axios.post('/api/seats/bookings', bookingData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,  // ✅ send JWT
                        },
                    });

                    if (response.status !== 200) {
                        throw new Error('Failed to store booking data');
                    }
                    alert("Booking Successful!");
                    console.log('Booking data stored successfully:', response.data);
                } catch (error) {
                    console.error('Error storing booking data:', error);
                }
            };

            storeBookingData();
        }, []);  // ✅ changed from [bookingData] to [] — only run once on mount

        useEffect(() => {
            // Push a new state so there is something to "go back" to 
            // that isn't the previous page
            window.history.pushState(null, null, window.location.pathname);

            const handleBackButton = (e) => {
                // Prevent the back movement
                window.history.pushState(null, null, window.location.pathname);
                alert("Booking confirmed. You cannot go back to the payment page.");
            };

            window.addEventListener('popstate', handleBackButton);

            return () => {
                window.removeEventListener('popstate', handleBackButton);
            };
        }, []);

    

    return (
      <div className="container mx-auto p-6 space-y-6 ">
                {/* Title */}
                <h1 className="text-3xl font-bold text-center text-white/80">Final Booking Summary</h1>

                {/* User Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">User Information</h2>
                    {bookingData.user.map((item, index) => (
                    <div key={index} className="space-y-1 border-b border-gray-200 last:border-b-0 pb-2 mb-2">
                        <p><span className="font-medium text-gray-600">Name:</span> {item.name}</p>
                        <p><span className="font-medium text-gray-600">Age:</span> {item.age}</p>
                        <p><span className="font-medium text-gray-600">Gender:</span> {item.gender}</p>
                    </div>
                    ))}
                </div>

                {/* Flight Information */}
                <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Selected Flight</h2>
                    <p><span className="font-medium text-gray-600">Flight Name:</span> {bookingData.selectedFlight.flightName}</p>
                    <p><span className="font-medium text-gray-600">From:</span> {bookingData.selectedFlight.source}</p>
                    <p><span className="font-medium text-gray-600">To:</span> {bookingData.selectedFlight.destination}</p>
                    <p><span className="font-medium text-gray-600">Date:</span> {bookingData.selectedFlight.date}</p>

                    {/* Seats */}
                    <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Selected Seats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {bookingData.seats.map((s, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-md p-3 shadow-sm">
                            <p><span className="font-medium text-gray-600">Seat:</span> {s.label}</p>
                            <p><span className="font-medium text-gray-600">Category:</span> {s.category}</p>
                            <p><span className="font-medium text-gray-600">Price:</span> ₹{s.price}</p>
                        </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* Total Price */}
                <div className="bg-gray-100 p-4 rounded-md text-center shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800">
                    Total Price: <span className="text-green-600">₹{bookingData.totalPrice}</span>
                    </h2>
                </div>
                <div className="flex justify-center mt-6">
                    <button 
                        onClick={() => navigate('/', { replace: true })}
                        className="bg-white-80 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-600 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
                </div>


    )
}

export default Final