// backend/controllers/paymentController.js
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import crypto from "crypto";

// eSewa Configuration (Test/Sandbox environment)
const ESEWA_SECRET = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
const ESEWA_MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
const ESEWA_URL = process.env.ESEWA_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

// Initiate payment
export const initiatePayment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get doctor to get consultation fee
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const amount = doctor.consultationFee || 500; // Default fee
    const taxAmount = 0;
    const totalAmount = amount + taxAmount;
    const transactionUUID = `AROGYAM-${Date.now()}-${doctorId}`;
    const productServiceCharge = 0;
    const productDeliveryCharge = 0;

    // Create signature
    const string = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=EPAYTEST`;
    const signature = crypto
      .createHash("sha256")
      .update(string)
      .digest("hex");

    // Return payment form data with booking details
    res.json({
      success: true,
      paymentData: {
        amount: totalAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUUID,
        product_code: "EPAYTEST",
        product_service_charge: productServiceCharge,
        product_delivery_charge: productDeliveryCharge,
        success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?paymentId=${transactionUUID}&doctorId=${doctorId}&date=${date}&time=${time}&reason=${encodeURIComponent(reason || "")}&amount=${amount}`,
        failure_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/failure`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature
      },
      bookingData: {
        doctorId,
        date,
        time,
        reason,
        amount,
        paymentId: transactionUUID
      },
      eSewaUrl: ESEWA_URL
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify payment (Callback from eSewa)
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    
    // Find appointment by paymentId
    const appointment = await Appointment.findOne({ paymentId });
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Update appointment payment status
    appointment.paymentStatus = "paid";
    appointment.eSewaTransactionId = transactionId;
    appointment.paymentDate = new Date();
    await appointment.save();

    return res.json({
      success: true,
      message: "Payment verified successfully",
      appointment
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    res.json({
      success: true,
      paymentStatus: appointment.paymentStatus,
      amount: appointment.amount,
      paymentId: appointment.paymentId,
      eSewaTransactionId: appointment.eSewaTransactionId
    });
  } catch (err) {
    console.error("Get payment status error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
