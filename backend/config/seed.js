// backend/config/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

dotenv.config();
await connectDB();

const seed = async () => {
  try {
    // create admin
    const adminEmail = "admin@arogyam.local";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hash = await bcrypt.hash("admin123", 10);
      await User.create({ name: "System Admin", email: adminEmail, password: hash, role: "admin" });
      console.log("Admin created");
    } else {
      console.log("Admin exists");
    }

    // create doctors
    const docs = [
      { name: "Dr. Sita Sharma", email: "sita@arogyam.local", role: "doctor" },
      { name: "Dr. Ram Thapa", email: "ram@arogyam.local", role: "doctor" }
    ];
    for (const d of docs) {
      const ex = await User.findOne({ email: d.email });
      if (!ex) {
        const hash = await bcrypt.hash("doctor123", 10);
        await User.create({ name: d.name, email: d.email, password: hash, role: "doctor" });
        console.log("Created", d.email);
      } else console.log("Doctor exists", d.email);
    }

    console.log("Seed finished");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
