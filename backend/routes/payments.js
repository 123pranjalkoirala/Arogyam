// backend/routes/payments.js - Updated for working eSewa v2 test integration
import express from "express";
import {
  initiateEsewaPayment,
  esewaPaymentCallback,
  checkPaymentStatus,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initiate eSewa payment (requires authentication)
router.post("/esewa/initiate", (req, res, next) => {
  console.log("=== Payment Initiation Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("================================");
  next();
}, requireAuth, initiateEsewaPayment);

// eSewa callback - called by eSewa (supports both GET and POST, no auth needed)
router.get("/esewa/callback", esewaPaymentCallback);
router.post("/esewa/callback", esewaPaymentCallback);

// eSewa failure callback - called by eSewa (supports both GET and POST, no auth needed)
router.get("/esewa/failure", esewaPaymentCallback);
router.post("/esewa/failure", esewaPaymentCallback);

// Check payment status (requires authentication)
router.post("/status", requireAuth, checkPaymentStatus);

// Manual payment confirmation (requires authentication)
router.post("/manual-confirm", requireAuth, async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    // Find the appointment and verify ownership
    const Appointment = (await import("../models/appointment.js")).default;
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Verify appointment belongs to the user
    if (appointment.patientId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only confirm payment for your own appointments"
      });
    }

    // Update payment status to paid
    appointment.paymentStatus = "paid";
    appointment.paymentDate = new Date();
    appointment.eSewaTransactionUuid = `manual_${Date.now()}`;
    appointment.eSewaTransactionCode = "MANUAL_CONFIRM";
    await appointment.save();

    console.log("✅ Manual payment confirmed for appointment:", appointment._id);

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        amount: appointment.amount,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        eSewaTransactionUuid: appointment.eSewaTransactionUuid,
        eSewaTransactionCode: appointment.eSewaTransactionCode,
        paymentDate: appointment.paymentDate
      }
    });
  } catch (error) {
    console.error("Manual confirmation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during manual confirmation"
    });
  }
});

// Check payment status by appointment ID (requires authentication)
router.get("/esewa/status/:appointmentId", requireAuth, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    // Find the appointment and verify ownership
    const Appointment = (await import("../models/appointment.js")).default;
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name specialization')
      .populate('patientId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Verify appointment belongs to the user
    if (appointment.patientId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only check status of your own appointments"
      });
    }

    res.json({
      success: true,
      appointment: {
        _id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        amount: appointment.amount,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        eSewaTransactionUuid: appointment.eSewaTransactionUuid,
        eSewaTransactionCode: appointment.eSewaTransactionCode,
        paymentDate: appointment.paymentDate
      }
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status"
    });
  }
});

export default router;