// Importing mongoose library along with Connection type from it
import mongoose from "mongoose";

let cachedConnection = null;

export default async function dbConnect() {
  if (cachedConnection) {
    console.log("Using cached db connection");
    return cachedConnection;
  }

  try {
    const cnx = await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URL);
    cachedConnection = cnx.connection;
    console.log("New mongodb connection established");
    return cachedConnection;
  } catch (error) {
    console.error("DB connection error:", error);
    throw error;
  }
}
