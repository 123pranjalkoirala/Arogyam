// Mock Payment Page - For Development/Testing
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function MockPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const token = localStorage.getItem("token");
  const paymentId = searchParams.get("paymentId");
  const appointmentId = searchParams.get("appointmentId");

  const handlePayment = async () => {
    if (!paymentId || !appointmentId) {
      toast.error("Invalid payment information");
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify payment
      const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId,
          appointmentId
        })
      });

      const verifyData = await verifyRes.json();
      
      if (verifyData.success) {
        toast.success("Payment successful! Appointment booked.");
        setTimeout(() => {
          navigate("/patient");
        }, 2000);
      } else {
        toast.error("Payment verification failed");
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Payment processing error");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h2>
          <p className="text-gray-600">Mock Payment Gateway (Development Mode)</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm">{paymentId}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a mock payment system for development. 
            In production, this would redirect to a real payment gateway like Khalti or eSewa.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full py-3 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-semibold hover:from-[#059669] hover:to-[#047857] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Complete Payment
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/doctors")}
          className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}




