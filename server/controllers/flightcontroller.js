import { searchFlights, getAirportInfo, getRouteInfo } from '../services/flightServices.js';

export const handleSearchFlights = async (req, res) => {
  try {
    const { source, destination, date } = req.body;
    console.log("1. Backend received request:", req.body);

    if (!source || !destination) {
      return res.status(400).json({ error: 'source and destination are required' });
    }

    const flights = await searchFlights({ source, destination, date });
    console.log("4. Service returned results successfully");
    res.json([flights]); // wrapped in array — frontend does response.data[0]

  } catch (err) {
    console.error("BACKEND CONTROLLER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const handleGetAirport = async (req, res) => {
  try {
    const { iata } = req.params;
    const airport = await getAirportInfo(iata.toUpperCase());
    res.json({ success: true, data: airport });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const handleGetRoute = async (req, res) => {
  try {
    const { origin, destination } = req.query;
    const route = await getRouteInfo({ origin, destination });
    res.json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};