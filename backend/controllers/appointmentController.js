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

    // Send notification to doctor
    await Notification.create({
      recipientId: doctorId,
      title: "New Appointment Request",
      message: `${user.name} has requested an appointment on ${date} at ${time}`,
      type: "appointment",
      relatedId: apt._id,
      relatedModel: "Appointment",
      read: false
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

    if (appointment.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot update non-pending appointment" });
    }

    const updateData = { status, updatedAt: new Date() };
    
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });

    // Send notification to patient
    let notificationMessage = '';
    if (status === 'approved') {
      notificationMessage = `Your appointment with Dr. ${user.name} on ${date} at ${time} has been approved. Please complete the payment to confirm.`;
    } else if (status === 'rejected') {
      notificationMessage = `Your appointment with Dr. ${user.name} on ${date} at ${time} has been rejected.`;
    }

    if (notificationMessage) {
      await Notification.create({
        recipientId: appointment.patientId,
        title: `Appointment ${status}`,
        message: notificationMessage,
        type: "appointment",
        relatedId: id,
        relatedModel: "Appointment",
        read: false
      });
    }

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

    // Send notification to patient
    await Notification.create({
      recipientId: appointment.patientId,
      title: "Appointment Completed",
      message: `Your consultation with Dr. ${user.name} has been completed. SOAP notes and prescription are now available.`,
      type: "appointment",
      relatedId: id,
      relatedModel: "Appointment",
      read: false
    });

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
    }, { New: true });

    // Send notification to doctor
    await Notification.create({
      recipientId: appointment.doctorId,
      title: "Appointment Cancelled",
      message: `Patient ${user.name} has cancelled their appointment on ${appointment.date} at ${appointment.time}`,
      type: "appointment",
      relatedId: id,
      relatedModel: "Appointment",
      read: false
    });

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

    // Send notification to doctor
    await Notification.create({
      recipientId: appointment.doctorId,
      title: "Appointment Rescheduled",
      message: `Patient ${user.name} has rescheduled their appointment to ${date} at ${time}`,
      type: "appointment",
      relatedId: id,
      relatedModel: "Appointment",
      read: false
    });

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
      datetime: { $lt: now }
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
          message: `You missed your appointment on ${new Date(appointment.datetime).toLocaleDateString()}. No refund will be provided.`,
          type: "appointment_missed",
          relatedId: appointment._id,
          read: false
        },
        {
          userId: appointment.doctorId,
          title: "Patient Missed Appointment",
          message: `Patient missed appointment on ${new Date(appointment.datetime).toLocaleDateString()}`,
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
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
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
