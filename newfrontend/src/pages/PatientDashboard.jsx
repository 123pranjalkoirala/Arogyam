// Premium Patient Dashboard
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Edit2,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  CreditCard,
  Video
} from "lucide-react";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      const now = new Date();
      setStats({
        total: appointments.length,
        upcoming: appointments.filter(a => {
          const aptDate = new Date(`${a.date}T${a.time}`);
          return aptDate > now && ["pending", "approved"].includes(a.status);
        }).length,
        completed: appointments.filter(a => a.status === "completed").length,
        cancelled: appointments.filter(a => ["rejected", "cancelled"].includes(a.status)).length
      });
    }
  }, [appointments]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProfile(), fetchAppointments()]);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setEditForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          gender: data.user.gender || "",
          address: data.user.address || "",
          dateOfBirth: data.user.dateOfBirth ? new Date(data.user.dateOfBirth).toISOString().split("T")[0] : ""
        });
      }
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      toast.error("Failed to load appointments");
    }
  };

  const updateProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully");
        setProfile(data.user);
        setEditingProfile(false);
        fetchProfile();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment cancelled");
        fetchAppointments();
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const canJoinConsultation = (appointment) => {
    if (appointment.status !== "approved") return false;
    if (!appointment.meetingRoom) return false;
    
    // Check if doctor has started the call
    if (!appointment.meetingStart) {
      return { canJoin: false, reason: "Doctor has not started the consultation yet" };
    }

    // Check if within 2 minutes window of appointment time
    const aptDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const diffMinutes = (now - aptDateTime) / (1000 * 60);

    if (diffMinutes < -2) {
      return { canJoin: false, reason: "Consultation starts in " + Math.round(Math.abs(diffMinutes)) + " minutes" };
    }

    if (diffMinutes > 2) {
      return { canJoin: false, reason: "Consultation window has expired (2 minutes past appointment time)" };
    }

    return { canJoin: true };
  };

  const handleJoinConsultation = (appointment) => {
    const check = canJoinConsultation(appointment);
    if (!check.canJoin) {
      toast.error(check.reason);
      return;
    }
    
    if (appointment.meetingRoom) {
      window.open(`https://meet.jit.si/${appointment.meetingRoom}`, "_blank");
    } else {
      toast.error("Meeting room not available");
    }
  };

  const getStatusBadge = (status, paymentStatus) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return badges[status] || badges.pending;
  };

  const upcomingAppointments = appointments.filter(a => {
    const aptDate = new Date(`${a.date}T${a.time}`);
    return aptDate > new Date() && ["pending", "approved"].includes(a.status);
  }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  const pastAppointments = appointments.filter(a => {
    const aptDate = new Date(`${a.date}T${a.time}`);
    return aptDate <= new Date() || ["completed", "rejected", "cancelled"].includes(a.status);
  }).sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0F9D76] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-gray-600 text-lg">Manage your health appointments and profile</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-[#0F9D76]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Appointments</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.upcoming}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.cancelled}</div>
              <div className="text-sm text-gray-600">Cancelled</div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
            <button
              onClick={() => navigate("/doctors")}
              className="w-full md:w-auto px-6 py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Book New Appointment
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { id: "overview", label: "Overview", icon: Calendar },
                { id: "appointments", label: "My Appointments", icon: FileText },
                { id: "profile", label: "Profile", icon: User }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "text-[#0F9D76] border-b-2 border-[#0F9D76] bg-white"
                      : "text-gray-600 hover:text-[#0F9D76] hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Appointments</h2>
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No upcoming appointments</p>
                        <button
                          onClick={() => navigate("/doctors")}
                          className="mt-4 px-4 py-2 text-[#0F9D76] font-semibold hover:underline"
                        >
                          Book an appointment
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAppointments.slice(0, 3).map(apt => (
                          <div key={apt._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-lg text-gray-900">
                                    Dr. {apt.doctorId?.name || "Unknown Doctor"}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status, apt.paymentStatus)}`}>
                                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{apt.doctorId?.specialization || "General"}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4" />
                                    {apt.date}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {apt.time}
                                  </span>
                                </div>
                                {apt.reason && (
                                  <p className="text-sm text-gray-600 mt-2">Reason: {apt.reason}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* APPOINTMENTS TAB */}
              {activeTab === "appointments" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">All Appointments</h2>
                    
                    {upcomingAppointments.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Upcoming</h3>
                        <div className="space-y-3">
                          {upcomingAppointments.map(apt => (
                            <div key={apt._id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-all">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      Dr. {apt.doctorId?.name || "Unknown Doctor"}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status, apt.paymentStatus)}`}>
                                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                    </span>
                                    {apt.paymentStatus === "paid" && (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                        <CreditCard className="w-3 h-3" />
                                        Paid
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-[#0F9D76] font-medium mb-1">{apt.doctorId?.specialization || "General"}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      {apt.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {apt.time}
                                    </span>
                                    {apt.doctorId?.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {apt.doctorId.email}
                                      </span>
                                    )}
                                  </div>
                                  {apt.reason && (
                                    <p className="text-sm text-gray-600 mt-2">Reason: {apt.reason}</p>
                                  )}
                                </div>
                                {apt.status === "pending" && (
                                  <button
                                    onClick={() => cancelAppointment(apt._id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                                  >
                                    Cancel
                                  </button>
                                )}
                                {apt.status === "approved" && (
                                  <button
                                    onClick={() => handleJoinConsultation(apt)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                      canJoinConsultation(apt).canJoin
                                        ? "bg-[#0F9D76] text-white hover:bg-[#0d8a66]"
                                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    }`}
                                    disabled={!canJoinConsultation(apt).canJoin}
                                    title={!canJoinConsultation(apt).canJoin ? canJoinConsultation(apt).reason : ""}
                                  >
                                    <Video className="w-4 h-4" />
                                    {apt.meetingStart ? "Join Consultation" : "Waiting for Doctor"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pastAppointments.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Past Appointments</h3>
                        <div className="space-y-3">
                          {pastAppointments.map(apt => (
                            <div key={apt._id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      Dr. {apt.doctorId?.name || "Unknown Doctor"}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status, apt.paymentStatus)}`}>
                                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-[#0F9D76] font-medium mb-1">{apt.doctorId?.specialization || "General"}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4" />
                                      {apt.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {apt.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {appointments.length === 0 && (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">No appointments yet</p>
                        <button
                          onClick={() => navigate("/doctors")}
                          className="px-4 py-2 text-[#0F9D76] font-semibold hover:underline"
                        >
                          Book your first appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && profile && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                    {!editingProfile && (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg text-sm font-semibold hover:bg-[#0d8a66] transition-all flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    {editingProfile ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              disabled
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                            <select
                              value={editForm.gender}
                              onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                            <input
                              type="date"
                              value={editForm.dateOfBirth}
                              onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input
                              type="text"
                              value={editForm.address}
                              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={updateProfile}
                            className="px-6 py-2.5 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            onClick={() => {
                              setEditingProfile(false);
                              fetchProfile();
                            }}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-6">
                          <img
                            src={profile.picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80"}
                            alt={profile.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#0F9D76]/20"
                            onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=12"}
                          />
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h3>
                            <p className="text-gray-600 mb-4">{profile.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          {profile.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-[#0F9D76]" />
                              <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{profile.phone}</p>
                              </div>
                            </div>
                          )}
                          {profile.gender && (
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-[#0F9D76]" />
                              <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                <p className="font-medium text-gray-900 capitalize">{profile.gender}</p>
                              </div>
                            </div>
                          )}
                          {profile.address && (
                            <div className="flex items-start gap-3 md:col-span-2">
                              <MapPin className="w-5 h-5 text-[#0F9D76] mt-1" />
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="font-medium text-gray-900">{profile.address}</p>
                              </div>
                            </div>
                          )}
                          {profile.dateOfBirth && (
                            <div className="flex items-center gap-3">
                              <CalendarIcon className="w-5 h-5 text-[#0F9D76]" />
                              <div>
                                <p className="text-xs text-gray-500">Date of Birth</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
