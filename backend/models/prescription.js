// PRESCRIPTION MODEL - MongoDB Schema Definition
// PURPOSE: Defines structure for medical prescriptions separate from SOAP notes

// Mongoose - MongoDB Object Modeling Library
import mongoose from "mongoose";

// Prescription Schema - Medical prescription structure
const prescriptionSchema = new mongoose.Schema({
  // Patient Reference - Links to patient user
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Doctor Reference - Links to doctor user
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Appointment Reference - Links to specific appointment
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

  // Prescription Details - Main prescription content
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
    quantity: { type: String }
  }],

  // Additional Instructions - Doctor's general instructions
  instructions: String,

  // Diagnosis - Medical diagnosis for this prescription
  diagnosis: String,

  // Symptoms - Patient symptoms
  symptoms: String,

  // Allergies - Patient allergies noted
  allergies: String,

  // Refill Information - Refill details
  refills: { type: Number, default: 0 },

  // Status - Prescription status
  status: { 
    type: String, 
    enum: ["active", "completed", "cancelled"], 
    default: "active" 
  },

  // Creation Timestamp - When prescription was created
  createdAt: { type: Date, default: Date.now }
});

// Export Prescription model
export default mongoose.model("Prescription", prescriptionSchema);
