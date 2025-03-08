import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
export const connectDB = () => {
  mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));
};