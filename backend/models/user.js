// ========================================
// USER MODEL - MongoDB Schema Definition
// 
// PURPOSE: Defines the structure and validation rules for user documents in MongoDB.
// This model handles all user types (patients, doctors, admins) with role-specific fields.
// 
// ARCHITECTURE: Uses Mongoose ODM for MongoDB interaction with proper validation,
// indexing, and relationship management.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// IMPORTS
// 
// Mongoose - MongoDB Object Modeling Library
// Purpose: Provides schema validation, casting, and business logic hooks
// Usage: Creates and manages MongoDB schemas and models
import mongoose from "mongoose";

// User Schema - MongoDB model for users
const userSchema = new mongoose.Schema(
  {
    // Core user fields
    name: String,                    // User full name
    email: { type: String, unique: true }, // Email address (unique)
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    },                                    // User role
    password: String,                 // Hashed password
    googleId: String,                 // Google OAuth ID
    picture: String,                   // Profile picture URL
    isVerified: { type: Boolean, default: false }, // Email verification status

    // Demographic information
    phone: String,                    // Phone number
    gender: { type: String, enum: ["male", "female", "other"] }, // Gender
    address: String,                  // Physical address
    dateOfBirth: Date,                // Date of birth

    // PATIENT-SPECIFIC FIELDS - Medical History Tracking
    // These fields are only relevant for patients but exist in all user documents
    
    // New Patient Status
    // Type: Boolean
    // Default: true - indicates first-time visit
    // Usage: Determines pricing, appointment requirements, welcome messaging
    // Business Logic: Changes to false after first completed appointment
    isNewPatient: { type: Boolean, default: true },
    
    // Total Visit Count
    // Type: Number
    // Default: 0 - increments with each appointment
    // Usage: Patient loyalty, analytics, reporting
    // Business Logic: Updated automatically when appointments are completed
    totalVisits: { type: Number, default: 0 },
    
    // Last Visit Date
    // Type: Date
    // Default: Current timestamp
    // Usage: Follow-up scheduling, patient engagement analytics
    // Business Logic: Updated after each completed appointment
    lastVisitDate: { type: Date, default: Date.now },
    
    // Medical History Array
    // Type: Array of medical history objects
    // Required: No (empty array for new patients)
    // Usage: Comprehensive medical record tracking
    // Structure: Each entry contains visit details and medical information
    // Privacy: Highly sensitive medical data with strict access controls
    medicalHistory: [{
      // Visit Date
      // Type: Date
      // Usage: When the medical event occurred
      // Importance: Chronological ordering of medical history
      date: Date,
      
      // Visit Type
      // Type: String
      // Values: "consultation", "followup", "emergency"
      // Usage: Categorize medical events for better organization
      // Business Logic: Different pricing and procedures for different types
      type: String,
      
      // Attending Doctor ID
      // Type: ObjectId (Reference to User model)
      // Usage: Link medical history to specific doctor
      // Relationship: Many-to-one with Users collection (doctors)
      doctorId: mongoose.Schema.Types.ObjectId,
      
      // Clinical Notes
      // Type: String
      // Usage: Doctor's notes and observations
      // Importance: Free-text clinical documentation
      notes: String,
      
      // Diagnosis
      // Type: String
      // Usage: Medical diagnosis from the visit
      // Importance: Critical medical information for future reference
      diagnosis: String,
      
      // Prescription Information
      // Type: String
      // Usage: Medication and treatment prescribed
      // Importance: Medication history and allergy tracking
      prescription: String
    }],

    // DOCTOR-SPECIFIC FIELDS - Professional Information
    // These fields are only relevant for doctors but exist in all user documents
    
    // Medical Specialization
    // Type: String
    // Required: No (but required for doctors)
    // Usage: Doctor's area of medical expertise
    // Examples: "Cardiology", "Pediatrics", "General Practice"
    // Business Logic: Determines appointment types and patient matching
    specialization: String,
    
    // Years of Experience
    // Type: Number
    // Required: No (but required for doctors)
    // Usage: Professional experience tracking
    // Business Logic: May affect consultation fees and patient trust
    experience: Number,
    
    // Medical Qualification
    // Type: String
    // Required: No (but required for doctors)
    // Usage: Medical degrees and certifications
    // Examples: "MD", "MBBS", "Board Certified"
    // Verification: Should be verified during doctor registration
    qualification: String,
    
    // Consultation Fee
    // Type: Number
    // Required: No (but required for doctors)
    // Usage: Cost per appointment for this doctor
    // Currency: Local currency (NPR for Nepali market)
    // Business Logic: Directly affects patient pricing and doctor revenue
    consultationFee: Number,
    
    // Professional Biography
    // Type: String
    // Required: No
    // Usage: Professional background and introduction
    // Display: Shown in doctor profile for patient selection
    // Marketing: Helps patients choose appropriate doctors
    bio: String
  },
  
  // SCHEMA OPTIONS
  
  // Timestamps Option
  // Purpose: Automatically adds createdAt and updatedAt fields
  // CreatedAt: When the user document was first created
  // UpdatedAt: Last time the document was modified
  // Usage: Audit trail, data lifecycle management, analytics
  { timestamps: true }
);

// MODEL EXPORT
// 
// Export the Mongoose model for use in the application
// Model Name: "User" (singular, Mongoose creates "users" collection)
// Usage: Import in controllers, routes, and other parts of the application
// Methods: Provides CRUD operations and query capabilities

export default mongoose.model("User", userSchema);

// MODEL USAGE EXAMPLES
/*
// Creating a new user
const newUser = new User({
  name: "Dr. John Smith",
  email: "john@medical.com",
  role: "doctor",
  password: "hashedPassword",
  specialization: "Cardiology",
  experience: 10,
  consultationFee: 1500
});

// Finding users by role
const doctors = await User.find({ role: "doctor" });
const patients = await User.find({ role: "patient" });

// Updating patient visit history
await User.findByIdAndUpdate(patientId, {
  $push: {
    medicalHistory: {
      date: new Date(),
      type: "consultation",
      doctorId: doctorId,
      notes: "Patient presented with chest pain",
      diagnosis: "Hypertension",
      prescription: "ACE inhibitors"
    }
  },
  $inc: { totalVisits: 1 },
  lastVisitDate: new Date(),
  isNewPatient: false
});

// Authentication lookup
const user = await User.findOne({ email: "patient@example.com" });
*/
