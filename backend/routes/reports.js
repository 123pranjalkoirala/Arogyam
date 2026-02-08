import express from "express";
import Report from "../models/report.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ======================
   DOCTOR UPLOAD REPORT WITH SOAP NOTES
====================== */
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  try {
    console.log("=== UPLOAD REPORT WITH SOAP ===");
    console.log("User:", req.user);
    console.log("Request body:", req.body);
    
    if (req.user.role !== "doctor")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const { patientId, title, appointmentId, subjective, objective, assessment, plan } = req.body;

    const report = await Report.create({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      title: title || "Prescription with Medical Notes",
      fileUrl: `/uploads/${req.file.filename}`,
      subjective,
      objective,
      assessment,
      plan
    });

    console.log("Report created:", report);
    res.json({ success: true, report });
  } catch (err) {
    console.error("Error uploading report:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ======================
   PATIENT VIEW REPORTS WITH SOAP NOTES
====================== */
router.get("/", requireAuth, async (req, res) => {
  try {
    console.log("=== GET PATIENT REPORTS ===");
    console.log("User:", req.user);
    
    if (req.user.role !== "patient")
      return res.status(403).json({ success: false, message: "Unauthorized" });

    const reports = await Report.find({ patientId: req.user.id })
      .populate('doctorId', 'name email specialization')
      .sort({ createdAt: -1 });

    console.log("Found reports:", reports.length);
    res.json({ success: true, reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
