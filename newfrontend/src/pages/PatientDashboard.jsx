import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, Bell, FileText, Plus, Stethoscope, Star, ChevronRight, Search, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import Notifications from "../components/Notifications";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  
  console.log("=== PATIENT DASHBOARD DEBUG ===");
  console.log("Token:", !!token);
  console.log("User Role:", userRole);
  console.log("User Name:", userName);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedAppointmentForRating, setSelectedAppointmentForRating] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 0, review: "" });

  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    
    if (userRole !== "patient") {
      console.log("=== ROLE MISMATCH ===");
      console.log("Expected: patient, Got:", userRole);
      toast.error(`Access denied. This dashboard is for patients only. Your role: ${userRole}`);
      navigate(`/${userRole}`);
      return;
    }
  }, [token, userRole, navigate]);

  const loadData = useEffect(() => {
    const initialize = async () => {
      try {
        console.log("=== LOADING DATA ===");
        await Promise.all([
          loadProfile(),
          loadAppointments(),
          loadDoctors(),
          loadReports(),
          loadNotifications()
        ]);
        console.log("=== DATA LOADING COMPLETED ===");
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load some data");
      } finally {
        setLoading(false);
        console.log("=== LOADING SET TO FALSE ===");
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "soap-notes") {
        loadAppointments();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  const loadProfile = async () => {
    try {
      console.log("=== LOADING PROFILE ===");
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Profile response:", data);
      if (data.success) {
        setProfile(data.user);
        setEditForm(data.user);
        console.log("Profile loaded successfully");
      } else {
        console.error("Failed to load profile:", data.message);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadAppointments = async () => {
    try {
      console.log("=== LOADING APPOINTMENTS ===");
      const res = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Appointments loaded:", data);
      if (data.success) {
        console.log("Raw appointments data:", data.appointments);
        setAppointments(data.appointments || []);
        console.log("Appointments set:", data.appointments);
      } else {
        console.log("Failed to load appointments:", data.message);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    }
  };

  const loadDoctors = async () => {
    try {
      console.log("=== LOADING DOCTORS ===");
      const res = await fetch("/api/doctors");
      const data = await res.json();
      console.log("Doctors response:", data);
      if (data.success) {
        setDoctors(data.doctors || []);
        console.log("Doctors loaded successfully");
      } else {
        console.error("Failed to load doctors:", data.message);
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const loadReports = async () => {
    try {
      console.log("=== LOADING REPORTS ===");
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Reports response:", data);
      if (data.success) {
        setReports(data.reports || []);
        console.log("Reports loaded successfully");
      } else {
        console.error("Failed to load reports:", data.message);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      console.log("=== LOADING NOTIFICATIONS ===");
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Notifications response:", data);
      if (data.success) {
        setNotifications(data.notifications || []);
        console.log("Notifications loaded successfully");
      } else {
        console.error("Failed to load notifications:", data.message);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const handleEditProfile = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setEditingProfile(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const handleBookAppointment = async () => {
    console.log("=== FRONTEND BOOKING DEBUG ===");
    console.log("selectedDoctor:", selectedDoctor);
    console.log("bookingDate:", bookingDate);
    console.log("bookingTime:", bookingTime);
    console.log("bookingReason:", bookingReason);
    console.log("bookingReason type:", typeof bookingReason);
    console.log("bookingReason length:", bookingReason?.length);
    
    if (!selectedDoctor || !bookingDate || !bookingTime || !bookingReason) {
      toast.error("Please fill all fields: doctor, date, time, reason");
      return;
    }

    const requestData = {
      doctorId: selectedDoctor._id,
      date: bookingDate,
      time: bookingTime,
      reason: bookingReason,
    };
    
    console.log("Request data to be sent:", requestData);
    console.log("Request data JSON.stringify:", JSON.stringify(requestData));

    try {
      const createRes = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const createData = await createRes.json();
      console.log("Backend response:", createData);
      
      if (!createData.success) {
        toast.error(createData.message || "Failed to create appointment");
        return;
      }

      toast.success("Appointment created! Redirecting to payment...");
      window.location.href = `/payment?appointmentId=${createData.appointment._id}`;
      return;
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking failed. Check connection.");
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      
      console.log("Initiating payment for appointment:", appointmentId);
      
      const res = await fetch("http://localhost:5000/api/payments/esewa/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({ appointmentId })
      });

      console.log("Payment response status:", res.status);
      
      const data = await res.json();
      console.log("Payment response data:", data);
      
      if (data.success) {
        console.log("Form URL:", data.data.formUrl);
        console.log("Form data:", data.data.formData);
        
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.data.formUrl;
        
        Object.entries(data.data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        console.error("Payment initiation failed:", data);
        toast.error(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error("Failed to initiate payment");
    }
  };

  const submitRating = async () => {
    if (ratingData.rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedAppointmentForRating.doctorId._id,
          appointmentId: selectedAppointmentForRating._id,
          rating: ratingData.rating,
          review: ratingData.review,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Thank you for your rating!");
        setSelectedAppointmentForRating(null);
        setRatingData({ rating: 0, review: "" });
        loadAppointments();
      }
    } catch (err) {
      toast.error("Failed to submit rating");
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-[#0F9D76]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-20 h-20 bg-[#0F9D76]/10 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-[#0F9D76]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{profile?.name || "Patient"}</h3>
                    <p className="text-gray-500 text-lg">Patient Dashboard</p>
                  </div>
                </div>
                <nav className="space-y-3">
                  {[
                    { id: "overview", label: "Overview", icon: <Calendar className="w-6 h-6" /> },
                    { id: "appointments", label: "My Appointments", icon: <Clock className="w-6 h-6" /> },
                    { id: "book", label: "Book Appointment", icon: <Plus className="w-6 h-6" /> },
                    { id: "reports", label: "Medical Reports", icon: <FileText className="w-6 h-6" /> },
                    { id: "profile", label: "Profile", icon: <User className="w-6 h-6" /> },
                    { id: "notifications", label: "Notifications", icon: <Bell className="w-6 h-6" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-[#0F9D76] text-white shadow-lg"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <h2 className="text-4xl font-bold mb-10">Dashboard Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-gradient-to-br from-[#0F9D76]/10 to-green-50 p-8 rounded-2xl">
                      <p className="text-gray-700 text-xl mb-4">Upcoming Appointments</p>
                      <p className="text-5xl font-bold text-[#0F9D76]">
                        {appointments.filter((a) => a.status === "approved").length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                      <p className="text-gray-700 text-xl mb-4">Total Reports</p>
                      <p className="text-5xl font-bold text-blue-600">{reports.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl">
                      <p className="text-gray-700 text-xl mb-4">Notifications</p>
                      <p className="text-5xl font-bold text-yellow-600">{notifications.length}</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-6">Recent Appointments</h3>
                  <div className="space-y-6">
                    {appointments.length === 0 ? (
                      <p className="text-center text-gray-500 text-xl py-10">No appointments yet</p>
                    ) : (
                      appointments.slice(0, 5).map((apt) => (
                        <div key={apt._id} className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-xl">Dr. {apt.doctorId?.name || "Unknown"}</p>
                            <p className="text-gray-600 text-lg">{apt.doctorId?.specialization || "General Practice"}</p>
                            <p className="text-gray-500">
                              {new Date(apt.date).toLocaleDateString()} at {apt.time}
                            </p>
                          </div>
                          <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                            apt.status === "approved" ? "bg-green-100 text-green-800" :
                             apt.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                             apt.status === "completed" ? "bg-blue-100 text-blue-800" :
                             apt.status === "missed" ? "bg-red-100 text-red-800" :
                             "bg-gray-100 text-gray-800"
                          }`}>
                            {apt.status === "approved" ? "CONFIRMED" :
                               apt.status === "pending" ? "PENDING" :
                               apt.status === "completed" ? "COMPLETED" :
                               apt.status === "missed" ? "MISSED" :
                               apt.status.toUpperCase()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* My Appointments */}
              {activeTab === "appointments" && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <h2 className="text-4xl font-bold mb-10">My Appointments</h2>
                  {appointments.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl py-16">No appointments booked yet</p>
                  ) : (
                    <div className="space-y-8">
                      {appointments.map((apt) => (
                        <div key={apt._id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <p className="font-bold text-2xl">Dr. {apt.doctorId?.name || "Unknown"}</p>
                              <p className="text-xl text-gray-600">{apt.doctorId?.specialization || ""}</p>
                            </div>
                            <span className={`px-6 py-3 rounded-full font-bold text-lg ${
                              apt.status === "approved" ? "bg-green-100 text-green-700" :
                              apt.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {apt.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg">
                            <p><strong>Date:</strong> {apt.date}</p>
                            <p><strong>Time:</strong> {apt.time}</p>
                            <p><strong>Fee:</strong> Rs. {apt.amount || 0}</p>
                            <p><strong>Payment:</strong> {apt.paymentStatus?.toUpperCase() || "PENDING"}</p>
                          </div>
                          <p className="mt-4 text-gray-700"><strong>Reason:</strong> {apt.reason || "Not specified"}</p>
                          
                          {apt.status === "approved" && apt.paymentStatus !== "paid" && (
                            <div className="mt-6">
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-yellow-800">
                                  <strong>Important:</strong> Please arrive on time for your appointment. 
                                  Failure to attend will result in no refund and may affect future booking privileges.
                                </p>
                              </div>
                              <button
                                onClick={() => handlePayment(apt._id)}
                                className="bg-[#0F9D76] text-white px-6 py-3 rounded-lg hover:bg-[#0d8a66] transition-colors font-semibold"
                              >
                                Pay Now with ePay - Rs. {apt.amount || 500}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Book Appointment */}
              {activeTab === "book" && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <h2 className="text-4xl font-bold mb-10">Book New Appointment</h2>

                  <div className="mb-10 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialization..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 border-2 border-gray-200 rounded-2xl focus:border-[#0F9D76] focus:ring-4 focus:ring-[#0F9D76]/20 outline-none text-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                    {filteredDoctors.length === 0 ? (
                      <p className="col-span-full text-center text-gray-500 text-2xl py-16">No doctors found</p>
                    ) : (
                      filteredDoctors.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-8 border-4 rounded-3xl cursor-pointer transition-all hover:shadow-2xl ${
                            selectedDoctor?._id === doc._id
                              ? "border-[#0F9D76] bg-[#0F9D76]/5 shadow-2xl"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                              <Stethoscope className="w-12 h-12 text-[#0F9D76]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-2xl">Dr. {doc.name}</h3>
                              <p className="text-xl text-gray-600">{doc.specialization}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-6">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-8 h-8 text-yellow-500"
                                fill={i < Math.round(doc.averageRating || 0) ? "currentColor" : "none"}
                              />
                            ))}
                            <span className="text-lg ml-3">({doc.totalRatings || 0} reviews)</span>
                          </div>
                          <p className="text-2xl font-bold">
                            Consultation Fee: <span className="text-[#0F9D76]">Rs. {doc.consultationFee || 0}</span>
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {selectedDoctor && (
                    <div className="bg-gradient-to-br from-[#0F9D76]/10 to-green-50 p-10 rounded-3xl">
                      <h3 className="text-3xl font-bold mb-8 text-center">
                        Booking Appointment with Dr. {selectedDoctor.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                          <label className="block text-xl font-medium mb-3">Select Date</label>
                          <input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-6 py-5 border-2 rounded-2xl text-lg focus:border-[#0F9D76]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xl font-medium mb-3">Select Time</label>
                          <input
                            type="time"
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            className="w-full px-6 py-5 border-2 rounded-2xl text-lg focus:border-[#0F9D76]"
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-10">
                        <label className="block text-xl font-medium mb-3">Reason for Visit</label>
                        <textarea
                          value={bookingReason}
                          onChange={(e) => setBookingReason(e.target.value)}
                          rows={6}
                          placeholder="Describe your symptoms or reason for consultation..."
                          className="w-full px-6 py-5 border-2 rounded-2xl text-lg focus:border-[#0F9D76] resize-none"
                          required
                        />
                      </div>
                      <div className="text-center">
                        <button
                          onClick={handleBookAppointment}
                          className="px-16 py-6 bg-[#0F9D76] text-white text-2xl font-bold rounded-3xl hover:bg-[#0d8a66] transition-all shadow-2xl hover:shadow-3xl"
                        >
                          Pay Rs. {selectedDoctor.consultationFee || 0} & Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Medical Reports */}
              {activeTab === "reports" && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <h2 className="text-4xl font-bold mb-10">Medical Reports</h2>
                  {reports.length === 0 ? (
                    <p className="text-center text-gray-500 text-xl py-16">No medical reports available yet</p>
                  ) : (
                    <div className="space-y-8">
                      {reports.map((report) => (
                        <div key={report._id} className="bg-gray-50 p-8 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-2xl">{report.title}</p>
                            <p className="text-xl text-gray-600 mt-2">Uploaded by Dr. {report.doctorId?.name || "Unknown"}</p>
                            <p className="text-gray-500 mt-3">
                              {new Date(report.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          
                          <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-5 bg-[#0F9D76] text-white text-xl font-bold rounded-2xl hover:bg-[#0d8a66] inline-flex items-center gap-2"
                            download
                          >
                            <FileText className="w-5 h-5" />
                            View & Download Report
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile */}
              {activeTab === "profile" && profile && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
                    {!editingProfile ? (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="px-6 py-3 bg-[#0F9D76] text-white text-lg font-medium rounded-xl hover:bg-[#0d8a66] flex items-center gap-2"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditProfile}
                          className="px-6 py-3 bg-[#0F9D76] text-white text-lg font-medium rounded-xl hover:bg-[#0d8a66] flex items-center gap-2"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(false);
                            setEditForm(profile);
                          }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 text-lg font-medium rounded-xl hover:bg-gray-300 flex items-center gap-2"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex justify-center">
                      {profile.picture ? (
                        <img
                          src={profile.picture}
                          alt={profile.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-[#0F9D76]"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-[#0F9D76] flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {!editingProfile ? (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <p className="text-lg text-gray-900 font-semibold">{profile.name || "Not provided"}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <p className="text-lg text-gray-700">{profile.email || "Not provided"}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <p className="text-lg text-gray-700">{profile.phone || "Not provided"}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <p className="text-lg text-gray-900">
                              {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <p className="text-lg text-gray-900 capitalize">{profile.gender || "Not specified"}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <p className="text-lg text-gray-700">{profile.address || "Not provided"}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                              type="email"
                              value={editForm.email || ""}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={editForm.phone || ""}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                              type="date"
                              value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ""}
                              onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <select
                              value={editForm.gender || ""}
                              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <textarea
                              value={editForm.address || ""}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              rows={3}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0F9D76] focus:ring-2 focus:ring-[#0F9D76]/20 outline-none resize-none"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === "notifications" && (
                <div className="bg-white rounded-2xl shadow-xl p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Notifications</h2>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          const readNotifications = notifications.map(n => ({ ...n, read: true }));
                          setNotifications(readNotifications);
                        }}
                        className="px-6 py-3 bg-[#0F9D76] text-white text-lg font-medium rounded-xl hover:bg-[#0d8a66] flex items-center gap-2"
                      >
                        Mark All as Read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-20">
                      <Bell className="w-24 h-24 text-gray-300 mx-auto mb-8" />
                      <p className="text-2xl text-gray-500">No notifications yet</p>
                      <p className="text-gray-400 mt-4">You'll be notified about appointments, reports, and updates here.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-8 rounded-3xl border-4 transition-all ${
                            notif.read
                              ? "bg-gray-50 border-gray-200"
                              : "bg-[#0F9D76]/10 border-[#0F9D76] shadow-xl"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-4">
                                <h4 className="text-2xl font-bold">{notif.title}</h4>
                                {!notif.read && (
                                  <span className="bg-[#0F9D76] text-white px-5 py-2 rounded-full text-lg font-bold">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-xl text-gray-700 leading-relaxed">{notif.message}</p>
                              <p className="text-gray-500 mt-6">
                                {new Date(notif.createdAt).toLocaleString("en-GB", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-[#0F9D76] rounded-full mt-1"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedAppointmentForRating && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold">Rate Your Experience</h3>
              <button onClick={() => setSelectedAppointmentForRating(null)}>
                <X className="w-8 h-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <p className="text-2xl text-center mb-10">
              How was your consultation with <strong>Dr. {selectedAppointmentForRating.doctorId?.name}</strong>?
            </p>

            <div className="flex justify-center gap-6 mb-12">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setRatingData({ ...ratingData, rating: num })}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`w-20 h-20 ${
                      num <= ratingData.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={ratingData.review}
              onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
              rows={6}
              placeholder="Share your experience (optional)..."
              className="w-full px-8 py-6 border-2 rounded-2xl text-lg mb-10 focus:border-[#0F9D76]"
            />

            <button
              onClick={submitRating}
              className="w-full py-6 bg-[#0F9D76] text-white text-2xl font-bold rounded-2xl hover:bg-[#0d8a66] shadow-xl"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      <ScrollToTop />
      <Notifications />
    </>
  );
}
