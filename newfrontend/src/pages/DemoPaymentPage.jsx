import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      const appointmentId = searchParams.get("appointmentId");
      
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
          toast.error("Please login to process payment");
          navigate("/login");
          return;
        }

        setStatus("processing");
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Call manual confirmation API to mark payment as complete
        const res = await fetch("http://localhost:5000/api/payments/manual-confirm", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            appointmentId: appointmentId
          })
        });

        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setAppointment(data.appointment);
          toast.success("Payment successful! Your appointment has been confirmed.");
        } else {
          setStatus("failed");
          toast.error(data.message || "Payment processing failed");
        }
      } catch (err) {
        setStatus("failed");
        toast.error("Network error during payment processing");
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <Loader2 className="animate-spin text-6xl text-blue-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Processing Payment...</h2>
            <p className="text-gray-600 mb-4">Please wait while we process your payment.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Payment Processing:</strong> Your payment is being processed securely.
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your appointment has been confirmed and payment processed successfully.</p>
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
                <p className="text-sm text-green-800">
                  <strong>Payment Status:</strong> {appointment.paymentStatus}
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

      case "failed":
        return (
          <div className="text-center">
            <XCircle className="text-6xl text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again or contact support.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/patient-dashboard")}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
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

export default PaymentPage;
