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
  
  // Additional Medical Fields
  diagnosis: [{
    code: String, // ICD-10 code
    description: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  
  vitalSigns: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    temperature: Number,
    respiratoryRate: Number,
    oxygenSaturation: Number,
    weight: Number,
    height: Number,
    bmi: Number
  },
  
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  
  investigations: [{
    type: {
      type: String,
      enum: ['lab', 'imaging', 'other']
    },
    name: String,
    result: String,
    normalRange: String,
    status: {
      type: String,
      enum: ['ordered', 'completed', 'pending']
    }
  }],
  
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
