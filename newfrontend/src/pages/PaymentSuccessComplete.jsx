// Payment Success Page - Production Ready
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PaymentSuccessComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get('appointmentId');

    if (appointmentId) {
      // Verify payment status
      const verifyPayment = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/payments/status/${appointmentId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          console.log("Payment verification:", data);
          
          if (data.success) {
            setAppointment(data.appointment);
            toast.success("Payment successful! Your appointment is confirmed.");
          } else {
            toast.error("Payment verification failed. Please contact support.");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Error verifying payment status.");
        } finally {
          setLoading(false);
        }
      };

      verifyPayment();
    } else {
      setLoading(false);
      toast.error("No appointment found");
    }
  }, [location.search, navigate]);

  const handleViewAppointment = () => {
    navigate("/patient-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4 2m6 0l-2-2m0 4l2 2m-6 0l-2-2m0 4l2 2" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600 mb-6">Please wait while we confirm your payment status...</p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-700">Confirming payment with eSewa...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L4 19" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-6 0h6m2 0v8m0-8v8" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your appointment has been confirmed and payment processed successfully.</p>
          
          {appointment && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium">{appointment._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{appointment.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{appointment.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">Rs. {appointment.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">{appointment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-green-600">{appointment.paymentStatus}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleViewAppointment}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View My Appointments
            </button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Next Steps:</strong> You will receive a notification when your doctor approves the appointment.
                Please arrive 10 minutes before your scheduled time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
