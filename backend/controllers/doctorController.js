// backend/controllers/doctorController.js
import User from "../models/user.js";

export const listDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" }).select("name email picture");
    return res.json({ success: true, doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
