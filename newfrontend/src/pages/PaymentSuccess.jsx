import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, User, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appointmentId, setAppointmentId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('appointmentId');
    if (id) {
      setAppointmentId(id);
    }
    setLoading(false);
  }, [searchParams]);

  const handleViewAppointments = () => {
    navigate('/patient');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-[#0F9D76]"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful! 🎉</h1>
              <p className="text-xl text-gray-600 mb-2">
                Your appointment has been confirmed and payment processed successfully.
              </p>
              <p className="text-lg text-gray-500">
                Appointment ID: <span className="font-mono font-semibold">{appointmentId || 'N/A'}</span>
              </p>
            </div>

            {/* Success Details */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next? 📋</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                    <Calendar className="w-8 h-8 text-[#0F9D76]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Appointment Confirmed</h3>
                  <p className="text-gray-600 text-sm">Your appointment slot has been reserved</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                    <User className="w-8 h-8 text-[#0F9D76]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Doctor Notified</h3>
                  <p className="text-gray-600 text-sm">Your doctor will be notified of the appointment</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md">
                    <Clock className="w-8 h-8 text-[#0F9D76]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Be Ready</h3>
                  <p className="text-gray-600 text-sm">Join the consultation 5 minutes early</p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-3">📝 Important Information</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Please arrive 5 minutes before your scheduled appointment time</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Keep your device ready with a stable internet connection</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Have your medical documents ready if needed</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can cancel or reschedule up to 2 hours before the appointment</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewAppointments}
                className="flex-1 bg-[#0F9D76] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0d8a66] transition-colors text-lg"
              >
                View My Appointments
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-colors text-lg"
              >
                Go to Dashboard
              </button>
            </div>

            {/* Contact Support */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                Need help? Contact our support team at 
                <a href="mailto:support@arogyam.com" className="text-[#0F9D76] hover:underline ml-1">
                  support@arogyam.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
