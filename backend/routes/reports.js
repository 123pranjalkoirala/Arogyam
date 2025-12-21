import express from "express";
import multer from "multer";
import Report from "../models/report.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// Doctor uploads report
router.post("/upload", requireAuth, upload.single("report"), async (req, res) => {
  try {
    const { patientId, appointmentId, title } = req.body;

    const report = await Report.create({
      patientId,
      doctorId: req.user.id,
      appointmentId,
      title,
      fileUrl: `/uploads/${req.file.filename}`
    });

    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Patient & Doctor view reports
router.get("/", requireAuth, async (req, res) => {
  const reports = await Report.find({
    $or: [{ patientId: req.user.id }, { doctorId: req.user.id }]
  });
  res.json({ success: true, reports });
});

export default router;
