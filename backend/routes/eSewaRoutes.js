// eSewa Payment Routes
import express from "express";
import { 
    initiateEsewaPayment, 
    esewaPaymentCallback, 
    checkPaymentStatus,
    processPayment,
    checkTransactionStatus 
} from "../controllers/eSewaController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Initiate eSewa payment
router.post("/initiate", requireAuth, initiateEsewaPayment);

// Handle eSewa callback (no auth required - eSewa calls this)
// eSewa can send both GET and POST requests
router.get("/callback", esewaPaymentCallback);
router.post("/callback", esewaPaymentCallback);

// Check payment status for appointment
router.get("/status/:appointmentId", requireAuth, checkPaymentStatus);

// Process payment (based on API documentation)
router.post("/payment", requireAuth, processPayment);

// Check transaction status (based on API documentation)
router.post("/status", requireAuth, checkTransactionStatus);

export default router;
