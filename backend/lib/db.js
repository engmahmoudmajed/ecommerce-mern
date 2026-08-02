import mongoose from "mongoose";
import "dotenv/config"; 


export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.log(`Error connection To MongoDB : ${error}`);
    process.exit(1);
  }
}