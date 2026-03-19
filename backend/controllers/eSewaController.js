// eSewa Payment Controller - Based on Official API Documentation
import axios from "axios";
import crypto from "crypto";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";
import dotenv from "dotenv";

dotenv.config();

// eSewa Configuration
const ESEWA_BASE_URL = process.env.ESEWA_BASE_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_MERCHANT_CODE = process.env.ESEWA_MERCHANT_CODE || "EPAYTEST";
const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY;
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

console.log("=== ESEWA CONFIGURATION ===");
console.log("ESEWA_SECRET_KEY exists:", !!ESEWA_SECRET_KEY);
console.log("ESEWA_MERCHANT_CODE:", ESEWA_MERCHANT_CODE);
console.log("ESEWA_PRODUCT_CODE:", ESEWA_PRODUCT_CODE);

if (!ESEWA_SECRET_KEY) {
    console.error("WARNING: ESEWA_SECRET_KEY is not set in environment variables!");
}

/**
 * Generate unique request ID for eSewa
 */
const generateRequestId = () => {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate eSewa signature using HMAC SHA256
 */
const generateEsewaSignature = (data, secretKey) => {
    try {
        const dataString = String(data);
        const secretKeyString = String(secretKey);
        
        const hmac = crypto.createHmac("sha256", secretKeyString);
        hmac.update(dataString, "utf8");
        
        return hmac.digest("base64");
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

/**
 * Create eSewa signature for payment initiation
 */
function createEsewaSignature({ total_amount, transaction_uuid, product_code }) {
    const totalAmountStr = String(total_amount).trim();
    const transactionUuidStr = String(transaction_uuid).trim();
    const productCodeStr = String(product_code).trim();
    
    const message = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
    const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
    hmac.update(message, 'utf8');
    const signature = hmac.digest('base64');
    return signature;
}

/**
 * Initiate eSewa Payment
 * Creates appointment and returns payment form data
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

        console.log("=== ESEWA PAYMENT INITIATION ===");
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

        // Generate unique transaction UUID
        const transactionUuid = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
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

        // Generate payment data for eSewa
        const totalAmountFormatted = appointmentAmount.toFixed(2);
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        
        // Generate signature
        const signature = createEsewaSignature({
            total_amount: totalAmountFormatted,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE
        });

        const paymentData = {
            amount: totalAmountFormatted,
            tax_amount: "0",
            total_amount: totalAmountFormatted,
            transaction_uuid: transactionUuid,
            product_code: ESEWA_PRODUCT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `http://localhost:5000/api/esewa/callback`,
            failure_url: `http://localhost:5000/api/esewa/callback`,
            signed_field_names: signedFieldNames,
            signature: signature
        };

        console.log("=== ESEWA PAYMENT INITIATED ===");
        console.log("Payment Data:", paymentData);
        console.log("Signature String:", `total_amount=${totalAmountFormatted},transaction_uuid=${transactionUuid},product_code=${ESEWA_PRODUCT_CODE}`);
        console.log("Generated Signature:", signature);

        res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                transactionUuid: transactionUuid,
                formData: paymentData,
                formUrl: ESEWA_BASE_URL,
                appointmentId: appointment._id
            }
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
 * Handle eSewa Payment Callback
 * Updates appointment status based on payment result
 */
export const esewaPaymentCallback = async (req, res) => {
    try {
        console.log("=== ESEWA PAYMENT CALLBACK RECEIVED ===");
        console.log("Request method:", req.method);
        console.log("Request URL:", req.url);
        console.log("Request query:", req.query);
        console.log("Request body:", req.body);
        console.log("Request headers:", req.headers);

        // eSewa sends data as base64 encoded in query parameter 'data'
        let callbackData = {};
        
        if (req.query.data) {
            try {
                console.log("Decoding base64 data:", req.query.data);
                const decodedJson = Buffer.from(req.query.data, 'base64').toString("utf-8");
                callbackData = JSON.parse(decodedJson);
                console.log("Decoded eSewa callback data:", callbackData);
            } catch (decodeError) {
                console.error("Error decoding callback data:", decodeError);
                return res.status(400).send("Invalid callback data");
            }
        } else if (req.body && Object.keys(req.body).length > 0) {
            callbackData = req.body;
        }

        const {
            transaction_code,
            total_amount,
            transaction_uuid,
            product_code,
            signature,
            status
        } = callbackData;

        console.log("Extracted callback data:");
        console.log("  transaction_code:", transaction_code);
        console.log("  total_amount:", total_amount);
        console.log("  transaction_uuid:", transaction_uuid);
        console.log("  product_code:", product_code);
        console.log("  status:", status);

        // Validate required fields
        if (!transaction_uuid) {
            console.error("Missing transaction_uuid from callback");
            return res.status(400).send("Missing transaction_uuid");
        }

        // Find appointment by paymentId
        console.log("Searching for appointment with paymentId:", transaction_uuid);
        const appointment = await Appointment.findOne({ paymentId: transaction_uuid });
        
        if (!appointment) {
            console.error("Appointment not found for transaction:", transaction_uuid);
            console.log("Searching all appointments to see what paymentIds exist...");
            const allAppointments = await Appointment.find({ paymentId: { $exists: true } });
            console.log("Found appointments with paymentId:", allAppointments.map(a => ({ id: a._id, paymentId: a.paymentId })));
            return res.status(404).send("Appointment not found");
        }

        console.log("Found appointment:", appointment._id);
        console.log("Current payment status:", appointment.paymentStatus);

        // Prevent duplicate processing
        if (appointment.paymentStatus === "paid") {
            console.log("Payment already processed for appointment:", appointment._id);
            return res.redirect(`${CLIENT_URL}/payment-success?appointmentId=${appointment._id}`);
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

            return res.redirect(`${CLIENT_URL}/payment-success?appointmentId=${appointment._id}`);

        } else if (status === "FAILED") {
            // Update appointment as failed
            await Appointment.findByIdAndUpdate(appointment._id, {
                paymentStatus: "failed",
                status: "pending"
            });

            return res.redirect(`${CLIENT_URL}/payment-failed?appointmentId=${appointment._id}`);

        } else {
            console.error("Unknown payment status:", status);
            return res.redirect(`${CLIENT_URL}/payment-failed?appointmentId=${appointment._id}`);
        }

    } catch (error) {
        console.error("Error in eSewa callback:", error);
        res.status(500).send("Internal server error");
    }
};

/**
 * Check Payment Status
 * Returns current payment status for an appointment
 */
export const checkPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const appointment = await Appointment.findOne({ 
            _id: appointmentId, 
            patientId: userId 
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                appointmentId: appointment._id,
                paymentStatus: appointment.paymentStatus,
                status: appointment.status,
                amount: appointment.amount,
                paymentDate: appointment.paymentDate,
                transactionCode: appointment.transactionCode,
                paymentId: appointment.paymentId
            }
        });

    } catch (error) {
        console.error("Error checking payment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check payment status"
        });
    }
};

