// backend/controllers/paymentController.js - Real eSewa Production Integration
import crypto from "crypto";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Real eSewa Production Configuration
const ESEWA_FORM_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_PRODUCT_CODE = "EPAYTEST";    
const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q";

// Validate eSewa configuration
if (!ESEWA_SECRET_KEY) {
    console.error("⚠️  WARNING: ESEWA_SECRET_KEY is not set in environment variables!");
    console.error("   Please add ESEWA_SECRET_KEY to your .env file");
}

// Your frontend URLs
const SUCCESS_URL = "http://localhost:5173/payment/success";
const FAILURE_URL = "http://localhost:5173/payment/failure";

const getUserFromToken = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return null;
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
};

// Generate correct eSewa signature
const generateSignature = ({ total_amount, transaction_uuid, product_code }) => {
    try {
        // Ensure data is a string
        const dataString = String(data);
        // Ensure secretKey is a string
        const secretKeyString = String(secretKey);
        
        // Create HMAC with SHA256
        const hmac = crypto.createHmac("sha256", secretKeyString);
        hmac.update(dataString, "utf8");
        
        // Return base64 encoded digest
        return hmac.digest("base64");
    } catch (error) {
        console.error("Error generating eSewa signature:", error);
        throw error;
    }
};

// Generate unique transaction UUID
const generateTransactionUUID = () => {
    return `APPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Temporary storage for pending payment data
const pendingBookingData = new Map();

// Initiate eSewa payment
export const initiateEsewaPayment = async (req, res) => {
  try {
    const { doctorId, date, time, reason, amount } = req.body;
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Validate required fields
    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Create appointment record
    const appointment = new Appointment({
      doctorId,
      patientId: user.id,
      date,
      time,
      reason,
      amount: amount || 500, // Default consultation fee
      status: "pending",
      paymentStatus: "pending"
    });

    await appointment.save();

    // Generate eSewa payment parameters
    const transaction_uuid = generateTransactionUUID();
    const total_amount = appointment.amount.toString();
    const signature = generateSignature({
      total_amount,
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE
    });

    // Update appointment with transaction details
    appointment.eSewaTransactionId = transaction_uuid;
    appointment.paymentDate = new Date();
    await appointment.save();

    // Return payment initiation details
    res.json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        appointmentId: appointment._id,
        paymentUrl: ESEWA_FORM_URL,
        formData: {
          amount: total_amount,
          tax_amount: "0",
          total_amount: total_amount,
          transaction_uuid: transaction_uuid,
          product_code: ESEWA_PRODUCT_CODE,
          product_service_charge: "0",
          signature: signature,
          signed_field_names: "total_amount,transaction_uuid,product_code,product_service_charge",
          success_url: SUCCESS_URL,
          failure_url: FAILURE_URL
        }
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

// Handle eSewa payment callback (success/failure)
export const esewaPaymentCallback = async (req, res) => {
    try {
        // Log all incoming data for debugging
        console.log("=== eSewa Callback Received ===");
        console.log("Method:", req.method);
        console.log("Query params:", JSON.stringify(req.query, null, 2));
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("Headers:", JSON.stringify(req.headers, null, 2));
        console.log("================================");

        // eSewa can send data via GET (query params) or POST (form data)
        // Try to get data from both sources
        const queryData = req.query || {};
        const bodyData = req.body || {};
        
        // Merge both sources (body takes precedence for POST)
        const callbackData = {
            ...queryData,
            ...bodyData
        };

        // Decode base64-encoded payload if eSewa sent everything in a single `data` field
        // Some gateways send `data` as base64 JSON instead of individual params
        if (callbackData.data) {
            try {
                const decodedJson = Buffer.from(callbackData.data, "base64").toString("utf-8");
                let decodedObject = null;

                try {
                    decodedObject = JSON.parse(decodedJson);
                } catch {
                    // Some providers send URL-encoded query strings instead of JSON
                    const params = new URLSearchParams(decodedJson);
                    decodedObject = Object.fromEntries(params.entries());
                }

                if (decodedObject) {
                    Object.assign(callbackData, decodedObject);
                    console.log("Decoded base64 callback data:", decodedObject);
                    delete callbackData.data; // avoid double-handling later
                }
            } catch (decodeErr) {
                console.error("Failed to decode base64 callback data:", decodeErr);
            }
        }

        // Extract data - handle both standard and alternative field names
        const transaction_code = callbackData.transaction_code || callbackData.ref_id || callbackData.transactionCode;
        const status = callbackData.status || callbackData.Status;
        const total_amount = callbackData.total_amount || callbackData.totalAmount;
        // transaction_uuid is critical - try multiple variations
        const transaction_uuid = callbackData.transaction_uuid || 
                                 callbackData.transactionUuid ||
                                 callbackData.uuid ||
                                 callbackData.transactionUUID;
        const product_code = callbackData.product_code || callbackData.productCode;
        const signed_field_names = callbackData.signed_field_names || callbackData.signedFieldNames;
        const signature = callbackData.signature;

        console.log("Extracted callback data:", {
            transaction_code,
            status,
            total_amount,
            transaction_uuid,
            product_code,
            signed_field_names: signed_field_names ? signed_field_names.substring(0, 50) + "..." : null,
            signature: signature ? signature.substring(0, 20) + "..." : null
        });

        // Find appointment by transaction UUID
        const appointment = await Appointment.findOne({ eSewaTransactionId: transaction_uuid });
        if (!appointment) {
            console.log("Appointment not found for transaction:", transaction_uuid);
            return res.redirect(FAILURE_URL);
        }

        // Verify signature if provided
        // eSewa callback signature format: field_name=value,field_name=value,...
        let signatureValid = true;
        if (signature && signed_field_names) {
            const signatureData = signed_field_names.split(",")
                .map(field => {
                    const fieldName = field.trim();
                    let fieldValue = "";
                    switch (fieldName) {
                        case "transaction_code": fieldValue = transaction_code || ""; break;
                        case "status": fieldValue = status || ""; break;
                        case "total_amount": fieldValue = total_amount || ""; break;
                        case "transaction_uuid": fieldValue = transaction_uuid || ""; break;
                        case "product_code": fieldValue = product_code || ""; break;
                        case "signed_field_names": fieldValue = signed_field_names || ""; break;
                        default: fieldValue = "";
                    }
                    return `${fieldName}=${fieldValue}`;
                })
                .join(",");

            const expectedSignature = createEsewaSignature({
                total_amount,
                transaction_uuid,
                product_code
            });
            signatureValid = signature === expectedSignature;
            
            if (!signatureValid) {
                console.error("Signature verification failed");
                console.error("Expected:", expectedSignature);
                console.error("Received:", signature);
                console.error("Signature data:", signatureData);
            }
        }

        // Handle different statuses
        if (status === "COMPLETE" && signatureValid) {
            try {
                // Verify amount matches (allow small floating point differences)
                if (Math.abs(parseFloat(total_amount) - appointment.amount) < 0.01) {
                    // Update appointment with payment success - but requires admin approval
                    appointment.paymentStatus = "paid";
                    appointment.status = "pending_approval"; // Changed from "approved"
                    appointment.esewaTransactionUuid = transaction_uuid;
                    appointment.esewaTransactionCode = transaction_code || null;
                    appointment.esewaRefId = transaction_code || null;
                    appointment.paymentDate = new Date();
                    await appointment.save();
                    
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?appointmentId=${appointment._id}`);
                } else {
                    // Amount mismatch - potential fraud
                    console.error("Amount mismatch. Expected:", appointment.amount, "Received:", total_amount);
                    return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=amount_mismatch`);
                }
            } catch (updateError) {
                console.error("Error updating appointment after payment:", updateError);
                return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=appointment_update_failed`);
            }
        } else if (status === "CANCELED" || status === "FAILURE") {
            // Payment cancelled/failed
            appointment.paymentStatus = "failed";
            appointment.status = "pending";
            await appointment.save();
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancelled`);
        } else {
            // Pending or other statuses - keep for status check
            return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/pending?status=${status || "PENDING"}&transactionUuid=${transaction_uuid}`);
        }
    } catch (error) {
        console.error("Error handling eSewa payment callback:", error);
        return res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/payment/failed?error=callback_error`);
    }
};

// Check payment status
export const checkEsewaPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Check if user owns this appointment
    if (appointment.patientId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({
      success: true,
      data: {
        appointmentId: appointment._id,
        paymentStatus: appointment.paymentStatus,
        status: appointment.status,
        eSewaTransactionId: appointment.eSewaTransactionId,
        amount: appointment.amount
      }
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message
    });
  }
};

// Verify payment (for frontend verification)
export const verifyEsewaPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const user = getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Check if user owns this appointment
    if (appointment.patientId.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const isPaid = appointment.paymentStatus === "paid";
    
    res.json({
      success: true,
      data: {
        appointmentId: appointment._id,
        paymentStatus: appointment.paymentStatus,
        status: appointment.status,
        isPaid,
        eSewaTransactionId: appointment.eSewaTransactionId,
        amount: appointment.amount,
        paymentDate: appointment.paymentDate
      }
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};