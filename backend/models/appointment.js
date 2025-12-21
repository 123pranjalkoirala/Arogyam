import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: String,
    time: String,
    reason: String,
    status: { type: String, default: "pending" }, // pending / approved / rejected / completed
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
