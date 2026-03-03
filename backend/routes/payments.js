import express from 'express';
import { initiateEsewaPayment, esewaPaymentCallback, getPaymentStatus } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/esewa/initiate', requireAuth, initiateEsewaPayment);
router.get('/esewa/callback', esewaPaymentCallback);
router.get('/status/:appointmentId', requireAuth, getPaymentStatus);

export default router;
