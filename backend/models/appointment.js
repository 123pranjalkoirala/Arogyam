// ========================================
// APPOINTMENT MODEL - MongoDB Schema Definition
// ========================================
// 
// PURPOSE: Defines the structure and validation rules for appointment documents in MongoDB.
// This model manages all appointment-related data including scheduling, status tracking,
// payment processing, and virtual meeting information.
 
import mongoose from "mongoose";

 

const appointmentSchema = new mongoose.Schema({
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
 
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

 
  date: String,
   
  time: String,
  
  reason: String,

  
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed", "cancelled"],
    default: "pending"
  },
 
  meetingRoom: String,
  
 
  meetingStart: Date,
  
   
  meetingEnd: Date,
 
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },
 
  paymentId: String,
  
   
  eSewaTransactionId: String,
   
  amount: {
    type: Number,
    default: 0
  },
  
   
  paymentDate: Date
  
}, 

 
{ timestamps: true }
);
 

export default mongoose.model("Appointment", appointmentSchema);

 