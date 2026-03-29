// ========================================
// REPORT MODEL - MongoDB Schema Definition
// ========================================
// 
// PURPOSE: Defines structure for medical reports and prescription documents in MongoDB.
// This model manages uploaded medical documents including prescriptions,
// lab results, and other medical records with SOAP-like fields.
// 
// ARCHITECTURE: Uses Mongoose ODM with proper relationships to User and
// Appointment models, file management, and medical documentation.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// Mongoose - MongoDB Object Modeling Library
import mongoose from "mongoose";

// Report Schema - Medical document structure
const reportSchema = new mongoose.Schema({
  // Patient Reference - Links to patient user
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Doctor Reference - Links to doctor user
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  
  // Appointment Reference - Links to specific appointment
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

  // Document Title - Report/prescription name
  title: String,
  
  // File URL - Path to uploaded document
  fileUrl: String,

  // SOAP-like Medical Information - Clinical documentation
  subjective: String,   // Patient symptoms/complaints
  objective: String,   // Doctor observations/findings
  assessment: String,  // Medical diagnosis
  plan: String,        // Treatment recommendations

  // Creation Timestamp - When report was uploaded
  createdAt: { type: Date, default: Date.now }
});

// Export Report model
export default mongoose.model("Report", reportSchema);
