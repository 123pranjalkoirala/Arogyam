// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import appointmentsRoutes from "./routes/appointments.js";
import doctorsRoutes from "./routes/doctors.js";
import adminRoutes from "./routes/admin.js";
import reportsRoutes from "./routes/reports.js";
import paymentsRoutes from "./routes/payments.js";
import path from "path";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/reports", reportsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
