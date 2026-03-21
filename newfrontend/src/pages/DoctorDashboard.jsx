import { useEffect, useState } from "react";
import { Search, User, Calendar as CalendarIcon, Star, Bell, Stethoscope, FileText, Plus, X, AlertCircle, TrendingUp, Clock } from "lucide-react";
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
  const [stats, setStats] = useState({ total: 0, approved: 0, completed: 0 });
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
  const [patientHistory, setPatientHistory] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [searchPatientId, setSearchPatientId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    timeSlots: [{ startTime: "", endTime: "" }],
    isRecurring: false,
    recurringPattern: ""
  });

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
      await Promise.all([fetchAppointments(), fetchProfile(), fetchSchedules()]);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      console.log("=== FETCHING APPOINTMENTS ===");
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Raw API response:", data);
      
      if (data.success && data.appointments) {
        console.log("Appointments found:", data.appointments.length);
        setAppointments(data.appointments);
        
        // Update stats immediately
        const stats = {
          total: data.appointments.length,
          approved: data.appointments.filter(a => a.status === "approved").length,
          completed: data.appointments.filter(a => a.status === "completed").length
        };
        console.log("Calculated stats:", stats);
        setStats(stats);
      } else {
        console.log("No appointments found or API error");
        setAppointments([]);
        setStats({ total: 0, approved: 0, completed: 0 });
      }
    } catch (err) {
      console.error("=== FETCH ERROR ===", err);
      setAppointments([]);
      setStats({ total: 0, approved: 0, completed: 0 });
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

  const fetchPatientHistory = async (patientId) => {
    try {
      console.log("=== FETCHING PATIENT HISTORY ===");
      console.log("Patient ID:", patientId);
      
      const res = await fetch(`http://localhost:5000/api/appointments/patient-history/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      console.log("Patient history response:", data);
      if (data.success) {
        setPatientHistory(data.patient);
        console.log("Patient history loaded successfully");
      } else {
        console.error("Failed to load patient history:", data.message);
      }
    } catch (err) {
      console.error("Error fetching patient history:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctor-schedule", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      
      if (data.success) {
        setSchedules(data.schedules);
        console.log("Schedules loaded successfully");
      }
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };

  const createSchedule = async () => {
    try {
      // Validate form
      if (!scheduleForm.date || scheduleForm.timeSlots.some(slot => !slot.startTime || !slot.endTime)) {
        toast.error("Please fill all required fields");
        return;
      }

      const res = await fetch("http://localhost:5000/api/doctor-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(scheduleForm)
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Schedule created successfully");
        setShowScheduleModal(false);
        setScheduleForm({
          date: "",
          timeSlots: [{ startTime: "", endTime: "" }],
          isRecurring: false,
          recurringPattern: ""
        });
        fetchSchedules();
      } else {
        toast.error(data.message || "Failed to create schedule");
      }
    } catch (err) {
      toast.error("Failed to create schedule");
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/doctor-schedule/${scheduleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success("Schedule deleted successfully");
        fetchSchedules();
      } else {
        toast.error(data.message || "Failed to delete schedule");
      }
    } catch (err) {
      toast.error("Failed to delete schedule");
    }
  };

  const addTimeSlot = () => {
    setScheduleForm({
      ...scheduleForm,
      timeSlots: [...scheduleForm.timeSlots, { startTime: "", endTime: "" }]
    });
  };

  const removeTimeSlot = (index) => {
    setScheduleForm({
      ...scheduleForm,
      timeSlots: scheduleForm.timeSlots.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (index, field, value) => {
    const updatedTimeSlots = [...scheduleForm.timeSlots];
    updatedTimeSlots[index][field] = value;
    setScheduleForm({ ...scheduleForm, timeSlots: updatedTimeSlots });
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
        
        // If marking as completed, also open SOAP modal for note
        if (status === "completed") {
          const appointment = appointments.find(a => a._id === id);
          setSelectedAppointment(appointment);
          setShowSOAPModal(true);
        }
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
      
      <div className="w-full px-6 py-12 pt-24">
          
          {/* Header - Premium styling */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
            <p className="text-lg text-gray-600">Manage your appointments and patient consultations</p>
          </div>

          {/* Stats Cards - Premium */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-3xl font-bold text-[#0F9D76] mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600 font-medium">Total Appointments</div>
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
                { id: "schedule", label: "My Schedule" },
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
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Appointment Requests</h2>
                    
                    {/* Filter */}
                    <div className="flex flex-wrap gap-2">
                      {["all", "approved", "completed"].map(status => (
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

              
              {/* SCHEDULE TAB */}
              {activeTab === "schedule" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">My Availability Schedule</h2>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg text-sm font-medium hover:bg-[#0E8A6A] transition-all"
                    >
                      Add Schedule
                    </button>
                  </div>

                  {schedules.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-base font-medium text-gray-700 mb-1">No schedules found</h3>
                      <p className="text-sm text-gray-500">Create your availability schedule to allow patients to book appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {schedules.map(schedule => (
                        <div key={schedule._id} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">
                                {new Date(schedule.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h3>
                              {schedule.isRecurring && (
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mt-1">
                                  Recurring: {schedule.recurringPattern}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => deleteSchedule(schedule._id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {schedule.timeSlots.map((slot, index) => (
                              <div 
                                key={index} 
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                  slot.status === 'booked' 
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : slot.status === 'completed'
                                    ? 'bg-gray-100 text-gray-800 border border-gray-200'
                                    : 'bg-green-100 text-green-800 border border-green-200'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{slot.startTime} - {slot.endTime}</span>
                                  {slot.status === 'booked' && (
                                    <span className="text-xs">📅 Booked</span>
                                  )}
                                  {slot.status === 'completed' && (
                                    <span className="text-xs">✅ Done</span>
                                  )}
                                </div>
                              </div>
                            ))}
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
        </div>{/* SOAP Note Modal */}
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
      
      {/* PATIENT HISTORY TAB */}
      {activeTab === "patient-history" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Patient History Lookup</h2>
          </div>
          
          {/* Search Patient */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter Patient ID or Email"
                value={searchPatientId}
                onChange={(e) => setSearchPatientId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
              />
              <button
                onClick={() => {
                  if (searchPatientId.trim()) {
                    fetchPatientHistory(searchPatientId.trim());
                    setShowPatientModal(true);
                    setSearchPatientId("");
                    toast.success("Patient history loaded");
                  } else {
                    toast.error("Please enter Patient ID or Email");
                  }
                }}
                className="px-6 py-3 bg-[#1E88E5] text-white rounded-lg font-medium hover:bg-[#1976D2] transition-all"
              >
                <Search className="w-5 h-5" />
                Search Patient
              </button>
            </div>
          </div>

          {/* Patient History Display */}
          {patientHistory && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Patient: {patientHistory.name}
                </h3>
                
                {/* Patient Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Patient Status</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">New Patient:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          patientHistory.isNewPatient 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {patientHistory.isNewPatient ? "NEW" : "RETURNING"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Total Visits:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          {patientHistory.totalVisits}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Last Visit:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                          {patientHistory.lastVisitDate ? 
                            new Date(patientHistory.lastVisitDate).toLocaleDateString() : 
                            "Never"
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Visit Statistics</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Frequent Visitor:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          patientHistory.visitStats?.isFrequentVisitor 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {patientHistory.visitStats?.isFrequentVisitor ? "YES" : "NO"}
                        </span>
                      </div>
                      {patientHistory.visitStats?.daysSinceLastVisit !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Days Since Last Visit:</span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                            {patientHistory.visitStats.daysSinceLastVisit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Contact Info</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm font-medium text-gray-900">{patientHistory.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium text-gray-900">{patientHistory.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Medical History (Last 5 visits)</h4>
                {patientHistory.medicalHistory && patientHistory.medicalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {patientHistory.medicalHistory.slice(-5).map((record, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                              record.type === "consultation" ? "bg-blue-100 text-blue-800" :
                              record.type === "followup" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {record.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-600">Doctor:</span>
                            <span className="text-sm font-medium text-gray-900">{record.doctorId?.name || "Unknown"}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Diagnosis:</span>
                            <span className="text-sm font-medium text-gray-900">{record.diagnosis}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Prescription:</span>
                            <span className="text-sm font-medium text-gray-900">{record.prescription}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Notes:</span>
                            <span className="text-sm font-medium text-gray-900">{record.notes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No medical history available</p>
                  </div>
                )}
              </div>

              {/* Past Appointments with Current Doctor */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Past Appointments with You</h4>
                {patientHistory.appointmentNotes && patientHistory.appointmentNotes.length > 0 ? (
                  <div className="space-y-3">
                    {patientHistory.appointmentNotes.map((apt, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{apt.date}</span>
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {apt.status.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Dr. {apt.doctorName}</span>
                            <span className="ml-2 text-xs text-gray-500">({apt.specialization})</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {apt.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No past appointments with current doctor</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Patient History Modal */}
      {showPatientModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Patient History - {selectedAppointment.patientId?.name}
                </h2>
                <button onClick={() => setShowPatientModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedAppointment.patientId?.totalVisits > 1 ? "🔄 REPEATED" : "🆕 NEW"}
                    </div>
                    <div className="text-sm text-gray-600">Patient Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedAppointment.patientId?.totalVisits || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Visits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedAppointment.patientId?.lastVisitDate ? 
                        new Date(selectedAppointment.patientId.lastVisitDate).toLocaleDateString() : 
                        "Never"
                      }
                    </div>
                    <div className="text-sm text-gray-600">Last Visit</div>
                  </div>
                </div>
              </div>

              {/* Complete Medical History */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Complete Medical History</h3>
                {selectedAppointment.patientId?.medicalHistory && selectedAppointment.patientId.medicalHistory.length > 0 ? (
                  <div className="space-y-3">
                    {selectedAppointment.patientId.medicalHistory.slice().reverse().map((record, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.type === "consultation" ? "bg-blue-100 text-blue-800" :
                              record.type === "followup" ? "bg-green-100 text-green-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {record.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Doctor:</span>
                            <span className="text-sm font-medium text-gray-900 ml-2">
                              Dr. {record.doctorId?.name || "Unknown"}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Diagnosis:</span>
                            <span className="text-sm font-medium text-gray-900 ml-2">
                              {record.diagnosis || "Not recorded"}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-gray-600">Prescription:</span>
                            <span className="text-sm font-medium text-gray-900 ml-2">
                              {record.prescription || "Not recorded"}
                            </span>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-gray-600">Notes:</span>
                            <span className="text-sm font-medium text-gray-900 ml-2">
                              {record.notes || "No notes available"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">No medical history available</p>
                    <p className="text-sm">This patient hasn't had any previous consultations</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPatientModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Create Availability Schedule</h2>
                <button onClick={() => setShowScheduleModal(false)}>
                  <X className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Time Slots */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Time Slots</label>
                  <button
                    onClick={addTimeSlot}
                    className="px-3 py-1 bg-[#0F9D76] text-white rounded-lg text-sm font-medium hover:bg-[#0E8A6A] transition-all"
                  >
                    Add Time Slot
                  </button>
                </div>
                
                <div className="space-y-3">
                  {scheduleForm.timeSlots.map((slot, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                        placeholder="Start Time"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                        placeholder="End Time"
                      />
                      {scheduleForm.timeSlots.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recurring Options */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={scheduleForm.isRecurring}
                    onChange={(e) => setScheduleForm({...scheduleForm, isRecurring: e.target.checked})}
                    className="rounded border-gray-300 text-[#0F9D76] focus:ring-[#0F9D76]"
                  />
                  <span className="text-sm font-medium text-gray-700">Recurring Schedule</span>
                </label>
                
                {scheduleForm.isRecurring && (
                  <div className="mt-3">
                    <select
                      value={scheduleForm.recurringPattern}
                      onChange={(e) => setScheduleForm({...scheduleForm, recurringPattern: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                    >
                      <option value="">Select pattern</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-3xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createSchedule}
                  className="flex-1 py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0E8A6A] transition-colors"
                >
                  Create Schedule
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
