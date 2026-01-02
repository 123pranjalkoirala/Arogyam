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
    const totalDoctors = await User.countDocuments({ 
      role: "doctor",
      $or: [
        { password: { $exists: true, $ne: null } },
        { googleId: { $exists: true, $ne: null } }
      ]
    });
    const totalAppointments = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: "pending" });
    const approved = await Appointment.countDocuments({ status: "approved" });
    const rejected = await Appointment.countDocuments({ status: "rejected" });
    const completed = await Appointment.countDocuments({ status: "completed" });
    const cancelled = await Appointment.countDocuments({ status: "cancelled" });

    // Get appointments by date for last 30 days (for charts)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const appointmentsByDate = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get appointments by status (for pie chart)
    const appointmentsByStatus = [
      { name: "Pending", value: pending },
      { name: "Approved", value: approved },
      { name: "Rejected", value: rejected },
      { name: "Completed", value: completed },
      { name: "Cancelled", value: cancelled }
    ];

    // Get appointments by specialization
    const appointmentsBySpecialization = await Appointment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor"
        }
      },
      {
        $unwind: "$doctor"
      },
      {
        $group: {
          _id: "$doctor.specialization",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pending,
      approved,
      rejected,
      completed,
      cancelled,
      appointmentsByDate,
      appointmentsByStatus,
      appointmentsBySpecialization
    });
  } catch (err) {
    console.error("Admin stats error:", err);
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
   DELETE USER (WITH ALL RELATED DATA)
========================= */
router.delete("/users/:id", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.params.id;
    
    // Import models
    const Appointment = (await import("../models/appointment.js")).default;
    const Rating = (await import("../models/rating.js")).default;
    const Report = (await import("../models/report.js")).default;

    // Delete all related data
    await Appointment.deleteMany({ 
      $or: [
        { patientId: userId },
        { doctorId: userId }
      ]
    });

    await Rating.deleteMany({
      $or: [
        { patientId: userId },
        { doctorId: userId }
      ]
    });

    await Report.deleteMany({
      $or: [
        { patientId: userId },
        { doctorId: userId }
      ]
    });

    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ success: true, message: "User and all related data deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
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
