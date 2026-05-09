// PRESCRIPTION CONTROLLER - Handle prescription operations
// PURPOSE: Manage prescription creation and retrieval independent of SOAP notes

import Prescription from "../models/prescription.js";
import { requireAuth } from "../middleware/auth.js";

/* ======================
   CREATE PRESCRIPTION
====================== */
export const createPrescription = async (req, res) => {
  try {
    console.log("=== CREATE PRESCRIPTION ===");
    console.log("User:", req.user);
    console.log("Request body:", req.body);
    
    if (req.user.role !== "doctor")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const { 
      patientId, 
      appointmentId, 
      medications, 
      instructions, 
      diagnosis, 
      symptoms, 
      allergies, 
      refills 
    } = req.body;

    // Validate required fields
    if (!patientId || !medications || medications.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Patient ID and at least one medication are required" 
      });
    }

    // Validate each medication
    for (const med of medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({ 
          success: false, 
          message: "Each medication must include name, dosage, frequency, and duration" 
        });
      }
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      medications,
      instructions,
      diagnosis,
      symptoms,
      allergies,
      refills: refills || 0
    });

    console.log("Prescription created:", prescription);
    res.json({ success: true, prescription });
  } catch (err) {
    console.error("Error creating prescription:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================
   GET PATIENT PRESCRIPTIONS
====================== */
export const getPatientPrescriptions = async (req, res) => {
  try {
    console.log("=== GET PATIENT PRESCRIPTIONS ===");
    console.log("User:", req.user);
    
    if (req.user.role !== "patient")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const prescriptions = await Prescription.find({ patientId: req.user.id })
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    console.log("Found prescriptions:", prescriptions.length);
    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Error fetching prescriptions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================
   GET DOCTOR PRESCRIPTIONS
====================== */
export const getDoctorPrescriptions = async (req, res) => {
  try {
    console.log("=== GET DOCTOR PRESCRIPTIONS ===");
    console.log("User:", req.user);
    
    if (req.user.role !== "doctor")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const prescriptions = await Prescription.find({ doctorId: req.user.id })
      .populate('patientId', 'name email phone')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 });

    console.log("Found prescriptions:", prescriptions.length);
    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error("Error fetching doctor prescriptions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
