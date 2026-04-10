import "dotenv/config";
import express from "express"
import cors from "cors"
import connectDB from "./configs/db.js";
import authRoutes from './routes/user.js';
import axios from "axios";
import flightRoutes from './routes/flightroutes.js';
import seatRoutes from './routes/seatRoutes.js';
import agentRoutes from './routes/agentRoutes.js';



connectDB()
const app = express();
app.use(express.json());
app.use(cors());



app.get('/', (req,res)=>res.send("Api is working"));



const PORT = process.env.PORT || 3000;



app.use('/api', authRoutes);
app.use('/api', flightRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api', agentRoutes);

app.listen(PORT, ()=> console.log("working"))