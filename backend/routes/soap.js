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

// Helper function to check admin access
const checkAdminAccess = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === "Bearer admin-access-key-pranjal") {
    return true;
  }
  return req.user && req.user.role === "admin";
};

// Create SOAP note for appointment
router.post("/", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, createSOAPNote);

// Get SOAP note by appointment ID
router.get("/appointment/:appointmentId", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, getSOAPNoteByAppointment);

// Get all SOAP notes for doctor
router.get("/doctor", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, getDoctorSOAPNotes);

// Get all SOAP notes for patient
router.get("/patient", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, getPatientSOAPNotes);

// Update SOAP note
router.put("/:id", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, updateSOAPNote);

// Sign SOAP note (final authorization)
router.patch("/:id/sign", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, signSOAPNote);

// Delete SOAP note
router.delete("/:id", (req, res, next) => {
  if (!checkAdminAccess(req)) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  requireAuth(req, res, next);
}, deleteSOAPNote);

export default router;
