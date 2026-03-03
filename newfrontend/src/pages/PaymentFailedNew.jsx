// Payment Failed Page - New Implementation
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function PaymentFailedNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const appointmentId = params.get('appointmentId');

    if (appointmentId) {
      // Check payment status
      const checkPaymentStatus = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/esewa/status/${appointmentId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          console.log("Payment status check:", data);
          
          if (data.success) {
            setAppointment(data.data);
          } else {
            toast.error("Unable to fetch appointment details.");
          }
        } catch (error) {
          console.error("Payment status check error:", error);
          toast.error("Error checking payment status.");
        } finally {
          setLoading(false);
        }
      };

      checkPaymentStatus();
    } else {
      setLoading(false);
      toast.error("No appointment found");
    }
  }, [location.search, navigate]);

  const handleRetryPayment = () => {
    if (appointment) {
      navigate("/patient-dashboard", { state: { retryPayment: appointment.appointmentId } });
    } else {
      navigate("/patient-dashboard");
    }
  };

  const handleViewAppointments = () => {
    navigate("/patient-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h1M4 4h16" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Checking Status</h2>
            <p className="text-gray-600 mb-6">Please wait while we check your payment status...</p>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-3"></div>
                  <span className="text-red-700">Checking payment status...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again or contact support.</p>
          
          {appointment && (
            <div className="bg-red-50 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium">{appointment.appointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-600">{appointment.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-red-600">{appointment.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">Rs. {appointment.amount}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors mb-3"
            >
              Try Payment Again
            </button>
            
            <button
              onClick={handleViewAppointments}
              className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              View My Appointments
            </button>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                <strong>Troubleshooting:</strong> If payment continues to fail, please check:
                <br />• Your bank account balance
                <br />• Internet connection stability  
                <br />• Card details and limits
                <br />• Contact our support if needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
