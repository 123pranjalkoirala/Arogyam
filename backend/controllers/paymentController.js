// backend/controllers/paymentController.js
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Mock Payment System (for development/testing)
// In production, replace with real payment gateway like Khalti, eSewa, etc.

// Helper to get user from token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Initiate payment - Mock implementation
export const initiatePayment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get doctor to get consultation fee
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const amount = doctor.consultationFee || 500;
    const transactionUUID = `AROGYAM-${Date.now()}-${doctorId}`;

    // Create appointment with pending payment
    const appointment = await Appointment.create({
      patientId: user.id,
      doctorId,
      date,
      time,
      reason,
      status: "pending",
      paymentStatus: "pending",
      paymentId: transactionUUID,
      amount: amount
    });

    // Return mock payment data - In production, this would redirect to payment gateway
    res.json({
      success: true,
      paymentId: transactionUUID,
      amount: amount,
      appointmentId: appointment._id,
      // Mock payment URL - In production, this would be the actual payment gateway URL
      paymentUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/mock?paymentId=${transactionUUID}&appointmentId=${appointment._id}`,
      message: "Payment initiated. Redirecting to payment page..."
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify payment - Mock implementation
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, appointmentId } = req.body;
    
    // Find appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.paymentId !== paymentId) {
      return res.status(400).json({ success: false, message: "Invalid payment ID" });
    }

    // Update appointment payment status
    appointment.paymentStatus = "paid";
    appointment.paymentDate = new Date();
    await appointment.save();

    return res.json({
      success: true,
      message: "Payment verified successfully",
      appointment
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({
      success: true,
      paymentStatus: appointment.paymentStatus,
      amount: appointment.amount,
      paymentId: appointment.paymentId
    });
  } catch (err) {
    console.error("Get payment status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
