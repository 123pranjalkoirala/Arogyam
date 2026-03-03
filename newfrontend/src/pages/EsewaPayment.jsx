// EsewaPayment.jsx - Optional page for handling eSewa form submission
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function EsewaPayment() {
  const location = useLocation();
  const paymentParams = location.state?.paymentParams;

  useEffect(() => {
    if (paymentParams) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; // Correct test API endpoint

      Object.entries(paymentParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up
      setTimeout(() => document.body.removeChild(form), 1000);
    } else {
      toast.error("No payment parameters found");
    }
  }, [paymentParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D76]"></div>
      <p className="ml-4">Redirecting to eSewa...</p>
    </div>
  );
}