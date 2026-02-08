import express from "express";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";
import { sendAppointmentNotification } from "../services/emailService.js";

const router = express.Router();

/* =========================
   CREATE APPOINTMENT (PATIENT)
========================= */
router.post("/", requireAuth, async (req, res) => {
  try {
    console.log("=== CREATE APPOINTMENT DEBUG ===");
    console.log("User:", req.user);
    console.log("Request body raw:", req.body);
    console.log("Request body JSON.stringify:", JSON.stringify(req.body));
    console.log("Content-Type:", req.get('Content-Type'));
    
    if (req.user.role !== "patient") {
      console.log("Unauthorized - not patient role");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { doctorId, date, time, reason, paymentId, amount } = req.body;
    console.log("Extracted data:", { doctorId, date, time, reason, paymentId, amount });
    console.log("Typeof reason:", typeof reason);
    console.log("Reason value:", reason);

    // Validate required fields
    if (!doctorId || !date || !time || !reason) {
      console.log("Missing required fields - doctorId:", !!doctorId, "date:", !!date, "time:", !!time, "reason:", !!reason);
      return res.status(400).json({ success: false, message: "All fields are required: doctor, date, time, reason" });
    }

    console.log("Creating appointment with data:", {
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason,
      status: "pending",
      paymentStatus: "pending", // Payment pending (matches schema default)
      amount: amount || 500
    });

    // Create appointment with pending status (waiting for doctor approval)
    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason,
      status: "pending", // Waiting for doctor approval
      paymentStatus: "pending", // Payment pending (matches schema default)
      amount: amount || 500 // Default consultation fee
    });

    console.log("Appointment created successfully:", appointment);

    // Send email notification to patient about booking confirmation
    try {
      const patient = await User.findById(req.user.id);
      const doctor = await User.findById(doctorId);
      
      if (patient && patient.email) {
        const appointmentDetails = {
          doctorName: doctor?.name || "Doctor",
          date: appointment.date,
          time: appointment.time,
          reason: appointment.reason
        };
        
        await sendAppointmentNotification(
          patient.email,
          patient.name || "Patient",
          appointmentDetails,
          "booking"
        );
      }
    } catch (emailError) {
      console.error("Error sending booking email:", emailError);
      // Don't fail the appointment creation if email fails
    }

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
    console.log("=== GET APPOINTMENTS DEBUG ===");
    console.log("User:", req.user);
    console.log("User role:", req.user.role);
    console.log("User ID:", req.user.id);
    
    let filter = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user.id;
      console.log("Patient filter:", filter);
    } else if (req.user.role === "doctor") {
      filter.doctorId = req.user.id;
      // Only show approved appointments to doctors
      filter.status = "approved";
      console.log("Doctor filter:", filter);
    }

    console.log("Final filter:", filter);
    console.log("Attempting to find appointments...");

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email picture")
      .populate("doctorId", "name specialization email picture consultationFee")
      .sort({ createdAt: -1 });

    console.log("Appointments found:", appointments.length);
    console.log("=== END GET APPOINTMENTS DEBUG ===");

    res.json({ success: true, appointments });
  } catch (err) {
    console.error("=== APPOINTMENTS GET ERROR ===");
    console.error("Error details:", err);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("=== END APPOINTMENTS GET ERROR ===");
    
    res.status(500).json({ success: false, message: "Server error", error: err.message });
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
   DOCTOR COMPLETE APPOINTMENT WITH SOAP NOTES
========================= */
router.put("/:id/complete", requireAuth, async (req, res) => {
  try {
    console.log("=== COMPLETE APPOINTMENT WITH SOAP ===");
    console.log("User:", req.user);
    console.log("Request body:", req.body);
    
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status, soapNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    // Update appointment status to completed
    appointment.status = "completed";
    appointment.completedAt = new Date();
    
    // Store SOAP notes in the appointment document
    if (soapNotes) {
      appointment.soapNotes = {
        subjective: soapNotes.subjective,
        objective: soapNotes.objective,
        assessment: soapNotes.assessment,
        plan: soapNotes.plan,
        doctorId: req.user.id,
        createdAt: new Date()
      };
    }

    await appointment.save();
    console.log("Appointment completed with SOAP notes:", appointment);
    
    res.json({ 
      success: true, 
      message: "Appointment completed with medical notes",
      appointment 
    });
  } catch (err) {
    console.error("Error completing appointment:", err);
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
