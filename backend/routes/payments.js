// backend/routes/payments.js - Updated for working eSewa v2 test integration
import express from "express";
import {
  initiateEsewaPayment,
  esewaPaymentCallback,
  checkEsewaPaymentStatus,
  verifyEsewaPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initiate eSewa payment (requires authentication)
router.post("/initiate", requireAuth, initiateEsewaPayment);

// eSewa callback - called by eSewa (supports both GET and POST, no auth needed)
router.get("/callback", esewaPaymentCallback);
router.post("/callback", esewaPaymentCallback);

// Check payment status (requires authentication)
router.post("/status", requireAuth, checkEsewaPaymentStatus);

// Verify payment (requires authentication)
router.post("/verify", requireAuth, verifyEsewaPayment);

export default router;