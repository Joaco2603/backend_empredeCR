import mongoose from "mongoose";

const DB_URI = 'mongodb://localhost:27017/EmprendeSanJose';

export const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {})
        console.log("DB connected");
    } catch (error) {
        console.log(error);
    }
}
