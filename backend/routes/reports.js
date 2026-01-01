import express from "express";
import Report from "../models/report.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

/* ======================
   DOCTOR UPLOAD REPORT
====================== */
router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  if (req.user.role !== "doctor")
    return res.status(403).json({ success: false });

  const { patientId, title, appointmentId } = req.body;

  const report = await Report.create({
    patientId,
    doctorId: req.user.id,
    appointmentId,
    title,
    fileUrl: `/uploads/${req.file.filename}`
  });

  res.json({ success: true, report });
});

/* ======================
   PATIENT VIEW REPORTS
====================== */
router.get("/", requireAuth, async (req, res) => {
  if (req.user.role !== "patient")
    return res.status(403).json({ success: false });

  const reports = await Report.find({ patientId: req.user.id })
    .populate("doctorId", "name");

  res.json({ success: true, reports });
});

export default router;
