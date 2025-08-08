import mongoose from "mongoose";

const DB_URI = process.env.MONGO_URI;

export const connectDB = async () => {
    try {
        if(!DB_URI) throw new Error("MONGO_URI is not provided in env file");

        await mongoose.connect(DB_URI, {})
        console.log("DB connected");
    } catch (error) {
        console.log(error);
    }
}
