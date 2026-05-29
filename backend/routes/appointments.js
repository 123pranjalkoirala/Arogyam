import express from "express";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import DoctorSchedule from "../models/doctorSchedule.js";
import { requireAuth } from "../middleware/auth.js";
import { trackPatientVisit } from "../middleware/patientTracker.js";
import { sendAppointmentNotification } from "../services/emailService.js";

const router = express.Router();

   //CREATE APPOINTMENT (PATIENT)
 
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

    const { doctorId, date, time, reason, paymentId, transactionId, amount } = req.body;
    console.log("Extracted data:", { doctorId, date, time, reason, paymentId, transactionId, amount });
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
      amount: amount || 500
    });

    // Create appointment with status based on payment
    const appointmentData = {
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason,
      amount: amount || 500
    };

    // If payment is already made, set status to approved, otherwise pending
    if (paymentId && transactionId) {
      appointmentData.status = "approved";
      appointmentData.paymentStatus = "paid";
      appointmentData.eSewaTransactionId = transactionId;
      appointmentData.paymentDate = new Date();
      appointmentData.approvedAt = new Date();
    } else {
      appointmentData.status = "pending";
      appointmentData.paymentStatus = "pending";
    }

    const appointment = await Appointment.create(appointmentData);

    console.log("Appointment created successfully:", appointment);

    // Book the time slot in doctor schedule
    try {
      await DoctorSchedule.bookTimeSlot(doctorId, appointmentData.date, appointmentData.time, appointment._id);
      console.log("Time slot booked successfully");
    } catch (slotError) {
      console.error("Failed to book time slot:", slotError);
      // If time slot booking fails, delete the appointment
      await Appointment.findByIdAndDelete(appointment._id);
      return res.status(400).json({ 
        success: false, 
        message: slotError.message || "Time slot not available" 
      });
    }

    // Track patient visit
    try {
      await trackPatientVisit(req, res, () => {});
    } catch (trackingError) {
      console.error("Patient tracking failed:", trackingError);
    }

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

    // Update payment status and appointment status
    appointment.paymentStatus = "paid";
    appointment.eSewaTransactionId = transactionId;
    appointment.paymentDate = new Date();
    
    // If appointment was pending, approve it now that payment is made
    if (appointment.status === "pending") {
      appointment.status = "approved";
      appointment.approvedAt = new Date();
      appointment.meetingRoom = `arogyam-${appointment._id}`;
    }
    
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
      // Only show PAID appointments to doctors
      filter.paymentStatus = "paid";
      console.log("Doctor filter:", filter);
    }

    console.log("Final filter:", filter);
    console.log("Attempting to find appointments...");

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email picture isNewPatient totalVisits lastVisitDate medicalHistory")
      .populate("doctorId", "name specialization email picture consultationFee")
      .sort({ date: -1, time: -1 });

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

    // Validate status transitions
    const validTransitions = {
      "pending": ["approved", "rejected"],
      "approved": ["completed", "cancelled"],
      "rejected": [],
      "completed": [],
      "cancelled": []
    };
    
    if (!validTransitions[appointment.status]?.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot change status from ${appointment.status} to ${status}` 
      });
    }

    if (["approved", "rejected", "completed", "cancelled"].includes(status)) {
      appointment.status = status;
      appointment.updatedAt = new Date();
    }

    if (status === "approved") {
      appointment.meetingRoom = `arogyam-${appointment._id}`;
      appointment.approvedAt = new Date();
    } else if (status === "completed") {
      appointment.completedAt = new Date();
      
      // Mark the time slot as completed
      try {
        await DoctorSchedule.completeTimeSlot(appointment.doctorId, appointment.date, appointment.time);
        console.log("Time slot marked as completed");
      } catch (slotError) {
        console.error("Failed to mark time slot as completed:", slotError);
      }
    }

    await appointment.save();
    
    res.json({ success: true, appointment });
  } catch (err) {
    console.error("Error updating appointment status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
 
  // DOCTOR COMPLETE APPOINTMENT WITH SOAP NOTES
 
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
   CANCEL APPOINTMENT (PATIENT)
========================= */
router.put("/:id/cancel", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    if (!["pending", "approved"].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel this appointment" });
    }

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    await appointment.save();

    // Release the time slot
    try {
      await DoctorSchedule.releaseTimeSlot(appointment.doctorId, appointment.date, appointment.time);
      console.log("Time slot released successfully");
    } catch (slotError) {
      console.error("Failed to release time slot:", slotError);
    }

    res.json({ success: true, message: "Appointment cancelled successfully", appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   RESCHEDULE APPOINTMENT (PATIENT)
========================= */
router.put("/:id/reschedule", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { date, time } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    if (!["pending", "approved"].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: "Cannot reschedule this appointment" });
    }

    // Check for existing appointments at the new time
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date,
      time,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: req.params.id }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "This time slot is already booked" });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.rescheduledAt = new Date();
    await appointment.save();

    res.json({ success: true, message: "Appointment rescheduled successfully", appointment });
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

/* =========================
   GET PATIENT HISTORY FOR DOCTORS
========================= */
router.get("/patient-history/:patientId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { patientId } = req.params;
    const patient = await User.findById(patientId).populate('medicalHistory.doctorId', 'name specialization');
    
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Get past appointments with this doctor
    const pastAppointments = await Appointment.find({
      patientId: patientId,
      doctorId: req.user.id,
      status: { $in: ['completed', 'cancelled'] }
    }).populate('doctorId', 'name specialization').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        isNewPatient: patient.isNewPatient,
        totalVisits: patient.totalVisits,
        lastVisitDate: patient.lastVisitDate,
        medicalHistory: patient.medicalHistory || []
      },
      visitStats: {
        isReturningPatient: !patient.isNewPatient,
        isFrequentVisitor: patient.totalVisits > 3,
        daysSinceLastVisit: patient.lastVisitDate ? 
          Math.floor((new Date() - new Date(patient.lastVisitDate)) / (1000 * 60 * 60 * 24)) : null
      },
      pastAppointmentsWithCurrentDoctor: pastAppointments,
      appointmentNotes: pastAppointments.map(apt => ({
        date: apt.date,
        doctorName: apt.doctorId?.name || "Unknown",
        specialization: apt.doctorId?.specialization || "General",
        status: apt.status,
        notes: apt.soapNotes?.subjective || "No notes available"
      }))
    });
  } catch (error) {
    console.error("Get patient history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
