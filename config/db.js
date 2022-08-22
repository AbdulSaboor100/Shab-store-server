import mongoose from "mongoose";
import config from "config";
const db = config.get("mongoURI");

export const connectDb = async () => {
  try {
    await mongoose.connect(db);
    console.log("Mongodb connected");
  } catch (error) {
    console.log(error);
  }
};
