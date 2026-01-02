// backend/routes/payments.js
import express from "express";
import { initiatePayment, verifyPayment, getPaymentStatus } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initiate payment (Patient only)
router.post("/initiate", requireAuth, initiatePayment);

// Verify payment callback (no auth required - called from payment gateway)
router.post("/verify", requireAuth, verifyPayment);

// Get payment status
router.get("/status/:appointmentId", requireAuth, getPaymentStatus);

export default router;








