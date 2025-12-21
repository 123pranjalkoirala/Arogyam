import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
  title: String,
  fileUrl: String,
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);
