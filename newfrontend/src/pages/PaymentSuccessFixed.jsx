import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaClock } from "react-icons/fa";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const appointmentId = searchParams.get("appointmentId");
      const transactionUuid = searchParams.get("transactionUuid");
      const isDemo = searchParams.get("demo");
      const amount = searchParams.get("amount");

      // Handle demo payment
      if (isDemo === "true") {
        setStatus("success");
        toast.success(`Demo payment of Rs. ${amount} successful!`);
        return;
      }

      if (!appointmentId) {
        setStatus("failed");
        toast.error("Invalid payment details");
        return;
      }

      try {
        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          setStatus("failed");
          toast.error("Please login to verify payment");
          navigate("/login");
          return;
        }

        // First try to verify payment status with backend
        const res = await fetch(`http://localhost:5000/api/payments/esewa/status/${appointmentId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();

        if (data.success && data.appointment.paymentStatus === "paid") {
          setStatus("success");
          setAppointment(data.appointment);
          toast.success("Payment successful! Your appointment has been confirmed.");
        } else {
          // If backend shows pending, it means eSewa callback hasn't arrived yet
          // Show manual verification option
          setStatus("manual-verify");
          setAppointment(data.appointment || { _id: appointmentId });
        }
      } catch (err) {
        setStatus("manual-verify");
        toast.info("Payment verification pending. Please verify manually.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleManualVerify = async () => {
    setStatus("verifying");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/payments/esewa/status/${appointment._id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();

      if (data.success && data.appointment.paymentStatus === "paid") {
        setStatus("success");
        setAppointment(data.appointment);
        toast.success("Payment verified! Your appointment has been confirmed.");
      } else {
        setStatus("failed");
        toast.error("Payment not found. Please contact support.");
      }
    } catch (err) {
      setStatus("failed");
      toast.error("Network error during verification");
    }
  };

  const handleConfirmPayment = async () => {
    setStatus("verifying");
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/payments/manual-confirm`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          appointmentId: appointment._id
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setAppointment(data.appointment);
        toast.success("Payment confirmed! Your appointment has been verified.");
      } else {
        setStatus("failed");
        toast.error(data.message || "Failed to confirm payment");
      }
    } catch (err) {
      setStatus("failed");
      toast.error("Network error during confirmation");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <FaSpinner className="animate-spin text-6xl text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment status.</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your appointment has been confirmed.</p>
            {appointment && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Appointment ID:</strong> {appointment._id}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Time:</strong> {appointment.time}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Amount:</strong> Rs. {appointment.amount || 500}
                </p>
              </div>
            )}
            <button
              onClick={() => navigate("/patient-dashboard")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        );

      case "manual-verify":
        return (
          <div className="text-center">
            <FaClock className="text-6xl text-yellow-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Verification Pending</h2>
            <p className="text-gray-600 mb-6">
              Your payment was successful, but we're waiting for confirmation from eSewa.
              This usually takes a few minutes.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>What happened?</strong>
              </p>
              <p className="text-sm text-yellow-800">
                eSewa has deducted the amount, but their confirmation hasn't reached our system yet.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleManualVerify}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check Payment Status Again
              </button>
              
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Payment Manually
              </button>
              
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="text-center">
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. If you were charged, please contact support.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentSuccess;
