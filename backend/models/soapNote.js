// SOAP Note Model - Professional Medical Documentation
import mongoose from "mongoose";

const soapNoteSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // SOAP Components
  subjective: {
    type: String,
    required: true,
    trim: true
  },
  objective: {
    type: String,
    required: true,
    trim: true
  },
  assessment: {
    type: String,
    required: true,
    trim: true
  },
  plan: {
    type: String,
    required: true,
    trim: true
  },
   
  
  
  
   
 
  followUp: {
    date: Date,
    notes: String,
    type: {
      type: String,
      enum: ['in_person', 'telemedicine', 'emergency']
    }
  },
  
  // Metadata
  status: {
    type: String,
    enum: ['draft', 'completed', 'signed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Digital Signature
  doctorSignature: {
    timestamp: Date,
    ipAddress: String
  }
});

// Update the updatedAt field before saving
soapNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
soapNoteSchema.index({ appointmentId: 1 });
soapNoteSchema.index({ patientId: 1 });
soapNoteSchema.index({ doctorId: 1 });

export default mongoose.model('SOAPNote', soapNoteSchema);
