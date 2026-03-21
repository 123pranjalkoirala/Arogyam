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
import paymentRoutes from "./routes/payments.js";
import eSewaRoutes from "./routes/eSewaRoutes.js";
import ratingsRoutes from "./routes/ratings.js";
import path from "path";
import notificationsRoutes from "./routes/notifications.js";
import soapRoutes from "./routes/soap.js";
import doctorScheduleRoutes from "./routes/doctorSchedule.js";
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/esewa", eSewaRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/soap", soapRoutes);
app.use("/api/doctor-schedule", doctorScheduleRoutes);
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/api/notifications", notificationsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
