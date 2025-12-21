// backend/controllers/googleRegisterController.js
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleRegister = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential || !role) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ success: true, token, role: user.role, name: user.name });
    }

    user = await User.create({
      name: name || email.split("@")[0],
      email,
      googleId,
      picture,
      role,
      isVerified: true,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      message: "Google Registration Successful",
    });

  } catch (error) {
    console.error("GOOGLE REGISTER ERROR:", error);
    return res.status(400).json({ success: false, message: "Invalid Google token" });
  }
};
