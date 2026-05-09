// USER MODEL - MongoDB Schema Definition
 
// PURPOSE: Defines the structure and validation rules for user documents in MongoDB.
 
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
    isNewPatient: { type: Boolean, default: true },
    
    // Total Visit Count
    // Type: Number

    totalVisits: { type: Number, default: 0 },
    
    // Last Visit Date
    lastVisitDate: { type: Date, default: Date.now },
    
    // Medical History Array
    medicalHistory: [{
      // Visit Date
      date: Date,
      
      // Visit Type
      type: String,
      
      // Attending Doctor ID
      doctorId: mongoose.Schema.Types.ObjectId,
      
      // Clinical Notes
 
      notes: String,
      
      // Diagnosis
 
      diagnosis: String,
      
      // Prescription Information
 
      prescription: String
    }],

    // DOCTOR-SPECIFIC FIELDS - Professional Information
    // These fields are only relevant for doctors but exist in all user documents
 
    specialization: String,
    
    // Years of Experience
 
    experience: Number,
    
    // Medical Qualification
   
    qualification: String,
    
    // Consultation Fee
 
    consultationFee: Number,
    
    // Professional Biography
 
    bio: String,
    
    // Doctor Approval Status - Only for doctors
    isApproved: { type: Boolean, default: false }
  },
  
  // SCHEMA OPTIONS
 
  { timestamps: true }
);
 
export default mongoose.model("User", userSchema);

 
