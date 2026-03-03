import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("MONGODB_URI from .env:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
    process.exit(1);
  }
  console.log({
  user: "Arogyam",
  uriExists: !!process.env.MONGODB_URI,
});

};

export default connectDB;
