// backend/routes/appointments.js
import express from "express";
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   CREATE APPOINTMENT (PATIENT)
========================= */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      date,
      time,
      reason,
      status: "pending",
    });

    res.json({ success: true, appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   GET APPOINTMENTS (ROLE BASED)
========================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patientId = req.user.id;
    }

    if (req.user.role === "doctor") {
      filter.doctorId = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
      .populate("doctorId", "name email");

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   UPDATE STATUS (DOCTOR)
========================= */
router.put("/:id/status", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

export default router;
