// ========================================
// AUTHENTICATION ROUTES - User Authentication and Profile Management
// ========================================
// 
// PURPOSE: Handles all authentication-related API endpoints including login,
// registration, profile management, and Google OAuth integration.
// 
// ARCHITECTURE: Express.js router with middleware for authentication,
// proper error handling, and secure user data management.
// 
// AUTHOR: Arogyam Healthcare System Development Team
// VERSION: 2.0 (Enhanced with comprehensive commenting)
// LAST UPDATED: 2026

// ========================================
// IMPORTS - Required Dependencies and Controllers
// ========================================

// Express.js - Web framework for routing
import express from "express";

// Authentication Controllers - Business logic handlers
import { login, googleLogin } from "../controllers/authController.js";      // Login functionality
import { register } from "../controllers/registerController.js";          // Registration functionality
import { googleRegister } from "../controllers/googleRegisterController.js";    // Google registration

// Middleware - Request processing and security
import { requireAuth as auth } from "../middleware/auth.js";              // Authentication middleware
import { upload } from "../middleware/upload.js";                      // File upload middleware

// User Model - Database operations
import User from "../models/user.js";                                    // User data model

// ========================================
// ROUTER INITIALIZATION
// ========================================

const router = express.Router();

// ========================================
// AUTHENTICATION ENDPOINTS - User login and registration
// ========================================

// Regular Email/Password Login
// Endpoint: POST /api/auth/login
// Purpose: Authenticate users with email and password
// Request: { email, password }
// Response: { success, user, token }
router.post("/login", login);

// Google OAuth Login
// Endpoint: POST /api/auth/google-login
// Purpose: Authenticate users via Google OAuth
// Request: { tokenId, googleId }
// Response: { success, user, token }
router.post("/google-login", googleLogin);

// Regular Email Registration
// Endpoint: POST /api/auth/register
// Purpose: Register new users with email and password
// Request: { name, email, password, role, ... }
// Response: { success, user, token }
router.post("/register", register);

// Google OAuth Registration
// Endpoint: POST /api/auth/google-register
// Purpose: Register new users via Google OAuth
// Request: { tokenId, googleId, name, email, ... }
// Response: { success, user, token }
router.post("/google-register", googleRegister);

// ========================================
// PROFILE MANAGEMENT ENDPOINTS - User profile operations
// ========================================

// Get Current User Profile
// Endpoint: GET /api/auth/me
// Purpose: Retrieve authenticated user's profile information
// Authentication: Required (JWT token)
// Response: { success, user }
router.get("/me", auth, async (req, res) => {
  try {
    // Find user by ID from JWT token
    // Exclude password from response for security
    const user = await User.findById(req.user.id).select("-password");
    
    // User not found handling
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    // Success - Return user data
    return res.json({ success: true, user });
  } catch (err) {
    // Error handling
    console.error("Get user error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update User Profile
// Endpoint: PUT /api/auth/me
// Purpose: Update authenticated user's profile information
// Authentication: Required (JWT token)
// Request: { name, phone, gender, address, dateOfBirth, ... }
// Response: { success, user }
router.put("/me", auth, async (req, res) => {
  try {
    // Extract updatable fields from request body
    const { name, phone, gender, address, dateOfBirth, specialization, experience, qualification, bio, consultationFee } = req.body;
    
    // Build update object with only provided fields
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
