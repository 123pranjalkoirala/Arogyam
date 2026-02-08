import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function PaymentPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      // Call our backend payment initiation endpoint
      const res = await axios.post("http://localhost:5000/api/payments/esewa/initiate", {
        // For demo purposes, we'll create a test appointment
        appointmentId: null, // This will be handled by backend for demo
        amount: parseFloat(amount),
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      console.log("Payment response:", res.data);

      if (res.data.success) {
        const { formData, formUrl } = res.data.data;

        // Create and submit eSewa form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = formUrl;

        Object.keys(formData).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = formData[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error(res.data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pay with ePay</h1>
          <p className="text-gray-600">Secure Payment Gateway</p>
        </div>

        <div className="space-y-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (Rs.)
          </label>
          <input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F9D76] focus:border-transparent"
            min="1"
            step="0.01"
          />
          <button
            onClick={handlePayment}
            disabled={loading || !amount}
            className="w-full bg-[#0F9D76] text-white py-2 px-4 rounded-md hover:bg-[#0d8a66] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Pay Now - Rs. {amount || 0}
          </button>
        </div>

        {loading && (
          <div className="text-center mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-gray-200">
              <div className="border-4 border-gray-200 rounded-full h-8 w-8 animate-spin"></div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Test Credentials:</h3>
          <div className="text-xs text-blue-800 space-y-1">
            <p><strong>eSewa ID:</strong> 9806800001</p>
            <p><strong>Password:</strong> Nepal@123</p>
            <p><strong>MPIN:</strong> 1122</p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
