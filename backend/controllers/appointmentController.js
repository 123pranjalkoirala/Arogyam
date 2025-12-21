// backend/controllers/appointmentController.js
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
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

    const apt = await Appointment.create({
      patientId: user.id,
      doctorId,
      datetime,
      reason,
      status: "pending",
    });

    return res.json({ success: true, appointment: apt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listAppointments = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // ?my=true returns appointments for current user (patient or doctor)
    if (req.query.my === "true" || req.query.my === true) {
      const q = user.role === "doctor" ? { doctorId: user.id } : { patientId: user.id };
      const list = await Appointment.find(q).populate("patientId", "name email").populate("doctorId", "name email");
      return res.json({ success: true, appointments: list });
    }

    // else return all (admin)
    const all = await Appointment.find().populate("patientId", "name email").populate("doctorId", "name email");
    return res.json({ success: true, appointments: all });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user) return res.status(401).json({ success: false });

    const { id } = req.params;
    const { status } = req.body;
    // simple check: only doctor or admin can update status
    if (!["doctor", "admin"].includes(user.role)) return res.status(403).json({ success: false, message: "Forbidden" });

    const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true }).populate("patientId doctorId", "name email");
    return res.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
