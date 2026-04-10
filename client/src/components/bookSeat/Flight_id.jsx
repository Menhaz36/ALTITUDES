import React from 'react'
import '../../App.css'
import './FLight_id.css'
import Seat_map from './Seat_map'
import { useLocation } from 'react-router-dom'


function Flight_id({ bookedSeats = [], MaxSeatSelection = 1, flightId }) {

  const location = useLocation();
  console.log('data passed through params      :', location.state);

  return (
   <div className="flex gap-6"> 
      <div className="plane">
        <div className="cockpit">
          <h1></h1>
        </div>
        <div className="exit exit--front fuselage"></div>
        <div className="fuselage">
          <Seat_map 
          bookedSeats={bookedSeats} 
          MaxSeatSelection={MaxSeatSelection}
          flightId={flightId}
          />
        </div>{/*here i need to add props */}
        <div className="exit exit--front fuselage"></div>
      </div>
        <div className="p-2 bg-gray-100 rounded shadow-md w-60">
          <h3 className="font-semibold text-center text-base mt-40  mb-2">Seat Legend</h3>
          <table className="w-full text-left text-base mx-auto">
            <tbody>
              <tr>
                <td>Available</td>
                <td>
                  <div className="w-4 h-4 border border-gray-500 bg-gray-500/50 rounded"></div>
                </td>
              </tr>
              <tr>
                <td>Booked</td>
                <td>
                  <div className="w-4 h-4 border border-red-500 bg-red-500/50 rounded"></div>
                </td>
              </tr>
              <tr>
                <td>Selected</td>
                <td>
                  <div className="w-4 h-4 border border-blue-600 bg-blue-500 rounded"></div>
                </td>
              </tr>
              <tr>
                <td>Business</td>
                <td>
                  <div className="w-4 border border-lime-400 h-4 bg-lime-400/20 rounded"></div>
                </td>
              </tr>
              <tr>
                <td>Premium</td>
                <td>
                  <div className="w-4 h-4 border border-blue-400 bg-blue-400/20 rounded"></div>
                </td>
              </tr>
              <tr>
                <td>Economy</td>
                <td>
                  <div className="w-4 h-4 border border-purple-400 bg-purple-400/20 rounded"></div>
                </td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
     
  )
}

export default Flight_id;