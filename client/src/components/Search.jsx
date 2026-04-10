import React from 'react';
import axios from 'axios'; // run this-> npm i axios
import { cityToIATA } from '../utils/iataMap.js';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {

    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [TotalPassenger, setTotalPassenger] = useState(1);

    const [flights, setFlights] = useState(null); // <-- null means "not searched yet"

    const SearchForFlights = async (source, destination, date) => {

        try {
            console.log('Searching flights with:', { source, destination, date });
            const from = cityToIATA[source] ?? source; // fallback to raw input
             const to   = cityToIATA[destination] ?? destination;
            console.log('date: ', {date});

            const response = await axios.post('/api/search_duffel', { 
                source: from,
                destination: to,
                departureDate: date
                });

            const flightsData = response.data[0];///YAHA TUMHARA RECIEVE HOGAAAA
            setFlights(flightsData);
        } catch (error) {
            console.error('Error searching flights:', error);
            setFlights([]);
        }
    };

    const navigate = useNavigate();

    const handleClick = (flightID, flightName) => {
        navigate(`/flight/${flightID}`, {
            state: {
                selectedFlight: { flightID, source, destination, date, flightName }, // nested flight object
                TotalPassenger
            }
        });
        console.log('Flight ID clicked:', flightID);
    }//here i can pass state 

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                SearchForFlights(source, destination, date);
            }}
            className='shadow-2xl/35 mt-20 bg-white/10 border-2 border-cyan-800 text-gray-500 rounded-lg px-20 py-15  flex flex-col md:flex-row max-md:items-start gap-6 max-w-5xl mx-auto'>


            <div className='flex flex-col'>
                <div className="flex flex-wrap gap-6 md:gap-10 max-md:gap-4 justify-center w-full ">

                    {/*from*/}
                    <div className="flex flex-col w-full sm:w-[45%] md:w-[30%] xl:w-[27%]">
                        <label htmlFor="from" className="mb-1 font-medium">From</label>
                        <input
                            id="from"
                            list="city-list"
                            type="text"
                            placeholder="Type or choose source"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full rounded border border-gray-300 px-4 py-3 text-base outline-none focus:border-cyan-700"
                            required
                        />

                        <datalist id="city-list">
                            <option value="Delhi" />
                            <option value="Mumbai" />
                            <option value="Bangalore" />
                            <option value="Kolkata" />
                            {/* <option value="Hyderabad" /> */}
                            {/* <option value="Pune" /> */}
                        </datalist>
                    </div>

                  <div className='flex flex-col w-full sm:w-[45%] md:w-[30%] xl:w-[27%]'>
                    <label htmlFor="to">To</label>
                        <input
                            id="to"
                            list="destination-list"
                            type="text"
                            placeholder="Destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full rounded border border-gray-300 px-4 py-3 mt-1 text-base outline-none focus:border-cyan-700"
                            required
                        />

                        <datalist id="destination-list">
                            <option value="Delhi" />
                            <option value="Mumbai" />
                            <option value="Bangalore" />
                            <option value="Kolkata" />
                            <option value="Hyderabad" />
                            <option value="Pune" />
                        </datalist>
                    </div>


                    {/*depart*/}
                    <div>
                        <div className='flex items-center gap-2'>
                            <svg className="w-4 h-4 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z" />
                            </svg>
                            <label htmlFor="depart" className="block font-medium">Departure</label>
                        </div>
                        <input id="depart" type="date" value={date} onChange={(e) => setDate(e.target.value)} className=" rounded border border-gray-300 px-4 py-3 mt-1 text-base outline-none focus: border-b-cyan-700" />
                    </div>

                    {/*passengers*/}
                    <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                        <label htmlFor="passenger">Passengers</label>
                        <input min={1} id="passenger" type="number" className=" rounded border border-gray-300 px-3 py-2 mt-1.5 text-base outline-none focus: border-b-cyan-700  max-w-16" placeholder="0" value={TotalPassenger} onChange={(e) => setTotalPassenger(e.target.value)} />
                    </div>

                    {/*class*/}
                    {/* <div className="flex flex-col">
                        <label htmlFor="class">Class</label>
                        <select id="class" className=" rounded border border-gray-300 px-4 py-3 mt-1.5 text-base outline-none focus: border-b-cyan-700">
                            <option value="economy">Economy</option>
                            <option value="business">Business</option>
                            <option value="first">First Class</option>
                        </select>
                    </div> */}


                    <button className="mt-7 w-64 flex items-center justify-center gap-2 rounded-md bg-linear-to-r from-black to-gray-600 shadow-2xl/35 py-3 px-6 text-white font-medium my-auto cursor-pointer max-md:w-full max-md:py-2 
                hover:from-gray-500 hover:to-black active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg" onClick={() => {

                            SearchForFlights(source, destination, date)
                        }}
                    >
                        <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                        </svg>
                        <span>Search</span>

                    </button>


                </div>


                <div className="mt-6 w-full ">
                    {flights === null ? null : //if null return null
                        flights.length === 0 ? (
                            <p className="text-center text-black font-semibold">No flights found</p>//if not null but empty [] means no flights found
                        ) : (
                            flights.map(f => (
                                <div
                                    key={f.FlightID}
                                    className="p-2 border-b bg-blend-soft-light mix-blend-luminosity rounded-md mb-2 hover:bg-black cursor-pointer "
                                    onClick={() => handleClick(f.FlightID, f.FlightName)}
                                >
                                    <span className='font-semibold text-center hover:text-amber-50'>{f.FlightID}. {f.FlightName} : {f.Source} → {f.Destination} on {new Date(f.ArrivalTime).toLocaleString()}</span>
                                </div>
                            ))
                        )
                    }
                </div>

            </div>





        </form>
    );
}

export default Search;