/**
 * Process Payment (Based on API Documentation)
 * For processing payment after receiving transaction_code from eSewa
 */
export const processPayment = async (req, res) => {
    try {
        const { request_id, amount, transaction_code } = req.body;
        const userId = req.user.id;

        console.log("=== PROCESS ESEWA PAYMENT ===");
        console.log("Request ID:", request_id);
        console.log("Amount:", amount);
        console.log("Transaction Code:", transaction_code);

        if (!request_id || !amount || !transaction_code) {
            return res.status(400).json({
                success: false,
                message: "request_id, amount, and transaction_code are required"
            });
        }

        // Find appointment by transaction code or request ID
        let appointment = await Appointment.findOne({ 
            transactionCode: transaction_code 
        });

        if (!appointment) {
            // Try finding by paymentId if transactionCode not found
            appointment = await Appointment.findOne({ 
                paymentId: request_id 
            });
        }

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found for this transaction"
            });
        }

        // Verify amount matches
        if (parseFloat(amount) !== parseFloat(appointment.amount)) {
            return res.status(400).json({
                success: false,
                message: "Amount mismatch"
            });
        }

        // Update appointment as paid
        await Appointment.findByIdAndUpdate(appointment._id, {
            paymentStatus: "paid",
            paymentDate: new Date(),
            status: "approved",
            transactionCode: transaction_code
        });

        // Generate reference code
        const reference_code = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        console.log("=== PAYMENT PROCESSED SUCCESSFULLY ===");
        console.log("Appointment:", appointment._id);
        console.log("Reference Code:", reference_code);

        // Send notifications
        try {
            await Notification.create({
                userId: appointment.patientId,
                type: "payment_success",
                title: "Payment Successful",
                message: `Payment of Rs. ${amount} for your appointment on ${appointment.date} has been processed successfully.`,
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

        res.status(200).json({
            success: true,
            data: {
                request_id: request_id,
                response_code: 0,
                response_message: "Payment successful",
                amount: parseFloat(amount),
                reference_code: reference_code
            }
        });

    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({
            success: false,
            data: {
                request_id: req.body.request_id || "",
                response_code: 1,
                response_message: "Payment processing failed",
                amount: req.body.amount || 0,
                reference_code: ""
            }
        });
    }
};

/**
 * Check Transaction Status (Based on API Documentation)
 * For checking status of a transaction
 */
export const checkTransactionStatus = async (req, res) => {
    try {
        const { request_id, amount, transaction_code } = req.body;

        console.log("=== CHECK TRANSACTION STATUS ===");
        console.log("Request ID:", request_id);
        console.log("Amount:", amount);
        console.log("Transaction Code:", transaction_code);

        if (!request_id || !amount || !transaction_code) {
            return res.status(400).json({
                success: false,
                message: "request_id, amount, and transaction_code are required"
            });
        }

        // Find appointment
        const appointment = await Appointment.findOne({ 
            transactionCode: transaction_code 
        });

        if (!appointment) {
            return res.status(200).json({
                success: true,
                data: {
                    request_id: request_id,
                    response_code: 3,
                    status: "NOT FOUND",
                    response_message: "Payment not found",
                    amount: parseFloat(amount),
                    reference_code: ""
                }
            });
        }

        let status, response_code, response_message, reference_code;

        if (appointment.paymentStatus === "paid") {
            status = "SUCCESS";
            response_code = 0;
            response_message = "Payment successful";
            reference_code = appointment.transactionCode || "";
        } else if (appointment.paymentStatus === "failed") {
            status = "FAILED";
            response_code = 1;
            response_message = "Payment failed";
            reference_code = "";
        } else {
            status = "PENDING";
            response_code = 2;
            response_message = "Payment is being processed";
            reference_code = "";
        }

        console.log("=== TRANSACTION STATUS ===");
        console.log("Status:", status);
        console.log("Response Code:", response_code);

        res.status(200).json({
            success: true,
            data: {
                request_id: request_id,
                response_code: response_code,
                status: status,
                response_message: response_message,
                amount: parseFloat(amount),
                reference_code: reference_code
            }
        });

    } catch (error) {
        console.error("Error checking transaction status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check transaction status"
        });
    }
};
