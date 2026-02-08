// backend/controllers/paymentController.js - COMPLETE WORKING ESEWA INTEGRATION
import crypto from "crypto";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import axios from "axios";

// eSewa Configuration - EXACT TEST CONFIGURATION
const ESEWA_PRODUCT_CODE = "EPAYTEST";
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";
const ESEWA_CLIENT_ID = "JB0BBQ4aD0UqIThFJwAKBgAXEUkEGQUBBAwdOgABHD4DChwUAB0R";
const ESEWA_CLIENT_SECRET = "BhwIWQQADhIYSxILExMcAgFXFhcOBwAKBgAXEQ==";

// eSewa URLs - TEST ENVIRONMENT
const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PAYMENT_URL = "https://rc-epay.esewa.com.np/api/epay/payment";
const ESEWA_STATUS_URL = "https://rc-epay.esewa.com.np/api/epay/status";

// Temporary storage for payment data
const paymentDataStore = new Map();

// Helper function to get user from token
const getUserFromToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        console.error("Token verification error:", error);
        return null;
    }
};

/**
 * Generate unique transaction UUID for eSewa
 */
const generateTransactionUuid = () => {
    return `AROGYAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate HMAC SHA256 signature for eSewa
 * Format: base64 encoded HMAC SHA256
 */
const generateEsewaSignature = (total_amount, transaction_uuid, product_code, secret_key) => {
    try {
        // Create signature string as per eSewa documentation
        const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        
        // Create HMAC with SHA256
        const hmac = crypto.createHmac("sha256", secret_key);
        hmac.update(signatureString, "utf8");
        
        // Return base64 encoded digest
        return hmac.digest("base64");
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

/**
 * Initiate eSewa Payment - WORKING VERSION
 */
export const initiateEsewaPayment = async (req, res) => {
    console.log("=== ESEWA PAYMENT INITIATION ===");
    
    try {
        const { appointmentId, amount } = req.body;
        const user = getUserFromToken(req);

        console.log("Payment request:", { appointmentId, amount, user: user?.id });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login."
            });
        }

        console.log("=== PAYMENT INITIATION DEBUG ===");
        console.log("Request body:", { appointmentId, amount });
        console.log("User:", user);

        let paymentAmount = amount;
        let appointment = null;

        // If appointmentId is provided, validate the appointment
        if (appointmentId) {
            console.log("Looking for appointment:", appointmentId);
            appointment = await Appointment.findById(appointmentId)
                .populate('doctorId', 'name specialization consultationFee')
                .populate('patientId', 'name email');

            console.log("Found appointment:", appointment);

            if (!appointment) {
                console.log("Appointment not found error");
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found"
                });
            }

            // Verify appointment belongs to user and is approved
            const patientIdStr = appointment.patientId._id ? appointment.patientId._id.toString() : appointment.patientId.toString();
            console.log("Patient ID comparison:", { patientIdStr, userId: user.id });
            
            if (patientIdStr !== user.id) {
                console.log("Ownership check failed");
                return res.status(403).json({
                    success: false,
                    message: "You can only pay for your own appointments"
                });
            }

            // Allow payment for any appointment that's not already paid
            // This implements the Book → Pay → Doctor Approval workflow

            if (appointment.paymentStatus === "paid") {
                console.log("Payment already completed");
                return res.status(400).json({
                    success: false,
                    message: "Payment already completed"
                });
            }

            paymentAmount = appointment.amount || 500;
        } else {
            // Demo payment - use provided amount
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Valid amount is required for demo payment"
                });
            }
            paymentAmount = amount;
        }

        // Generate payment details
        const transaction_uuid = generateTransactionUuid();
        const total_amount = paymentAmount.toFixed(2);

        // Generate signature
        const signature = generateEsewaSignature(total_amount, transaction_uuid, ESEWA_PRODUCT_CODE, ESEWA_SECRET_KEY);

        // Store payment data
        paymentDataStore.set(transaction_uuid, {
            appointmentId: appointment?._id || null,
            userId: user.id,
            amount: paymentAmount,
            isDemo: !appointmentId,
            timestamp: new Date()
        });

        console.log("Payment details:", {
            transaction_uuid,
            amount: total_amount,
            appointmentId: appointment?._id,
            isDemo: !appointmentId
        });

        // Return form data for eSewa submission
        const formData = {
            amount: total_amount,
            tax_amount: "0",
            total_amount: total_amount,
            transaction_uuid: transaction_uuid,
            product_code: ESEWA_PRODUCT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success`,
            failure_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature
        };

        console.log("Form data prepared:", formData);

        res.json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                formData: formData,
                formUrl: ESEWA_FORM_URL
            }
        });

    } catch (error) {
        console.error("Payment initiation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate payment",
            error: error.message
        });
    }
};

