// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const verifyPayment = async () => {
      const oid = searchParams.get("oid");
      const amt = searchParams.get("amt");
      const refId = searchParams.get("refId");

      if (!oid || !amt || !refId) {
        setStatus("failed");
        toast.error("Invalid payment details");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/payments/verify-esewa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ oid, amt, refId }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("success");
          toast.success("Payment successful! Appointment confirmed.");
        } else {
          setStatus("failed");
          toast.error(data.message || "Payment verification failed");
        }
      } catch (err) {
        setStatus("failed");
        toast.error("Network error during verification");
      }
    };

    verifyPayment();
  }, [searchParams, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 text-[#0F9D76] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm with eSewa</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your appointment is confirmed.</p>
            <button
              onClick={() => navigate("/patient")}
              className="px-8 py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66]"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Please try booking again.</p>
            <button
              onClick={() => navigate("/patient")}
              className="px-8 py-3 bg-gray-600 text-white rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}