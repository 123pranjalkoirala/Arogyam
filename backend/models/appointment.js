// ========================================
// APPOINTMENT MODEL - MongoDB Schema Definition
// ========================================
// 
// PURPOSE: Defines the structure and validation rules for appointment documents in MongoDB.
// This model manages all appointment-related data including scheduling, status tracking,
// payment processing, and virtual meeting information.
// 
// ARCHITECTURE: Uses Mongoose ODM with proper relationships to User model,
// status workflow management, and payment tracking integration.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// ========================================
// IMPORTS
// ========================================
// 
// Mongoose - MongoDB Object Modeling Library
// Purpose: Provides schema validation, casting, and business logic hooks
// Usage: Creates and manages MongoDB schemas and models for appointments
import mongoose from "mongoose";

// ========================================
// APPOINTMENT SCHEMA DEFINITION
// ========================================
// 
// This schema defines the structure of appointment documents in the MongoDB database.
// It manages the complete appointment lifecycle from booking to completion.
// 
// COLLECTION NAME: appointments (automatically pluralized by Mongoose)
// DOCUMENT STRUCTURE: JSON objects following this schema definition
// VALIDATION: Built-in Mongoose validation for data integrity
// RELATIONSHIPS: References to User model for patient and doctor information

const appointmentSchema = new mongoose.Schema({
  // ========================================
  // APPOINTMENT PARTICIPANTS - Who is involved in the appointment
  // ========================================
  
  // Patient Reference
  // Type: ObjectId (Reference to User model)
  // Required: Yes - Every appointment must have a patient
  // Ref: "User" collection - Links to patient user document
  // Usage: Identifies the patient seeking medical consultation
  // Relationship: Many-to-one with Users collection (patients)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  // Doctor Reference
  // Type: ObjectId (Reference to User model)
  // Required: Yes - Every appointment must have a doctor
  // Ref: "User" collection - Links to doctor user document
  // Usage: Identifies the doctor providing medical consultation
  // Relationship: Many-to-one with Users collection (doctors)
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  // ========================================
  // APPOINTMENT SCHEDULING - When and why the appointment occurs
  // ========================================
  
  // Appointment Date
  // Type: String
  // Required: No (but typically provided)
  // Format: Flexible string format (e.g., "2024-01-15", "Jan 15, 2024")
  // Usage: Calendar display, scheduling, date-based filtering
  // Validation: Should be consistent with time slot availability
  date: String,
  
  // Appointment Time
  // Type: String
  // Required: No (but typically provided)
  // Format: Time string (e.g., "14:30", "2:30 PM", "2:30-3:00")
  // Usage: Daily schedule display, time-based filtering
  // Validation: Should match doctor's available time slots
  time: String,
  
  // Appointment Reason/Chief Complaint
  // Type: String
  // Required: No
    // Usage: Doctor preparation, appointment categorization
  // Display: Shown to doctor before appointment for context
  // Examples: "Annual checkup", "Chest pain", "Follow-up consultation"
  reason: String,

  // ========================================
  // APPOINTMENT STATUS WORKFLOW - Current state of the appointment
  // ========================================
  
  // Appointment Status
  // Type: String
  // Enum Values: "pending", "approved", "rejected", "completed", "cancelled"
  // Default: "pending" - New appointments start as pending
  // Workflow: pending → approved/rejected → completed/cancelled
  // Business Logic: Status determines available actions and notifications
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending"
  },

  // ========================================
  // VIRTUAL MEETING INFORMATION - For online consultations
  // ========================================
  
  // Virtual Meeting Room ID
  // Type: String
  // Required: No (only for virtual appointments)
  // Usage: Unique identifier for video consultation room
  // Integration: Links with video conferencing service
  // Security: Should be cryptographically secure and unique
  meetingRoom: String,
  
  // Meeting Start Time
  // Type: Date
  // Required: No (only for scheduled virtual meetings)
  // Usage: When the virtual meeting room becomes available
  // Timezone: Should be stored in UTC for consistency
  // Validation: Should align with appointment date and time
  meetingStart: Date,
  
  // Meeting End Time
  // Type: Date
  // Required: No (only for scheduled virtual meetings)
  // Usage: When the virtual meeting room closes
  // Duration: Typically calculated from consultation duration
  // Validation: Should be after meetingStart time
  meetingEnd: Date,

  // ========================================
  // PAYMENT PROCESSING - Financial transaction tracking
  // ========================================
  
  // Payment Status
  // Type: String
  // Enum Values: "pending", "paid", "failed", "refunded"
  // Default: "pending" - New appointments require payment
  // Workflow: pending → paid/failed → refunded (if applicable)
  // Business Logic: Payment status affects appointment confirmation
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
  
  // Internal Payment ID
  // Type: String
  // Required: No
  // Usage: Internal system payment tracking identifier
  // Format: System-generated unique identifier
  // Purpose: Links appointment to internal payment records
  paymentId: String,
  
  // eSewa Transaction ID
  // Type: String
  // Required: No (only for eSewa payments)
  // Usage: External payment gateway transaction reference
  // Integration: Links with eSewa payment system
  // Purpose: Reconciliation with external payment processor
  eSewaTransactionId: String,
  
  // Appointment Cost/Consultation Fee
  // Type: Number
  // Default: 0 - Free appointment or cost not yet set
  // Currency: Local currency (NPR for Nepali market)
  // Usage: Payment processing, doctor revenue tracking
  // Business Logic: Typically based on doctor's consultation fee
  amount: {
    type: Number,
    default: 0
  },
  
  // Payment Completion Date
  // Type: Date
  // Required: No
  // Usage: When the payment was successfully processed
  // Purpose: Audit trail, revenue reporting, refund calculations
  // Validation: Should be set when paymentStatus changes to "paid"
  paymentDate: Date
  
}, 

