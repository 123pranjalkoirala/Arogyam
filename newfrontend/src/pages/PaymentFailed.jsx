// PaymentFailed.jsx - Handle failed eSewa payments
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    const error = searchParams.get('error');
    const status = searchParams.get('status');
    
    setErrorDetails({
      error: error || 'unknown',
      status: status || 'failed'
    });

    // Show appropriate error message
    if (error === 'amount_mismatch') {
      toast.error("Payment amount mismatch. Please try again.");
    } else if (error === 'appointment_update_failed') {
      toast.error("Failed to update appointment. Please contact support.");
    } else if (status === 'CANCELED') {
      toast.error("Payment was cancelled.");
    } else if (status === 'FAILURE') {
      toast.error("Payment failed. Please try again.");
    } else {
      toast.error("Payment failed. Please try again or contact support.");
    }
  }, [searchParams]);

  const getErrorMessage = () => {
    const error = searchParams.get('error');
    const status = searchParams.get('status');
    
    switch (error) {
      case 'amount_mismatch':
        return "The payment amount didn't match the expected amount. This could be a security issue.";
      case 'appointment_update_failed':
        return "Payment was successful but we couldn't update your appointment. Please contact support with your transaction details.";
      case 'signature_invalid':
        return "Payment verification failed. The payment signature was invalid.";
      default:
        if (status === 'CANCELED') {
          return "You cancelled the payment process.";
        } else if (status === 'FAILURE') {
          return "The payment failed due to a technical issue.";
        }
        return "The payment could not be completed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm text-red-800 font-medium">Error Details:</p>
              <p className="text-sm text-red-700 mt-1">{getErrorMessage()}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate("/patient-dashboard")}
            className="w-full bg-[#0F9D76] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#0d8a66] transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => navigate("/appointments")}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Appointments
          </button>
          
          <button
            onClick={() => navigate("/contact")}
            className="w-full text-gray-600 py-2 px-4 text-sm hover:text-gray-800 transition-colors"
          >
            Contact Support
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you were charged, please contact support with your transaction details.
          </p>
        </div>
      </div>
    </div>
  );
}
