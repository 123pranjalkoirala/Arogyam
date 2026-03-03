// backend/controllers/doctorController.js
import User from "../models/user.js";
import Rating from "../models/rating.js";

export const listDoctors = async (req, res) => {
  try {
    // Filter out test/fake doctors - only show doctors with real accounts (have password or googleId)
    const doctors = await User.find({ 
      role: "doctor",
      $or: [
        { password: { $exists: true, $ne: null } },
        { googleId: { $exists: true, $ne: null } }
      ]
    })
      .select("name email picture specialization experience qualification consultationFee bio")
      .sort({ createdAt: -1 });

    // Get ratings for each doctor
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const ratings = await Rating.find({ doctorId: doctor._id });
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;
        
        return {
          ...doctor.toObject(),
          averageRating: Math.round(avgRating * 10) / 10,
          totalRatings: ratings.length
        };
      })
    );

    return res.json({ success: true, doctors: doctorsWithRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
