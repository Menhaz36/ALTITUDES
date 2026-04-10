import { Router } from 'express';
import {
  handleSearchFlights,
  handleGetAirport,
  handleGetRoute,
} from '../controllers/flightcontroller.js';

import {
  handleSearchFlight
} from '../controllers/duffel_fController.js';

const router = Router();

router.post('/search_flights', handleSearchFlights);       // POST /flights/search
router.post('/search_duffel', handleSearchFlight);       // POST /flights/search_duffel
router.post('/airport/:iata', handleGetAirport);   // POST /flights/airport/JFK
router.post('/route', handleGetRoute);             // POST /flights/route

export default router;