import mongoose, {Schema} from "mongoose";

const routeSchema = new Schema({
    _id : {
        type: String,
        required: true
    },
    source : {
        type: String,
        required: true
    }, 
    destination : {
        type: String,
        required: true
    },
    date : {
        type: Date,
        required: true
    },
    distance : {
        type: Number,
        required: true
    }
} , {timestamps: true});

export const FlightRoutes = mongoose.model("FlightRoutes", routeSchema);