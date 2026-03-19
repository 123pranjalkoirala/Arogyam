import express from "express";
import User from "../models/user.js";
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";
import { sendAppointmentNotification } from "../services/emailService.js";

const router = express.Router();

/* =========================
   ADMIN STATS
========================= */
router.get("/stats", async (req, res) => {
  try {
    console.log("=== Admin Stats Request ===");
    console.log("Auth Header:", req.headers.authorization);
    
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
      console.log("Admin access granted via admin-access-key-pranjal");
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
      console.log("Admin access granted via user role");
    }
    
    if (!isAdmin) {
      console.log("Admin access denied");
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

    // Get revenue data from COMPLETED AND PAID appointments only
    const completedAndPaidAppointments = await Appointment.find({ 
      status: "completed",
      paymentStatus: "paid" 
    });
    
    // Calculate total revenue from completed AND paid appointments
    const totalRevenue = completedAndPaidAppointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);
    
    // Get revenue by month for chart (completed & paid only)
    const revenueByMonth = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          month: "$_id",
          revenue: 1,
          _id: 0
        }
      }
    ]);

    console.log("=== Admin Stats Response ===");
    console.log("Total Revenue (Completed & Paid Only):", totalRevenue);
    console.log("Revenue by Month (Completed & Paid Only):", revenueByMonth);
    console.log("Completed & Paid Count:", completedAndPaidAppointments.length);

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
      appointmentsBySpecialization,
      totalRevenue,
      revenueByMonth,
      completedAndPaidCount: completedAndPaidAppointments.length
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET ALL USERS
========================= */
router.get("/users", async (req, res) => {
  try {
    console.log("=== Admin Users Request ===");
    console.log("Auth Header:", req.headers.authorization);
    
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
      console.log("Admin access granted via admin-access-key-pranjal");
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
      console.log("Admin access granted via user role");
    }
    
    if (!isAdmin) {
      console.log("Admin access denied");
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
router.delete("/users/:id", async (req, res) => {
  try {
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
    }
    
    if (!isAdmin) {
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
   DELETE APPOINTMENT
========================= */
router.delete("/appointments/:id", async (req, res) => {
  try {
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
    }
    
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const appointmentId = req.params.id;
    
    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);
    
    res.json({ success: true, message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("Delete appointment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   UPDATE APPOINTMENT STATUS
========================= */
router.put("/appointments/:id/status", async (req, res) => {
  try {
    console.log("=== Update Appointment Status Request ===");
    console.log("Auth Header:", req.headers.authorization);
    console.log("Request Body:", req.body);
    console.log("Appointment ID:", req.params.id);
    
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
      console.log("Admin access granted via admin-access-key-pranjal");
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
      console.log("Admin access granted via user role");
    }
    
    if (!isAdmin) {
      console.log("Unauthorized access attempt");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { status } = req.body;
    const appointmentId = req.params.id;
    
    console.log("Updating appointment:", appointmentId, "to status:", status);
    
    // Get appointment before updating
    const appointment = await Appointment.findById(appointmentId).populate("patientId").populate("doctorId");
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    
    // Update appointment status
    await Appointment.findByIdAndUpdate(appointmentId, { status });
    
    // Create notification for patient
    if (appointment.patientId) {
      try {
        const { createNotification } = await import("./notifications.js");
        
        let notificationType, message;
        switch (status) {
          case "approved":
            notificationType = "appointment_approved";
            message = `Your appointment with Dr. ${appointment.doctorId?.name || "Doctor"} has been approved!`;
            break;
          case "rejected":
            notificationType = "appointment_rejected";
            message = `Your appointment with Dr. ${appointment.doctorId?.name || "Doctor"} has been rejected.`;
            break;
          default:
            notificationType = "appointment_booked";
            message = `Your appointment status has been updated to ${status}.`;
        }
        
        await createNotification(
          appointment.patientId._id,
          notificationType,
          message,
          appointmentId
        );
      } catch (notificationError) {
        console.error("Notification creation failed:", notificationError);
        // Don't fail the appointment update if notification fails
      }

      // Send email notification
      if (appointment.patientId.email) {
        try {
          const appointmentDetails = {
            doctorName: appointment.doctorId?.name || "Doctor",
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason
          };
          
          await sendAppointmentNotification(
            appointment.patientId.email,
            appointment.patientId.name || "Patient",
            appointmentDetails,
            status
          );
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          // Don't fail the appointment update if email fails
        }
      }
    }
    
    res.json({ success: true, message: `Appointment ${status} successfully` });
    console.log(`Appointment ${appointmentId} updated to status: ${status}`);
  } catch (err) {
    console.error("Update appointment status error:", err);
    console.error("Error details:", err.message);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET ALL APPOINTMENTS
========================= */
router.get("/appointments", async (req, res) => {
  try {
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
    }
    
    if (!isAdmin) {
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

/* =========================
   ADMIN RESCHEDULE APPOINTMENT
========================= */
router.put("/appointments/:id/reschedule", async (req, res) => {
  try {
    console.log("=== Admin Reschedule Appointment ===");
    console.log("Auth Header:", req.headers.authorization);
    
    // Check if admin pranjal access
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    
    if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
      isAdmin = true;
      console.log("Admin access granted via admin-access-key-pranjal");
    } else if (req.user && req.user.role === "admin") {
      isAdmin = true;
      console.log("Admin access granted via user role");
    }
    
    if (!isAdmin) {
      console.log("Admin access denied");
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({ success: false, message: "Date and time are required" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Check for existing appointments at the new time
    const existingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      date,
      time,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "This time slot is already booked" });
    }

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      date,
      time,
      rescheduledAt: new Date(),
      rescheduledBy: req.user?.id || 'admin'
    }, { new: true });

    // Send notification to patient
    try {
      const Notification = require("../models/Notification.js").default;
      await Notification.create({
        recipientId: appointment.patientId,
        title: "Appointment Rescheduled",
        message: `Your appointment has been rescheduled to ${date} at ${time} by admin.`,
        type: "appointment",
        relatedId: id,
        relatedModel: "Appointment",
        read: false
      });
    } catch (notificationError) {
      console.error("Notification creation failed:", notificationError);
    }

    res.json({ 
      success: true, 
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment
    });
    console.log(`Appointment ${id} rescheduled to ${date} at ${time}`);
  } catch (err) {
    console.error("Admin reschedule appointment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
