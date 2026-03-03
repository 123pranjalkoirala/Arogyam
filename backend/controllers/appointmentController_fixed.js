// backend/controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
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

    const { doctorId, datetime, reason } = req.body;
    if (!doctorId || !datetime) return res.status(400).json({ success: false, message: "Missing fields" });

    // Get doctor details for consultation fee
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ success: false, message: "Invalid doctor selected" });
    }

    const apt = await Appointment.create({
      patientId: user.id,
      doctorId,
      datetime,
      reason,
      status: "pending",
      amount: doctor.consultationFee || 500,
      paymentStatus: "pending"
    });

    // Send notification to doctor
    await Notification.create({
      userId: doctorId,
      title: "New Appointment Booking",
      message: `${user.name} has booked an appointment with you on ${new Date(datetime).toLocaleDateString()}`,
      type: "appointment_booking",
      relatedId: apt._id,
      read: false
    });

    res.status(201).json({ 
      success: true, 
      message: "Appointment booked successfully",
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
    const { status, reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updateData = { status, updatedAt: new Date() };
    if (status === 'rejected' && reason) {
      updateData.rejectionReason = reason;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });

    // Send notification to patient
    let notificationMessage = '';
    if (status === 'approved') {
      notificationMessage = `Your appointment with Dr. ${user.name} on ${new Date(appointment.datetime).toLocaleDateString()} has been approved`;
    } else if (status === 'rejected') {
      notificationMessage = `Your appointment with Dr. ${user.name} on ${new Date(appointment.datetime).toLocaleDateString()} has been rejected. Reason: ${reason}`;
    }

    if (notificationMessage) {
      await Notification.create({
        userId: appointment.patientId,
        title: `Appointment ${status}`,
        message: notificationMessage,
        type: "appointment_update",
        relatedId: id,
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
