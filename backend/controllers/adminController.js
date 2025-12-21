// backend/controllers/adminController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";

const getUserFromHeader = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { id, role, name }
  } catch (err) { return null; }
};

export const listUsers = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user || user.role !== "admin") return res.status(403).json({ success: false, message: "Forbidden" });

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const changeRole = async (req, res) => {
  try {
    const user = getUserFromHeader(req);
    if (!user || user.role !== "admin") return res.status(403).json({ success: false });

    const { id } = req.params;
    const { role } = req.body;
    if (!["patient","doctor","admin"].includes(role)) return res.status(400).json({ success: false });

    const u = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    return res.json({ success: true, user: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
