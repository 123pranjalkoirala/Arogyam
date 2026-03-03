// eSewa Payment Component - New Implementation
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EsewaPaymentNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const paymentData = location.state?.paymentData;

  useEffect(() => {
    if (paymentData && paymentData.formData) {
      console.log("=== ESEWA PAYMENT FORM ===");
      console.log("Payment Data:", paymentData);
      
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentData.formUrl;

      // Add all form fields
      Object.entries(paymentData.formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(form);
      }, 1000);
    } else {
      toast.error("No payment parameters found");
      navigate("/patient-dashboard");
    }
  }, [paymentData, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h3m-3 0h3m-3-10h3" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600 mb-6">Redirecting to eSewa payment gateway...</p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700">Initializing secure payment...</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> You will be redirected to eSewa's secure payment page.
                Please complete the payment there and you will be returned automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
