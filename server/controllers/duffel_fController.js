
import { searchFlightsDuffel } from '../services/duffel_fServices.js';


export const handleSearchFlight = async (req, res) => {
    try{
        const { 
            source,
            destination,
            departureDate,// format YYYY-MM-DD
            returnDate = null, // optional, for round trips
            adults = 1,
            children = 0,
            cabinClass = "economy",

        } = req.body;
        console.log("1. Backend received request:", req.body);
        
        if( !source || !destination || !departureDate){
            return res.status(400).json({ error: 'source, destination and departureDate are required' });
        }

        if (new Date(departureDate) <= new Date()) {
            return res.status(400).json({
            error: "departureDate must be a future date.",
            });
        }

        // Call the service function to search for flights
        const flights = await searchFlightsDuffel({
            source,
            destination,
            departureDate,
            returnDate,
            adults,
            children,
            cabinClass
        });
        console.log("4. Service returned results successfully");
        res.json([flights]); // wrapped in array — frontend does response.data[0] 
    }
    catch(error){
        console.error('Error searching flights:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}