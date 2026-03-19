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

const pendingAppointmentData = new Map();

const generateEsewaSignature = (data, secretKey) => {
    try {
        const dataString = String(data);
        const secretKeyString = String(secretKey);
        
        console.log("=== SIGNATURE DEBUG ===");
        console.log("Data String:", dataString);
        console.log("Secret Key:", secretKeyString ? "Present" : "Missing");
        
        const hmac = crypto.createHmac("sha256", secretKeyString);
        hmac.update(dataString, "utf8");
        
        const signature = hmac.digest("base64");
        console.log("Generated Signature:", signature);
        
        return signature;
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

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

const createAppointmentFromPaymentData = async (appointmentData, userId) => {
    const { doctorId, date, time, reason, amount, notes } = appointmentData;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
        throw new Error("Doctor not found");
    }

    const appointmentDataToCreate = {
        patientId: userId,
        doctorId,
        date,
        time,
        reason: reason || "General consultation",
        status: "approved",
        paymentStatus: "paid",
        paymentId: `esewa_${Date.now()}`,
        amount: amount || 500,
        paymentDate: new Date(),
        notes: notes || ""
    };

    const appointment = await Appointment.create(appointmentDataToCreate);
    
    await appointment.populate('patientId doctorId');
    
    return appointment;
};

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

        const appointment = await Appointment.create({
            patientId: userId,
            doctorId,
            date,
            time,
            reason: reason || "General consultation",
            status: "approved", // Admin approved, now patient needs to pay
            amount: appointmentAmount,
            paymentStatus: "pending"
        });

        // Store appointment data temporarily for callback processing
        pendingAppointmentData.set(appointment._id.toString(), {
            appointmentId: appointment._id,
            userId,
            doctorId,
            amount: appointment.amount
        });

        // Generate payment data for eSewa (matching reference implementation)
        const totalAmountFormatted = appointment.amount.toFixed(2);
        const signedFieldNames = "total_amount,transaction_uuid,product_code";
        
        // Generate signature using reference implementation format
        const signature = createEsewaSignature({
            total_amount: totalAmountFormatted,
            transaction_uuid: appointment._id.toString(),
            product_code: ESEWA_PRODUCT_CODE
        });

        const paymentData = {
            amount: totalAmountFormatted,
            tax_amount: "0",
            total_amount: totalAmountFormatted,
            transaction_uuid: appointment._id.toString(),
            product_code: ESEWA_PRODUCT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: ESEWA_SUCCESS_URL,
            failure_url: ESEWA_FAILURE_URL,
            signed_field_names: signedFieldNames,
            signature: signature
        };

        console.log("=== eSewa Payment Initiated ===");
        console.log("Payment Data:", paymentData);
        console.log("Signature String:", `total_amount=${totalAmountFormatted},transaction_uuid=${appointment._id.toString()},product_code=${ESEWA_PRODUCT_CODE}`);
        console.log("Generated Signature:", signature);
        console.log("All Payment Fields:");
        Object.entries(paymentData).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        res.status(200).json({
            success: true,
            message: "Payment initiated successfully",
            data: {
                transactionUuid: appointment._id.toString(),
                formData: paymentData,
                formUrl: ESEWA_BASE_URL
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

export const esewaPaymentCallback = async (req, res) => {
    try {
        let callbackData = req.query || {};

        if (callbackData.data) {
            const decodedJson = Buffer.from(callbackData.data, "base64").toString("utf-8");
            callbackData = JSON.parse(decodedJson);
        }

        console.log("Decoded eSewa callback data:", callbackData);

        const transaction_code = callbackData.transaction_code;
        const status = callbackData.status;
        const total_amount = callbackData.total_amount;
        const transaction_uuid = callbackData.transaction_uuid;
        const product_code = callbackData.product_code;
        const signed_field_names = callbackData.signed_field_names;
        const signature = callbackData.signature;

        const appointmentData = pendingAppointmentData.get(transaction_uuid);

        if (!appointmentData) {
            return res.redirect(`${frontendURL}/payment/failed?error=appointment_data_not_found`);
        }

        // Verify merchant code
        if (merchant_code !== ESEWA_MERCHANT_CODE) {
            console.error("Invalid merchant code:", merchant_code);
            return res.redirect(`${frontendURL}/payment/failed?error=invalid_merchant`);
        }

        // Verify product code
        if (product_code !== ESEWA_PRODUCT_CODE) {
            console.error("Invalid product code:", product_code);
            return res.redirect(`${frontendURL}/payment/failed?error=invalid_product`);
        }

        // Verify signature
        const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const expectedSignature = generateEsewaSignature(signatureString, ESEWA_SECRET_KEY);

        console.log("Signature verification:");
        console.log("Received:", signature);
        console.log("Expected:", expectedSignature);
        console.log("Signature String:", signatureString);

        if (signature !== expectedSignature) {
            console.error("Invalid signature");
            return res.redirect(`${frontendURL}/payment/failed?error=invalid_signature`);
        }

        // Find appointment
        const appointment = await Appointment.findById(transaction_uuid);
        if (!appointment) {
            console.error("Appointment not found:", transaction_uuid);
            return res.redirect(`${frontendURL}/payment/failed?error=appointment_not_found`);
        }

        // Update appointment payment status
        appointment.paymentStatus = "paid";
        appointment.eSewaTransactionId = transaction_uuid;
        appointment.paymentDate = new Date();
        appointment.status = "approved"; // Approve after successful payment
        await appointment.save();

        console.log("Payment successful for appointment:", appointment._id);

        // Clean up pending data
        pendingAppointmentData.delete(transaction_uuid);

        // Redirect to success page
        return res.redirect(`${frontendURL}/payment/success?appointmentId=${appointment._id}`);

    } catch (error) {
        console.error("Error handling eSewa payment callback:", error);
        return res.redirect(`${frontendURL}/payment/failed?error=callback_error`);
    }
};

export const getPaymentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user.id;

        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId doctorId');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        if (appointment.patientId._id.toString() !== userId && appointment.doctorId._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this appointment"
            });
        }

        res.json({
            success: true,
            data: {
                appointmentId: appointment._id,
                paymentStatus: appointment.paymentStatus,
                amount: appointment.amount,
                paymentDate: appointment.paymentDate,
                transactionId: appointment.eSewaTransactionId,
                status: appointment.status
            }
        });
    } catch (error) {
        console.error("Error getting payment status:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to get payment status"
        });
    }
};
