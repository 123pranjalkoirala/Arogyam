// Complete eSewa Payment Integration - Production Ready
import axios from "axios";
import crypto from "crypto";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const frontendURL = process.env.CLIENT_URL || "http://localhost:5173";
const ESEWA_BASE_URL = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_SUCCESS_URL = process.env.ESEWA_SUCCESS_URL || "http://localhost:5000/api/payments/esewa/callback";
const ESEWA_FAILURE_URL = process.env.ESEWA_FAILURE_URL || "http://localhost:5000/api/payments/esewa/failure";

console.log("=== ESEWA CONFIGURATION ===");
console.log("ESEWA_SECRET_KEY exists:", !!ESEWA_SECRET_KEY);
console.log("ESEWA_MERCHANT_CODE:", ESEWA_MERCHANT_CODE);
console.log("ESEWA_PRODUCT_CODE:", ESEWA_PRODUCT_CODE);
console.log("ESEWA_BASE_URL:", ESEWA_BASE_URL);

if (!ESEWA_SECRET_KEY) {
    console.error("WARNING: ESEWA_SECRET_KEY is not set in environment variables!");
    console.error("Please add ESEWA_SECRET_KEY to your .env file");
}

/**
 * Generate eSewa signature using HMAC SHA256
 * Format: total_amount={amount},transaction_uuid={id},product_code={code}
 */
const generateEsewaSignature = (total_amount, transaction_uuid, product_code) => {
    try {
        const totalAmountStr = String(total_amount).trim();
        const transactionUuidStr = String(transaction_uuid).trim();
        const productCodeStr = String(product_code).trim();
        
        const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
        
        console.log("=== SIGNATURE GENERATION ===");
        console.log("Message:", message);
        console.log("Secret Key exists:", !!ESEWA_SECRET_KEY);
        
        const hmac = crypto.createHmac("sha256", ESEWA_SECRET_KEY);
        hmac.update(message, "utf8");
        const signature = hmac.digest("base64");
        
        console.log("Generated Signature:", signature);
        return signature;
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

/**
 * Verify eSewa signature from callback
 */
const verifyEsewaSignature = (total_amount, transaction_uuid, product_code, received_signature) => {
    try {
        const expectedSignature = generateEsewaSignature(total_amount, transaction_uuid, product_code);
        
        console.log("=== SIGNATURE VERIFICATION ===");
        console.log("Received:", received_signature);
        console.log("Expected:", expectedSignature);
        console.log("Match:", received_signature === expectedSignature);
        
        // Use constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(expectedSignature),
            Buffer.from(received_signature)
        );
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
};

/**
 * Generate unique transaction UUID
 */
const generateTransactionUuid = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initiate eSewa payment for appointment
 */
export const initiateEsewaPayment = async (req, res) => {
    try {
        if (!ESEWA_SECRET_KEY) {
            return res.status(500).json({
                success: false,
                message: "Payment service is not configured. Please contact support."
            });
        }

        const { appointmentData } = req.body;
        const userId = req.user.id;

        console.log("=== PAYMENT INITIATION ===");
        console.log("User ID:", userId);
        console.log("Appointment Data:", appointmentData);

        if (!appointmentData) {
            return res.status(400).json({
                success: false,
                message: "Appointment data is required"
            });
        }

        const { doctorId, date, time, reason, amount } = appointmentData;

        if (!doctorId || !date || !time) {
            return res.status(400).json({
                success: false,
                message: "Doctor, date, and time are required"
            });
        }

        // Validate doctor exists
        const doctor = await User.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }

        const appointmentAmount = amount || 500;
        
        if (appointmentAmount < 1) {
            return res.status(400).json({
                success: false,
                message: "Amount must be at least Rs. 1"
            });
        }

        // Check if appointment already exists and is paid
        const existingAppointment = await Appointment.findOne({
            patientId: userId,
            doctorId,
            date,
            time,
            paymentStatus: { $in: ["paid", "processing"] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "Payment already initiated for this appointment"
            });
        }

        // Generate transaction details
        const transactionUuid = generateTransactionUuid();
        
        // Create appointment with pending payment
        const appointment = await Appointment.create({
            patientId: userId,
            doctorId,
            date,
            time,
            reason: reason || "General consultation",
            status: "pending",
            paymentStatus: "pending",
            paymentId: transactionUuid,
            amount: appointmentAmount,
            paymentDate: null,
            notes: ""
        });

        console.log("Created appointment:", appointment._id);

        // Generate signature
        const signature = generateEsewaSignature(appointmentAmount, transactionUuid, ESEWA_PRODUCT_CODE);

        // Prepare eSewa form data
        const paymentData = {
            formUrl: ESEWA_BASE_URL,
            formData: {
                merchant_code: ESEWA_MERCHANT_CODE,
                product_code: ESEWA_PRODUCT_CODE,
                total_amount: appointmentAmount,
                transaction_uuid: transactionUuid,
                signature: signature,
                success_url: `${frontendURL}/payment-success`,
                failure_url: `${frontendURL}/payment-failed`
            }
        };

        console.log("=== ESEWA PAYMENT INITIATED ===");
        console.log("Payment Data:", JSON.stringify(paymentData, null, 2));
        console.log("Signature String:", `total_amount=${appointmentAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`);
        console.log("Generated Signature:", signature);

        res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            paymentData,
            appointmentId: appointment._id,
            amount: appointmentAmount
        });

    } catch (error) {
        console.error("Error initiating eSewa payment:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment"
        });
    }
};

