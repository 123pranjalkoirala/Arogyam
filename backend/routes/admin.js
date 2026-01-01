import express from "express";
import User from "../models/user.js";
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   ADMIN STATS
========================= */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAppointments = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: "pending" });
    const approved = await Appointment.countDocuments({ status: "approved" });
    const rejected = await Appointment.countDocuments({ status: "rejected" });

    res.json({
      success: true,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pending,
      approved,
      rejected
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET ALL USERS
========================= */
router.get("/users", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   DELETE USER
========================= */
router.delete("/users/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET ALL APPOINTMENTS
========================= */
router.get("/appointments", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await Appointment.find()
      .populate("patientId", "name email picture")
      .populate("doctorId", "name specialization picture consultationFee")
      .sort({ createdAt: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
