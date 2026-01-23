// BookAppointment.jsx - Complete Appointment Booking with Payment
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, User, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  const today = new Date().toISOString().split("T")[0];
  const [formData, setFormData] = useState({
    date: today,
    time: "",
    reason: "",
    doctorId: doctor?._id || "",
    amount: 500 // Default consultation fee
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Payment, 3: Success

  useEffect(() => {
    if (!doctor) {
      toast.error("Please select a doctor first");
      navigate("/doctors");
    }
  }, [doctor, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.reason) {
      toast.error("Please fill all fields");
      return;
    }

    setStep(2); // Move to payment step
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/payments/initiate-esewa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : {}
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (data.success) {
        // Navigate to payment page with parameters
        navigate("/esewa-payment", { 
          state: { 
            paymentParams: data.data.formData,
            appointmentId: data.data.appointmentId
          } 
        });
      } else {
        toast.error(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Doctor Selected</h2>
          <p className="text-gray-600 mb-4">Please select a doctor to book an appointment</p>
          <button
            onClick={() => navigate("/doctors")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Doctor Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4">
            <img
              src={doctor.picture || "https://via.placeholder.com/80"}
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dr. {doctor.name}</h2>
              <p className="text-gray-600">{doctor.specialization || "General Practitioner"}</p>
              <p className="text-sm text-gray-500">Consultation Fee: Rs. {formData.amount}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              1
            </div>
            <span className="ml-2 font-medium">Details</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-4"></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-4"></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= 3 ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
            }`}>
              3
            </div>
            <span className="ml-2 font-medium">Confirmation</span>
          </div>
        </div>

        {/* Step 1: Appointment Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Appointment Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  min={today}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Select Time
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({...formData, time})}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.time === time
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Reason for Visit
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Please describe your symptoms or reason for appointment..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="text-xl font-bold text-gray-900">Rs. {formData.amount}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Payment Method</span>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <span className="font-medium">eSewa</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Test Payment:</strong> You will be redirected to eSewa test environment. 
                Use test credentials for payment processing.
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay with eSewa
                </>
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
