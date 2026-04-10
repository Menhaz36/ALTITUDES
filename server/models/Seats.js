import mongoose, {Schema} from "mongoose";

const seatSchema = new Schema({
    _id : {
        type: String,
        required: true
    },
    flightId : {
        type: Schema.Types.ObjectId,
        ref : "Flights",
        required: true
    },
    seatNumber : {
        type: String,
        required: true
    },
    status : {
        type: String,
        enum: ["available", "booked"],
        default: "available"
    }, 
    category : {
        type: String,
        enum: ["economy", "business", "first"],
        required: true
    },
    price : {
        type: Number,
        required: true
    }
} , {timestamps: true});

export const FlightSeats = mongoose.model("FlightSeats", seatSchema);