// ========================================
// SCHEMA OPTIONS
// ========================================

// Timestamps Option
// Purpose: Automatically adds createdAt and updatedAt fields
// CreatedAt: When the appointment was first booked
// UpdatedAt: Last time the appointment was modified
// Usage: Audit trail, appointment lifecycle tracking, analytics
{ timestamps: true }
);

// ========================================
// MODEL EXPORT
// ========================================
// 
// Export the Mongoose model for use in the application
// Model Name: "Appointment" (singular, Mongoose creates "appointments" collection)
// Usage: Import in controllers, routes, and other parts of the application
// Methods: Provides CRUD operations and query capabilities with population

export default mongoose.model("Appointment", appointmentSchema);

// ========================================
// MODEL USAGE EXAMPLES
// ========================================
/*
// Creating a new appointment
const newAppointment = new Appointment({
  patientId: patientUserId,
  doctorId: doctorUserId,
  date: "2024-01-15",
  time: "14:30",
  reason: "Annual checkup",
  amount: 1500
});

// Finding appointments for a specific doctor
const doctorAppointments = await Appointment.find({ doctorId: doctorId })
  .populate('patientId', 'name email phone')
  .populate('doctorId', 'name specialization');

// Finding appointments for a specific patient
const patientAppointments = await Appointment.find({ patientId: patientId })
  .populate('doctorId', 'name specialization consultationFee');

// Updating appointment status
await Appointment.findByIdAndUpdate(appointmentId, {
  status: 'approved',
  paymentStatus: 'paid',
  paymentDate: new Date(),
  paymentId: 'internal_payment_123',
  eSewaTransactionId: 'esewa_txn_456'
});

// Setting up virtual meeting
await Appointment.findByIdAndUpdate(appointmentId, {
  meetingRoom: 'room_' + generateSecureId(),
  meetingStart: new Date('2024-01-15T14:30:00Z'),
  meetingEnd: new Date('2024-01-15T15:00:00Z')
});

// Querying appointments by status
const pendingAppointments = await Appointment.find({ 
  status: 'pending',
  paymentStatus: 'pending'
 }).populate(['patientId', 'doctorId']);

// Analytics queries
const totalRevenue = await Appointment.aggregate([
  { $match: { paymentStatus: 'paid' } },
  { $group: { _id: null, total: { $sum: '$amount' } } }
]);

const appointmentsByStatus = await Appointment.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
*/
