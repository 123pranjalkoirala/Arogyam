// ========================================
// SOAP NOTE MODEL - Professional Medical Documentation
// ========================================
// 
// PURPOSE: Defines structure for SOAP (Subjective, Objective, Assessment, Plan) notes.
// This model manages clinical documentation with proper medical workflow and
// digital signature capabilities for legal compliance.
// 
// ARCHITECTURE: Uses Mongoose ODM with relationships to User and Appointment
// models, proper validation, and audit trail capabilities.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// Mongoose - MongoDB Object Modeling Library
import mongoose from "mongoose";

// SOAP Note Schema - Clinical documentation structure
const soapNoteSchema = new mongoose.Schema({
  // Appointment Reference - Links to specific appointment
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  
  // Patient Reference - Links to patient user
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Doctor Reference - Links to doctor user
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // ========================================
  // SOAP COMPONENTS - Standard Medical Documentation Format
  // ========================================
  
  // Subjective - Patient's reported symptoms and complaints
  subjective: {
    type: String,
    required: true,
    trim: true
  },
  
  // Objective - Doctor's clinical observations and findings
  objective: {
    type: String,
    required: true,
    trim: true
  },
  
  // Assessment - Medical diagnosis and evaluation
  assessment: {
    type: String,
    required: true,
    trim: true
  },
  
  // Plan - Treatment recommendations and follow-up actions
  plan: {
    type: String,
    required: true,
    trim: true
  },
  
  // ========================================
  // FOLLOW-UP INFORMATION - Next appointment planning
  // ========================================
  
  followUp: {
    // Follow-up Date - When next appointment is scheduled
    date: Date,
    
    // Follow-up Notes - Additional instructions for next visit
    notes: String,
    
    // Follow-up Type - How follow-up will be conducted
    type: {
      type: String,
      enum: ['in_person', 'telemedicine', 'emergency']
    }
  },
  
  // ========================================
  // METADATA - Document status and timestamps
  // ========================================
  
  // Document Status - Current state of SOAP note
  status: {
    type: String,
    enum: ['draft', 'completed', 'signed'],
    default: 'draft'
  },
  
  // Creation Timestamp - When SOAP note was created
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Last Update Timestamp - When SOAP note was last modified
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // ========================================
  // DIGITAL SIGNATURE - Legal compliance and authentication
  // ========================================
  
  doctorSignature: {
    // Signature Timestamp - When doctor signed the document
    timestamp: Date,
    
    // IP Address - Where the signature was made from
    ipAddress: String
  }
});

// ========================================
// MIDDLEWARE - Pre-save hook for timestamp management
// ========================================

// Update updatedAt field before saving
soapNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ========================================
// DATABASE INDEXES - Query optimization
// ========================================

// Index for efficient appointment-based queries
soapNoteSchema.index({ appointmentId: 1 });

// Index for efficient patient-based queries
soapNoteSchema.index({ patientId: 1 });

// Index for efficient doctor-based queries
soapNoteSchema.index({ doctorId: 1 });

// Export SOAP Note model
export default mongoose.model('SOAPNote', soapNoteSchema);
