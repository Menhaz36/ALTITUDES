import mongoose from "mongoose";
import "dotenv/config"

const connectDB = async () => {
    try{
        //console.log("URI:", process.env.MONGODB_URI);
        mongoose.connection.on("connected", () => console.log("MongoDB connected successfully"));
        await mongoose.connect(`${process.env.MONGODB_URI}/altitudes`);
    } catch (error) {
        console.error(error.message);
    }
}

export default connectDB;
