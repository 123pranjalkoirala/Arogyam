import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCw, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
    setLoading(false);
  }, [searchParams]);

  const handleRetryPayment = () => {
    navigate('/patient');
  };

  const handleContactSupport = () => {
    // Could open a modal or navigate to contact page
    window.location.href = 'mailto:support@arogyam.com?subject=Payment Issue - Urgent Help Needed';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-red-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-10">
            {/* Error Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Failed ❌</h1>
              <p className="text-xl text-gray-600 mb-2">
                We couldn't process your payment. Please try again or contact support.
              </p>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-800 font-medium">Error: {error}</p>
                </div>
              )}
            </div>

            {/* Common Issues */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues & Solutions 🔧</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Insufficient Balance</h3>
                    <p className="text-gray-600 text-sm">Ensure you have sufficient funds in your eSewa account</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Network Issues</h3>
                    <p className="text-gray-600 text-sm">Check your internet connection and try again</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Payment Timeout</h3>
                    <p className="text-gray-600 text-sm">Complete the payment within the time limit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <AlertCircle className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Browser Issues</h3>
                    <p className="text-gray-600 text-sm">Try using a different browser or clear cache</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-3">🔄 What You Can Do</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Try Again</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Retry the payment with the same or different payment method
                  </p>
                  <button
                    onClick={handleRetryPayment}
                    className="w-full bg-[#0F9D76] text-white px-4 py-2 rounded-lg hover:bg-[#0d8a66] transition-colors text-sm font-medium"
                  >
                    Retry Payment
                  </button>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold mb-2">Contact Support</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Our support team is here to help you resolve payment issues
                  </p>
                  <button
                    onClick={handleContactSupport}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Get Help
                  </button>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📞 Support Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-[#0F9D76]" />
                  <div>
                    <p className="font-semibold">Phone Support</p>
                    <p className="text-gray-600">+977-1-XXXXXXX</p>
                    <p className="text-sm text-gray-500">Available 9 AM - 6 PM (NPT)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#0F9D76]" />
                  <div>
                    <p className="font-semibold">Email Support</p>
                    <p className="text-gray-600">support@arogyam.com</p>
                    <p className="text-sm text-gray-500">Response within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRetryPayment}
                className="flex-1 bg-[#0F9D76] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#0d8a66] transition-colors text-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Payment Again
              </button>
              <button
                onClick={() => navigate('/patient')}
                className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-colors text-lg"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Important Note */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 text-sm">
                <strong>Note:</strong> Your appointment request is still pending. Complete the payment to confirm your appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
