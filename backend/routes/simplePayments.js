// Payment Routes - Simplified Payment System
import express from "express";
import {
  confirmPayment,
  checkPaymentStatus
} from "../controllers/simplePaymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Manual payment confirmation (replaces eSewa system)
router.post("/manual-confirm", requireAuth, confirmPayment);

// Check payment status by appointment ID
router.get("/status/:appointmentId", requireAuth, checkPaymentStatus);

export default router;
