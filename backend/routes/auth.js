import express from "express";
import { login, googleLogin } from "../controllers/authController.js";
import { register } from "../controllers/registerController.js";
import { googleRegister } from "../controllers/googleRegisterController.js";
import { requireAuth as auth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import User from "../models/user.js";

const router = express.Router();

// Regular Login
router.post("/login", login);

// Google Login
router.post("/google-login", googleLogin);

// Regular Register
router.post("/register", register);

// Google Register
router.post("/google-register", googleRegister);

// Get current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.error("Get user error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user profile
router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone, gender, address, dateOfBirth, specialization, experience, qualification, bio, consultationFee } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (specialization) updateData.specialization = specialization;
    if (experience) updateData.experience = experience;
    if (qualification) updateData.qualification = qualification;
    if (bio) updateData.bio = bio;
    if (consultationFee) updateData.consultationFee = consultationFee;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Upload profile picture
router.post("/me/upload-picture", auth, upload.single("picture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const pictureUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { picture: pictureUrl },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user, message: "Profile picture updated successfully" });
  } catch (err) {
    console.error("Upload picture error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
