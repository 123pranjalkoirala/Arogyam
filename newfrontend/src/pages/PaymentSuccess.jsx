// Payment Success Page
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get("paymentId");
        const transactionId = searchParams.get("refId") || searchParams.get("transactionCode");

        // Check if we're on failure page
        if (window.location.pathname.includes("failure")) {
          setStatus("error");
          return;
        }

        if (!paymentId) {
          setStatus("error");
          return;
        }

        // Verify payment and update appointment status
        const verifyRes = await fetch("http://localhost:5000/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentId,
            transactionId
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          setStatus("success");
          toast.success("Payment successful! Appointment booked.");
          setTimeout(() => {
            navigate("/patient");
          }, 3000);
        } else {
          setStatus("error");
          toast.error("Payment verification failed");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        toast.error("Payment verification error");
      }
    };

    if (token) {
      processPayment();
    } else {
      navigate("/login");
    }
  }, [searchParams, token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader className="w-16 h-16 text-[#0F9D76] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we verify your payment</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your appointment has been booked successfully</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-4">There was an issue verifying your payment</p>
            <button
              onClick={() => navigate("/patient")}
              className="px-6 py-2 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
