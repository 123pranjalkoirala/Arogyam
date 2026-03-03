import express from "express";
import Rating from "../models/rating.js";
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Create rating (patient only, after completed appointment)
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Only patients can rate doctors" });
    }

    const { doctorId, appointmentId, rating, review } = req.body;

    if (!doctorId || !appointmentId || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // Verify appointment belongs to patient and is completed
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not your appointment" });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({ success: false, message: "Can only rate completed appointments" });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ appointmentId });
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review || "";
      await existingRating.save();
      return res.json({ success: true, rating: existingRating });
    }

    // Create new rating
    const newRating = await Rating.create({
      patientId: req.user.id,
      doctorId,
      appointmentId,
      rating,
      review: review || ""
    });

    res.json({ success: true, rating: newRating });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Already rated this appointment" });
    }
    console.error("Rating error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get ratings for a doctor
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const ratings = await Rating.find({ doctorId: req.params.doctorId })
      .populate("patientId", "name picture")
      .sort({ createdAt: -1 });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      ratings,
      averageRating: avgRating,
      totalRatings: ratings.length
    });
  } catch (err) {
    console.error("Get ratings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get rating for an appointment
router.get("/appointment/:appointmentId", requireAuth, async (req, res) => {
  try {
    const rating = await Rating.findOne({ appointmentId: req.params.appointmentId })
      .populate("patientId", "name picture");

    res.json({ success: true, rating });
  } catch (err) {
    console.error("Get rating error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;




