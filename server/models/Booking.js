import mongoose, {Schema} from "mongoose";

const bookingSchema = new Schema({
    userId : {
        type: String,
        ref: "User",
        required: true
    },
    flightId : {
        type: String,
        required: true
    },
    flightName : {
        type: String
    },
    seats : [
        {
            label : {
                type: String,
                required: true
            },
            category : {
                type: String,
            },
            price : {
                type: Number,
            }
        }
    ],
    source : {
        type : String
    },
    destination : {
        type: String
    },
    date : {
        type: Date
    },
    totalPrice : {
        type: Number,
        required: true
    },
    passengers: [ 
        {
            name: String,
            age: Number,
            gender: String
        }
    ],
    bookingDate : {
        type: Date,
        default: Date.now
    }
} , {timestamps: true});

bookingSchema.index({ flightId: 1, "seats.label": 1 }, { unique: true, sparse : true }); // Ensure unique seat bookings per flight

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;