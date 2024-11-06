import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(connectionString);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export default connectDB;
