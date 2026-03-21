// backend/models/user.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    },
    password: String,
    googleId: String,
    picture: String,
    isVerified: { type: Boolean, default: false },

    // Common fields
    phone: String,
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    dateOfBirth: Date,

    // Patient-specific fields
    isNewPatient: { type: Boolean, default: true },
    totalVisits: { type: Number, default: 0 },
    lastVisitDate: { type: Date, default: Date.now },
    medicalHistory: [{
      date: Date,
      type: String, // "consultation", "followup", "emergency"
      doctorId: mongoose.Schema.Types.ObjectId,
      notes: String,
      diagnosis: String,
      prescription: String
    }],

    // Doctor-specific fields
    specialization: String,
    experience: Number,
    qualification: String,
    consultationFee: Number,
    bio: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
