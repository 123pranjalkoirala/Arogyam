import { useEffect, useState } from "react";
import { Search, User, Calendar as CalendarIcon, Star, Bell, Stethoscope, FileText, X, Plus } from "lucide-react";
import ScrollToTop from "../components/ScrollToTop";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  
  console.log("=== DOCTOR DASHBOARD DEBUG ===");
  console.log("Token:", !!token);
  console.log("User Role:", userRole);
  console.log("User Name:", userName);
  
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showSOAPModal, setShowSOAPModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [soapData, setSoapData] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    followUp: { date: "", notes: "", type: "in_person" }
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    
    if (userRole !== "doctor") {
      console.log("=== ROLE MISMATCH ===");
      console.log("Expected: doctor, Got:", userRole);
      toast.error(`Access denied. This dashboard is for doctors only. Your role: ${userRole}`);
      navigate(`/${userRole}`);
      return;
    }
    
    loadData();
  }, [token, userRole, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAppointments(), fetchProfile()]);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appointments.length > 0) {
      setStats({
        total: appointments.length,
        pending: appointments.filter(a => a.status === "pending").length,
        approved: appointments.filter(a => a.status === "approved").length,
        completed: appointments.filter(a => a.status === "completed").length
      });
    }
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments?paymentStatus=paid", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);
      setAppointments([]);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setProfile(data.user);
        setEditForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          specialization: data.user.specialization || "",
          experience: data.user.experience || "",
          qualification: data.user.qualification || "",
          bio: data.user.bio || "",
          consultationFee: data.user.consultationFee || ""
        });
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
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

  const updateStatus = async (id, status) => {
    try {
      if (status === "completed") {
        const appointment = appointments.find(a => a._id === id);
        setSelectedAppointment(appointment);
        setShowSOAPModal(true);
        return;
      }
      
      const res = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update appointment status");
    }
  };

  const handleSOAPSubmit = async () => {
    if (!soapData.subjective || !soapData.objective || !soapData.assessment || !soapData.plan) {
      toast.error("All SOAP fields are required");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/soap/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          appointmentId: selectedAppointment._id,
          subjective: soapData.subjective,
          objective: soapData.objective,
          assessment: soapData.assessment,
          plan: soapData.plan,
          followUp: soapData.followUp
        })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("SOAP note saved successfully");
        setShowSOAPModal(false);
        setSelectedAppointment(null);
        setSoapData({
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          followUp: { date: "", notes: "", type: "in_person" }
        });
        fetchAppointments();
      } else {
        toast.error(data.message || "Failed to save SOAP note");
      }
    } catch (err) {
      toast.error("Failed to save SOAP note");
    }
  };

  const handleUploadReport = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!soapData.subjective || !soapData.objective || !soapData.assessment || !soapData.plan) {
      toast.error("All SOAP fields are required to upload prescription");
      return;
    }

    const form = new FormData();
    form.append("file", selectedFile);
    form.append("patientId", selectedAppointment.patientId._id);
    form.append("appointmentId", selectedAppointment._id);
    form.append("title", "Prescription with Medical Notes");
    form.append("subjective", soapData.subjective);
    form.append("objective", soapData.objective);
    form.append("assessment", soapData.assessment);
    form.append("plan", soapData.plan);

    try {
      // First create SOAP note
      const soapRes = await fetch(`http://localhost:5000/api/soap/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          appointmentId: selectedAppointment._id,
          subjective: soapData.subjective,
          objective: soapData.objective,
          assessment: soapData.assessment,
          plan: soapData.plan,
          vitalSigns: soapData.vitalSigns,
          medications: soapData.medications,
          followUp: soapData.followUp
        })
      });

      const soapDataResult = await soapRes.json();
      if (!soapDataResult.success) {
        toast.error(soapDataResult.message || "Failed to save SOAP note");
        return;
      }

      // Then upload prescription
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Prescription with SOAP notes uploaded successfully");
        setShowReportModal(false);
        setSelectedFile(null);
        setSelectedAppointment(null);
        setSoapData({
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          vitalSigns: {
            bloodPressure: { systolic: "", diastolic: "" },
            heartRate: "",
            temperature: "",
            respiratoryRate: "",
            oxygenSaturation: "",
            weight: "",
            height: ""
          },
          medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
          followUp: { date: "", notes: "", type: "in_person" }
        });
        fetchAppointments();
      } else {
        toast.error(data.message || "Failed to upload prescription");
      }
    } catch (err) {
      toast.error("Failed to upload prescription");
    }
  };

  const addMedication = () => {
    setSoapData({
      ...soapData,
      medications: [...soapData.medications, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    });
  };

  const removeMedication = (index) => {
    setSoapData({
      ...soapData,
      medications: soapData.medications.filter((_, i) => i !== index)
    });
  };

  const updateMedication = (index, field, value) => {
    const updatedMedications = [...soapData.medications];
    updatedMedications[index][field] = value;
    setSoapData({ ...soapData, medications: updatedMedications });
  };


  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredAppointments = filterStatus === "all" 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0F9D76] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Header - Premium styling */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
            <p className="text-lg text-gray-600">Manage your appointments and patient consultations</p>
          </div>

          {/* Stats Cards - Premium */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-bold text-[#0F9D76] mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total Appointments</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-600 font-medium">Pending</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.approved}</div>
              <div className="text-sm text-gray-600 font-medium">Approved</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.completed}</div>
              <div className="text-sm text-gray-600 font-medium">Completed</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-4 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { id: "appointments", label: "Appointments" },
                { id: "profile", label: "My Profile" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "text-[#0F9D76] border-b-2 border-[#0F9D76] bg-white"
                      : "text-gray-600 hover:text-[#0F9D76] hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* APPOINTMENTS TAB */}
              {activeTab === "appointments" && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Appointment Requests</h2>
                    
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2">
                      {["all", "pending", "approved", "completed"].map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            filterStatus === status
                              ? "bg-[#1E88E5] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <img 
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=150" 
                        alt="No appointments" 
                        className="w-24 h-24 mx-auto mb-3 rounded-full object-cover"
                        onError={(e) => e.target.src = "https://via.placeholder.com/150"}
                      />
                      <h3 className="text-base font-medium text-gray-700 mb-1">No appointments found</h3>
                      <p className="text-sm text-gray-500">
                        {filterStatus === "all" ? "You don't have any appointments yet" : `No ${filterStatus} appointments`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredAppointments.map(a => (
                        <div key={a._id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                <img
                                  src={a.patientId?.picture || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80"}
                                  alt={a.patientId?.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                  onError={(e) => e.target.src = "https://i.pravatar.cc/80?img=12"}
                                />
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                                    {a.patientId?.name || "Unknown Patient"}
                                  </h3>
                                  {a.reason && (
                                    <p className="text-sm text-gray-600 mb-1">{a.reason}</p>
                                  )}
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                                    <span>{a.date}</span>
                                    <span>{a.time}</span>
                                    {a.patientId?.email && <span className="truncate max-w-xs">{a.patientId.email}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 lg:items-end">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(a.status)}`}>
                                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                              </span>
                              
                              <div className="flex flex-wrap gap-2">
                                {a.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(a._id, "approved")}
                                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-all"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => updateStatus(a._id, "rejected")}
                                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {a.status === "approved" && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setSelectedAppointment(a);
                                        setShowReportModal(true);
                                      }}
                                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all"
                                    >
                                      Upload Prescription
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedAppointment(a);
                                        setShowSOAPModal(true);
                                      }}
                                      className="px-3 py-1.5 bg-[#43A047] text-white rounded-lg text-xs font-medium hover:bg-[#388E3C] transition-all"
                                    >
                                      Add SOAP Note
                                    </button>
                                    {a.soapNote && (
                                      <button
                                        onClick={() => updateStatus(a._id, "completed")}
                                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600 transition-all"
                                      >
                                        Complete Appointment
                                      </button>
                                    )}
                                  </>
                                )}

                                {a.status === "completed" && (
                                  <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                                    Consultation Completed
                                  </div>
                                )}
                                
                                {/* Display Rating if exists */}
                                {a.rating && (
                                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm font-semibold text-gray-900">Patient Rating: {a.rating}/5</span>
                                    </div>
                                    {a.review && (
                                      <p className="text-xs text-gray-600 italic">"{a.review}"</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              
              {/* PROFILE TAB */}
              {activeTab === "profile" && profile && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">My Profile</h2>
                    {!editingProfile && (
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="px-4 py-2 bg-[#1E88E5] text-white rounded-lg text-sm font-medium hover:bg-[#1976D2] transition-all"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {profile.picture ? (
                          <img
                            src={profile.picture}
                            alt={profile.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-[#1E88E5] flex-shrink-0"
                            onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=47"}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-[#1E88E5] flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Profile Information */}
                      <div className="flex-1 space-y-4">
                        {editingProfile ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                  type="text"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                  type="tel"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                                <input
                                  type="text"
                                  value={editForm.specialization}
                                  onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Experience (years)</label>
                                <input
                                  type="number"
                                  value={editForm.experience}
                                  onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Consultation Fee (Rs.)</label>
                                <input
                                  type="number"
                                  value={editForm.consultationFee}
                                  onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                                <input
                                  type="text"
                                  value={editForm.qualification}
                                  onChange={(e) => setEditForm({...editForm, qualification: e.target.value})}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                  value={editForm.bio}
                                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                  rows={3}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-xs font-medium text-gray-600">Full Name</label>
                              <p className="text-sm font-medium text-gray-900">Dr. {profile.name || "Not provided"}</p>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600">Email Address</label>
                              <p className="text-sm text-gray-700">{profile.email || "Not provided"}</p>
                            </div>
                              <div>
                              <label className="block text-xs font-medium text-gray-600">Phone Number</label>
                              <p className="text-sm text-gray-700">{profile.phone || "Not provided"}</p>
                            </div>

                            {profile.specialization && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Specialization</label>
                                <p className="text-sm text-gray-700">{profile.specialization}</p>
                              </div>
                            )}

                            {profile.experience && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Experience</label>
                                <p className="text-sm text-gray-700">{profile.experience} years</p>
                              </div>
                            )}

                            {profile.qualification && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Qualification</label>
                                <p className="text-sm text-gray-700">{profile.qualification}</p>
                              </div>
                            )}

                            {profile.consultationFee && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Consultation Fee</label>
                                <p className="text-sm text-gray-700">Rs. {profile.consultationFee}</p>
                              </div>
                            )}

                            {profile.bio && (
                              <div>
                                <label className="block text-xs font-medium text-gray-600">Bio</label>
                                <p className="text-sm text-gray-700">{profile.bio}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {editingProfile && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mt-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Specialization</label>
                            <input
                              type="text"
                              value={editForm.specialization}
                              onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Experience (years)</label>
                            <input
                              type="number"
                              value={editForm.experience}
                              onChange={(e) => setEditForm({...editForm, experience: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Consultation Fee (Rs.)</label>
                            <input
                              type="number"
                              value={editForm.consultationFee}
                              onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                              value={editForm.bio}
                              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={updateProfile}
                          className="px-4 py-2 bg-[#1E88E5] text-white rounded-lg text-sm font-medium hover:bg-[#1976D2] transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingProfile(false);
                            fetchProfile();
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* SOAP Note Modal */}
      {showSOAPModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Complete Consultation - SOAP Note</h2>
                <button onClick={() => setShowSOAPModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Patient: <strong>{selectedAppointment.patientId?.name}</strong> | 
                Date: <strong>{selectedAppointment.date}</strong> at <strong>{selectedAppointment.time}</strong>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Subjective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjective (Patient's symptoms, complaints, history)
                </label>
                <textarea
                  value={soapData.subjective}
                  onChange={(e) => setSoapData({...soapData, subjective: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                  placeholder="Patient reports..."
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objective (Examination findings, vital signs)
                </label>
                <textarea
                  value={soapData.objective}
                  onChange={(e) => setSoapData({...soapData, objective: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                  placeholder="Physical examination reveals..."
                />
              </div>

              {/* Assessment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment (Diagnosis)
                </label>
                <textarea
                  value={soapData.assessment}
                  onChange={(e) => setSoapData({...soapData, assessment: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                  placeholder="Based on examination, diagnosis is..."
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Plan (Treatment, medications, follow-up)
                </label>
                <textarea
                  value={soapData.plan}
                  onChange={(e) => setSoapData({...soapData, plan: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                  placeholder="Treatment plan includes..."
                />
              </div>

              {/* Follow-up */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up (When should patient visit again?)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={soapData.followUp.date}
                      onChange={(e) => setSoapData({
                        ...soapData,
                        followUp: {...soapData.followUp, date: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Type</label>
                    <select
                      value={soapData.followUp.type}
                      onChange={(e) => setSoapData({
                        ...soapData,
                        followUp: {...soapData.followUp, type: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="in_person">In Person</option>
                      <option value="telemedicine">Telemedicine</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Notes</label>
                    <input
                      type="text"
                      value={soapData.followUp.notes}
                      onChange={(e) => setSoapData({
                        ...soapData,
                        followUp: {...soapData.followUp, notes: e.target.value}
                      })}
                      placeholder="Follow-up instructions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
              <div className="flex gap-3">
                <button
                  onClick={handleSOAPSubmit}
                  className="flex-1 py-3 bg-[#43A047] text-white rounded-lg font-semibold hover:bg-[#388E3C] transition-colors"
                >
                  Complete Consultation
                </button>
                <button
                  onClick={() => setShowSOAPModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Upload Modal */}
      {showReportModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Upload Prescription</h2>
                <button onClick={() => setShowReportModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Patient: <strong>{selectedAppointment.patientId?.name}</strong>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Prescription File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
              <div className="flex gap-3">
                <button
                  onClick={handleUploadReport}
                  disabled={!selectedFile}
                  className="flex-1 py-3 bg-[#1E88E5] text-white rounded-lg font-semibold hover:bg-[#1976D2] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Upload Prescription
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
