// backend/routes/doctors.js
import express from "express";
import { listDoctors } from "../controllers/doctorController.js";
const router = express.Router();

router.get("/", listDoctors);

export default router;
