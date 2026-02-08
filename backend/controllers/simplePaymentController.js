// Payment Controller - Simplified Payment System
import Appointment from "../models/appointment.js";
import { requireAuth } from "../middleware/auth.js";

// Manual payment confirmation (replaces eSewa system)
export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.user.id;
    
    console.log("=== PAYMENT CONFIRMATION ===");
    console.log("User ID:", userId);
    console.log("Appointment ID:", appointmentId);

    // Verify appointment exists and belongs to user
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Check if user is authorized (patient or doctor)
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to confirm payment for this appointment" 
      });
    }

    // Update payment status to paid
    appointment.paymentStatus = "paid";
    appointment.paymentDate = new Date();
    await appointment.save();

    console.log("✅ Payment confirmed for appointment:", appointment._id);

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      appointment: appointment
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message
    });
  }
};

// Check payment status by appointment ID
export const checkPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    // Check if user is authorized to view this appointment
    if (appointment.patientId.toString() !== userId && appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view this appointment" 
      });
    }

    res.json({
      success: true,
      appointment: {
        _id: appointment._id,
        paymentStatus: appointment.paymentStatus,
        paymentDate: appointment.paymentDate,
        amount: appointment.amount || 500
      }
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message
    });
  }
};
