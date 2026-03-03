import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  day: String,
  slots: [String]
});

export default mongoose.model("Availability", availabilitySchema);
