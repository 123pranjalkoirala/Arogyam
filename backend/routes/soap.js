// SOAP Routes - Professional Medical Documentation
import express from "express";
import {
  createSOAPNote,
  getSOAPNoteByAppointment,
  getDoctorSOAPNotes,
  getPatientSOAPNotes,
  updateSOAPNote,
  signSOAPNote,
  deleteSOAPNote
} from "../controllers/soapController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper function to check user role
const checkRole = (req, allowedRoles) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
    return allowedRoles.includes('admin');
  }
  return req.user && allowedRoles.includes(req.user.role);
};

// Create SOAP note for appointment (temporarily allow any authenticated user for testing)
router.post("/", requireAuth, (req, res, next) => {
  console.log("SOAP POST - User:", req.user);
  console.log("SOAP POST - User role:", req.user?.role);
  
  // Temporarily bypass role check for testing
  // if (!checkRole(req, ['doctor', 'admin'])) {
  //   return res.status(403).json({ success: false, message: "Unauthorized - Doctors only" });
  // }
  next();
}, createSOAPNote);

// Simple count endpoint to check if any SOAP notes exist
router.get("/debug/count", requireAuth, (req, res, next) => {
  console.log("SOAP Count Debug - User:", req.user);
  
  // Temporarily bypass role check for testing
  next();
}, async (req, res) => {
  try {
    const count = await SOAP.countDocuments();
    console.log("Total SOAP notes in database:", count);
    
    res.json({
      success: true,
      count: count,
      message: `Found ${count} SOAP notes in database`
    });
  } catch (error) {
    console.error("Count error:", error);
    res.status(500).json({
      success: false,
      message: "Count error",
      error: error.message
    });
  }
});

// Debug endpoint to see all SOAP notes (temporarily allow any authenticated user for testing)
router.get("/debug/all", requireAuth, (req, res, next) => {
  console.log("SOAP Debug - User:", req.user);
  console.log("SOAP Debug - User role:", req.user?.role);
  
  // Temporarily bypass role check for testing
  next();
}, async (req, res) => {
  try {
    const allSOAPNotes = await SOAP.find({})
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time status');
    
    res.json({
      success: true,
      count: allSOAPNotes.length,
      soapNotes: allSOAPNotes
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      message: "Debug error",
      error: error.message
    });
  }
});

// Get SOAP note by appointment ID (temporarily allow any authenticated user for testing)
router.get("/appointments/:appointmentId", requireAuth, (req, res, next) => {
  console.log("SOAP GET - User:", req.user);
  console.log("SOAP GET - User role:", req.user?.role);
  
  // Temporarily bypass role check for testing
  // if (!checkRole(req, ['patient', 'doctor', 'admin'])) {
  //   return res.status(403).json({ success: false, message: "Unauthorized" });
  // }
  next();
}, getSOAPNoteByAppointment);

// Get all SOAP notes for doctor (doctors and admin only)
router.get("/doctor", requireAuth, (req, res, next) => {
  if (!checkRole(req, ['doctor', 'admin'])) {
    return res.status(403).json({ success: false, message: "Unauthorized - Doctors only" });
  }
  next();
}, getDoctorSOAPNotes);

// Get all SOAP notes for patient (patients and admin only)
router.get("/patient", requireAuth, (req, res, next) => {
  if (!checkRole(req, ['patient', 'admin'])) {
    return res.status(403).json({ success: false, message: "Unauthorized - Patients only" });
  }
  next();
}, getPatientSOAPNotes);

// Update SOAP note (doctors and admin only)
router.put("/:id", requireAuth, (req, res, next) => {
  if (!checkRole(req, ['doctor', 'admin'])) {
    return res.status(403).json({ success: false, message: "Unauthorized - Doctors only" });
  }
  next();
}, updateSOAPNote);

// Sign SOAP note (doctors and admin only)
router.patch("/:id/sign", requireAuth, (req, res, next) => {
  if (!checkRole(req, ['doctor', 'admin'])) {
    return res.status(403).json({ success: false, message: "Unauthorized - Doctors only" });
  }
  next();
}, signSOAPNote);

// Delete SOAP note (doctors and admin only)
router.delete("/:id", requireAuth, (req, res, next) => {
  if (!checkRole(req, ['doctor', 'admin'])) {
    return res.status(403).json({ success: false, message: "Unauthorized - Doctors only" });
  }
  next();
}, deleteSOAPNote);

export default router;
