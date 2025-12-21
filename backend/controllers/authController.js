// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// NORMAL LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role)
      return res.status(400).json({ success: false, message: "All fields required" });

    const user = await User.findOne({ email, role });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (!user.password)
      return res.status(400).json({ success: false, message: "This account uses Google login" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ success: false, message: "Wrong password" });

    return res.json({
      success: true,
      token: generateToken(user),
      role: user.role,
      name: user.name,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    // NEW USER → assign chosen role
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        role,
        isVerified: true,
      });
    }

    // EXISTING USER → allow login only if role matches
    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `You are registered as ${user.role.toUpperCase()}, not ${role.toUpperCase()}`,
      });
    }

    return res.json({
      success: true,
      token: generateToken(user),
      role: user.role,
      name: user.name,
    });

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};