/**
 * Handle eSewa Payment Callback - WORKING VERSION
 */
export const esewaPaymentCallback = async (req, res) => {
    console.log("=== ESEWA CALLBACK RECEIVED ===");
    console.log("Method:", req.method);
    console.log("Query:", req.query);
    console.log("Body:", req.body);

    try {
        // Get callback data from query or body
        const callbackData = { ...req.query, ...req.body };

        const {
            transaction_uuid,
            total_amount,
            transaction_code,
            status
        } = callbackData;

        if (!transaction_uuid) {
            console.error("Missing transaction_uuid");
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=missing_transaction`);
        }

        // Get stored payment data
        const paymentData = paymentDataStore.get(transaction_uuid);
        
        if (!paymentData) {
            console.error("Payment data not found for:", transaction_uuid);
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=data_not_found`);
        }

        console.log("Payment data found:", paymentData);

        if (status === "COMPLETE" || status === "SUCCESS") {
            const paymentData = paymentDataStore.get(transaction_uuid);
            
            if (paymentData.isDemo) {
                // Demo payment - just log success
                console.log("✅ Demo payment successful:", {
                    transaction_uuid,
                    amount: paymentData.amount,
                    userId: paymentData.userId
                });
                
                // Remove from store
                paymentDataStore.delete(transaction_uuid);
                
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?demo=true&amount=${paymentData.amount}`);
            } else {
                // Real appointment payment
                const appointment = await Appointment.findById(paymentData.appointmentId);
                
                if (appointment) {
                    appointment.paymentStatus = "paid";
                    appointment.eSewaTransactionUuid = transaction_uuid;
                    appointment.eSewaTransactionCode = transaction_code;
                    appointment.paymentDate = new Date();
                    await appointment.save();
                    
                    console.log("✅ Payment successful for appointment:", appointment._id);
                    
                    // Remove from store
                    paymentDataStore.delete(transaction_uuid);
                    
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?appointmentId=${appointment._id}`);
                }
            }
        }

        // Handle failed payment
        paymentDataStore.delete(transaction_uuid);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?status=${status}`);

    } catch (error) {
        console.error("Callback error:", error);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=callback_error`);
    }
};

/**
 * Check Payment Status - WORKING VERSION
 */
export const checkPaymentStatus = async (req, res) => {
    try {
        const { transaction_uuid, amount, transaction_code } = req.body;
        const user = getUserFromToken(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Call eSewa status API
        try {
            const response = await axios.post(ESEWA_STATUS_URL, {
                request_id: transaction_uuid,
                amount: amount,
                transaction_code: transaction_code
            }, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${ESEWA_CLIENT_ID}:${ESEWA_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/json'
                }
            });

            const paymentData = response.data;
            console.log("Status check response:", paymentData);

            if (paymentData.response_code === 0) {
                res.json({
                    success: true,
                    message: "Payment verified successfully",
                    data: paymentData
                });
            } else {
                res.json({
                    success: false,
                    message: paymentData.response_message || "Payment verification failed",
                    data: paymentData
                });
            }

        } catch (apiError) {
            console.error("eSewa API error:", apiError);
            res.status(500).json({
                success: false,
                message: "Failed to verify payment with eSewa"
            });
        }

    } catch (error) {
        console.error("Status check error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check payment status"
        });
    }
};
