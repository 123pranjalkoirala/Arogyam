import express from "express";
import Availability from "../models/availability.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* Doctor sets availability */
router.post("/", requireAuth, async (req, res) => {
  if (req.user.role !== "doctor") return res.sendStatus(403);

  const { day, slots } = req.body;
  const data = await Availability.create({
    doctorId: req.user.id,
    day,
    slots
  });

  res.json({ success: true, data });
});

/* Patient views availability */
router.get("/:doctorId", async (req, res) => {
  const data = await Availability.find({ doctorId: req.params.doctorId });
  res.json({ success: true, data });
});

export default router;