/**
 * Handle eSewa payment callback
 */
export const esewaPaymentCallback = async (req, res) => {
    try {
        console.log("=== ESEWA PAYMENT CALLBACK ===");
        console.log("Request body:", req.body);

        const {
            transaction_code,
            total_amount,
            transaction_uuid,
            product_code,
            signature,
            status
        } = req.body;

        // Validate required fields
        if (!transaction_code || !total_amount || !transaction_uuid || !product_code || !signature || !status) {
            console.error("Missing required callback parameters");
            return res.status(400).send("Missing required parameters");
        }

        // Verify product code
        if (product_code !== ESEWA_PRODUCT_CODE) {
            console.error("Invalid product code:", product_code);
            return res.status(400).send("Invalid product code");
        }

        // Verify signature
        const isValidSignature = verifyEsewaSignature(total_amount, transaction_uuid, product_code, signature);
        if (!isValidSignature) {
            console.error("Invalid signature received");
            return res.status(400).send("Invalid signature");
        }

        // Find appointment
        const appointment = await Appointment.findOne({ paymentId: transaction_uuid });
        if (!appointment) {
            console.error("Appointment not found for transaction:", transaction_uuid);
            return res.status(404).send("Appointment not found");
        }

        // Prevent duplicate processing
        if (appointment.paymentStatus === "paid") {
            console.log("Payment already processed for appointment:", appointment._id);
            return res.redirect(`${frontendURL}/payment-success?appointmentId=${appointment._id}`);
        }

        // Process payment based on status
        if (status === "COMPLETE") {
            // Verify amount matches
            if (parseFloat(total_amount) !== parseFloat(appointment.amount)) {
                console.error("Amount mismatch:", total_amount, "vs", appointment.amount);
                return res.status(400).send("Amount mismatch");
            }

            // Update appointment as paid
            await Appointment.findByIdAndUpdate(appointment._id, {
                paymentStatus: "paid",
                paymentDate: new Date(),
                status: "approved",
                transactionCode: transaction_code
            });

            console.log("=== PAYMENT SUCCESSFUL ===");
            console.log("Appointment updated:", appointment._id);

            // Send notifications
            try {
                await Notification.create({
                    userId: appointment.patientId,
                    type: "payment_success",
                    title: "Payment Successful",
                    message: `Payment of Rs. ${total_amount} for your appointment on ${appointment.date} has been successful.`,
                    read: false
                });

                await Notification.create({
                    userId: appointment.doctorId,
                    type: "appointment_payment",
                    title: "Payment Received",
                    message: `Payment received for appointment on ${appointment.date}.`,
                    read: false
                });
            } catch (notificationError) {
                console.error("Error sending notifications:", notificationError);
            }

            return res.redirect(`${frontendURL}/payment-success?appointmentId=${appointment._id}`);

        } else if (status === "FAILED") {
            // Update appointment as failed
            await Appointment.findByIdAndUpdate(appointment._id, {
                paymentStatus: "failed",
                status: "pending"
            });

            // Send notification to patient
            try {
                await Notification.create({
                    userId: appointment.patientId,
                    type: "payment_failed",
                    title: "Payment Failed",
                    message: "Your payment could not be processed. Please try again.",
                    read: false
                });
            } catch (notificationError) {
                console.error("Error sending notification:", notificationError);
            }

            return res.redirect(`${frontendURL}/payment-failed?appointmentId=${appointment._id}`);

        } else if (status === "CANCELLED") {
            // Update appointment as cancelled
            await Appointment.findByIdAndUpdate(appointment._id, {
                paymentStatus: "cancelled",
                status: "pending"
            });

            return res.redirect(`${frontendURL}/payment-failed?appointmentId=${appointment._id}`);
        } else {
            console.error("Unknown payment status:", status);
            return res.redirect(`${frontendURL}/payment-failed?appointmentId=${appointment._id}`);
        }

    } catch (error) {
        console.error("Error in eSewa callback:", error);
        res.status(500).send("Internal server error");
    }
};

/**
 * Get payment status for an appointment
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const appointment = await Appointment.findOne({ _id: appointmentId, patientId: userId });
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            appointment: {
                id: appointment._id,
                paymentStatus: appointment.paymentStatus,
                status: appointment.status,
                amount: appointment.amount,
                paymentDate: appointment.paymentDate,
                transactionCode: appointment.transactionCode
            }
        });

    } catch (error) {
        console.error("Error getting payment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get payment status"
        });
    }
};
