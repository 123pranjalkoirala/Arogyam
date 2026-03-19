// backend/controllers/appointmentController.js
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";

const getUserFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { id, role, name }
  } catch (err) { return null; }
};

export const createAppointment = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { doctorId, date, time, reason } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Get doctor details for consultation fee
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ success: false, message: "Invalid doctor selected" });
    }

    // Check for existing appointments at the same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "This time slot is already booked" });
    }

    const apt = await Appointment.create({
      patientId: user.id,
      doctorId,
      date,
      time,
      reason: reason || "General consultation",
      status: "pending",
      amount: doctor.consultationFee || 500,
      paymentStatus: "pending"
    });

    res.status(201).json({ 
      success: true, 
      message: "Appointment request submitted. Please wait for doctor approval.",
      appointment: apt
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update appointment status (for doctors to approve/reject)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user || user.role !== 'doctor') {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
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

    const updateData = { status, updatedAt: new Date() };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });

    res.json({ 
      success: true, 
      message: `Appointment ${status} successfully`,
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Complete appointment with SOAP notes
export const completeAppointment = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user || user.role !== 'doctor') {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const { soapData } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (appointment.status !== "approved") {
      return res.status(400).json({ success: false, message: "Cannot complete non-approved appointment" });
    }

    // Create SOAP note
    const SOAPNote = require("../models/soapNote.js").default;
    const soapNote = new SOAPNote({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      subjective: soapData.subjective,
      objective: soapData.objective,
      assessment: soapData.assessment,
      plan: soapData.plan,
      vitalSigns: soapData.vitalSigns,
      medications: soapData.medications,
      followUp: soapData.followUp,
      status: "completed",
      doctorSignature: {
        timestamp: new Date(),
        ipAddress: req.ip
      }
    });

    await soapNote.save();

    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      status: "completed",
      completedAt: new Date()
    }, { new: true });

    res.json({ 
      success: true, 
      message: "Appointment completed successfully",
      appointment: updatedAppointment,
      soapNote
    });
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Cancel appointment (for patients)
export const cancelAppointment = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patientId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (!["pending", "approved"].includes(appointment.status)) {
      return res.status(400).json({ success: false, message: "Cannot cancel this appointment" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      status: "cancelled",
      cancelledAt: new Date()
    }, { new: true });

    res.json({ 
      success: true, 
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reschedule appointment (for patients)
export const rescheduleAppointment = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;
    const { date, time } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patientId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
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
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: "This time slot is already booked" });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, {
      date,
      time,
      rescheduledAt: new Date()
    }, { new: true });

    res.json({ 
      success: true, 
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Check for missed appointments and mark them
export const checkMissedAppointments = async () => {
  try {
    const now = new Date();
    const missedAppointments = await Appointment.find({
      status: 'approved',
      date: { $lt: now.toISOString().split('T')[0] }
    });

    for (const appointment of missedAppointments) {
      await Appointment.findByIdAndUpdate(appointment._id, {
        status: 'missed',
        missedAt: now
      });

      // Send notification to both doctor and patient
      await Notification.create([
        {
          userId: appointment.patientId,
          title: "Appointment Missed",
          message: `You missed your appointment on ${appointment.date}. No refund will be provided.`,
          type: "appointment_missed",
          relatedId: appointment._id,
          read: false
        },
        {
          userId: appointment.doctorId,
          title: "Patient Missed Appointment",
          message: `Patient missed appointment on ${appointment.date}`,
          type: "appointment_missed",
          relatedId: appointment._id,
          read: false
        }
      ]);
    }

    console.log(`Processed ${missedAppointments.length} missed appointments`);
  } catch (error) {
    console.error("Error checking missed appointments:", error);
  }
};

export const listAppointments = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (user.role === 'patient') {
      query.patientId = user.id;
    } else if (user.role === 'doctor') {
      query.doctorId = user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name email specialization consultationFee')
      .populate('patientId', 'name email')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      appointments: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error listing appointments:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    let matchQuery = {};
    if (user.role === 'patient') {
      matchQuery.patientId = user.id;
    } else if (user.role === 'doctor') {
      matchQuery.doctorId = user.id;
    }

    const stats = await Appointment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
            }
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ["$status", "approved"] }, 1, 0]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ["$status", "rejected"] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0
    };

    res.json({
      success: true,
      stats: result
    });
  } catch (error) {
    console.error("Error getting appointment stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
