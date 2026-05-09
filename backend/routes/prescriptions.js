// PRESCRIPTION ROUTES - API endpoints for prescription management
// PURPOSE: Handle prescription operations independent of SOAP notes

import express from "express";
import { 
  createPrescription, 
  getPatientPrescriptions, 
  getDoctorPrescriptions 
} from "../controllers/prescriptionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* ======================
   DOCTOR CREATE PRESCRIPTION
====================== */
router.post("/", requireAuth, createPrescription);

/* ======================
   PATIENT GET PRESCRIPTIONS
====================== */
router.get("/patient", requireAuth, getPatientPrescriptions);

/* ======================
   DOCTOR GET PRESCRIPTIONS
====================== */
router.get("/doctor", requireAuth, getDoctorPrescriptions);

export default router;
