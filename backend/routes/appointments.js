import express from "express";
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   CREATE APPOINTMENT (PATIENT)
========================= */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { doctorId, date, time, reason, paymentId, amount } = req.body;

    // Create appointment with payment pending initially
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason,
      status: "pending",
      paymentStatus: "pending",
      paymentId: paymentId,
      amount: amount || 0
    });

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create appointment after payment (called from payment success callback)
router.post("/after-payment", async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Payment ID required" });
    }

    // Find appointment by paymentId and update payment status
    const appointment = await Appointment.findOne({ paymentId });
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.paymentStatus = "paid";
    appointment.eSewaTransactionId = transactionId;
    appointment.paymentDate = new Date();
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET APPOINTMENTS (ROLE BASED)
========================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") filter.patientId = req.user.id;
    if (req.user.role === "doctor") filter.doctorId = req.user.id;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email picture")
      .populate("doctorId", "name specialization email picture consultationFee")
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET MY APPOINTMENTS (PATIENT)
========================= */
router.get("/my", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name specialization email picture consultationFee")
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   DOCTOR UPDATE STATUS
========================= */
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    if (["approved", "rejected", "completed"].includes(status)) {
      appointment.status = status;
    }

    if (status === "approved") {
      appointment.meetingRoom = `arogyam-${appointment._id}`;
      // meetingStart will be set when doctor clicks "Start Call"
    }

    await appointment.save();
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   START CALL (DOCTOR)
========================= */
router.put("/:id/start-call", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    if (appointment.status !== "approved") {
      return res.status(400).json({ success: false, message: "Appointment must be approved to start call" });
    }

    appointment.meetingRoom = `arogyam-${appointment._id}`;
    appointment.meetingStart = new Date();
    appointment.meetingEnd = new Date(Date.now() + 60 * 60000); // 60 minutes
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   DELETE APPOINTMENT
========================= */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (
      req.user.role === "patient" &&
      appointment.patientId.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!["admin", "patient"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
