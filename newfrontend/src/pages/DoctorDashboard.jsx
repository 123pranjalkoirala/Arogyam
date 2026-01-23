import { useEffect, useState } from "react";
import { Search, User, Calendar as CalendarIcon, Star, Bell, Stethoscope, FileText } from "lucide-react";
import BasicSOAPNotes from "../components/BasicSOAPNotes";
import ScrollToTop from "../components/ScrollToTop";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("appointments");
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0 });
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

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
      const res = await fetch("http://localhost:5000/api/appointments", {
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

  const uploadReport = async (appointmentId, patientId, file) => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("patientId", patientId);
    form.append("appointmentId", appointmentId);
    form.append("title", "Prescription");

    try {
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Prescription uploaded successfully");
        fetchAppointments();
      } else {
        toast.error(data.message || "Failed to upload prescription");
      }
    } catch (err) {
      toast.error("Failed to upload prescription");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
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
                { id: "soap", label: "SOAP Notes" },
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
                              ? "bg-[#0F9D76] text-white"
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
                                        setActiveTab("soap");
                                      }}
                                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-all"
                                    >
                                      SOAP Notes
                                    </button>
                                    <label className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all cursor-pointer text-center">
                                      Upload Prescription
                                      <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        className="hidden"
                                        onChange={e => uploadReport(a._id, a.patientId._id, e.target.files[0])}
                                      />
                                    </label>
                                    <button
                                      onClick={() => updateStatus(a._id, "completed")}
                                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs font-medium hover:bg-purple-600 transition-all"
                                    >
                                      Mark Complete
                                    </button>
                                  </>
                                )}

                                {a.status === "completed" && (
                                  <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                                    Consultation Completed
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

              {/* SOAP NOTES TAB */}
              {activeTab === "soap" && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Medical Documentation</h2>
                    <p className="text-gray-600">Create and manage SOAP notes for patient consultations</p>
                  </div>
                  
                  {!selectedAppointment ? (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Appointment</h3>
                      <p className="text-gray-600 mb-4">Choose an appointment from the Appointments tab to create SOAP notes</p>
                      <button
                        onClick={() => setActiveTab("appointments")}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Go to Appointments
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-blue-900">Selected Appointment</h4>
                            <p className="text-blue-700">
                              Patient: {selectedAppointment.patientId?.name || "Unknown"} | 
                              Date: {selectedAppointment.date} | 
                              Time: {selectedAppointment.time}
                            </p>
                          </div>
                          <button
                            onClick={() => setSelectedAppointment(null)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear Selection
                          </button>
                        </div>
                      </div>
                      <BasicSOAPNotes
                        appointmentId={selectedAppointment._id}
                        patientId={selectedAppointment.patientId?._id}
                        onSave={() => {
                          toast.success("Professional SOAP notes saved successfully");
                          setSelectedAppointment(null);
                        }}
                      />
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
                        className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg text-sm font-medium hover:bg-[#0d8a66] transition-all"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <img
                        src={profile.picture || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&q=80"}
                        alt={profile.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-[#0F9D76]/20 flex-shrink-0"
                        onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=47"}
                      />
                      <div className="flex-1 space-y-3">
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
                                <label className="block text-xs font-medium text-gray-700 mb-1">Qualification</label>
                                <input
                                  type="text"
                                  value={editForm.qualification}
                                  onChange={(e) => setEditForm({...editForm, qualification: e.target.value})}
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
                            <div className="flex gap-2">
                              <button
                                onClick={updateProfile}
                                className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg text-sm font-medium hover:bg-[#0d8a66] transition-all"
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
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-600">Full Name</label>
                                <p className="text-sm font-medium text-gray-900">Dr. {profile.name}</p>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-600">Email Address</label>
                                <p className="text-sm text-gray-700">{profile.email}</p>
                              </div>
                              {profile.specialization && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Specialization</label>
                                  <p className="text-sm text-gray-700">{profile.specialization}</p>
                                </div>
                              )}
                              {profile.experience && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Experience</label>
                                  <p className="text-sm text-gray-700">{profile.experience} years</p>
                                </div>
                              )}
                              {profile.qualification && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Qualification</label>
                                  <p className="text-sm text-gray-700">{profile.qualification}</p>
                                </div>
                              )}
                              {profile.phone && (
                                <div>
                                  <label className="text-xs font-medium text-gray-600">Phone</label>
                                  <p className="text-sm text-gray-700">{profile.phone}</p>
                                </div>
                              )}
                            </div>
                            {profile.bio && (
                              <div>
                                <label className="text-xs font-medium text-gray-600">Bio</label>
                                <p className="text-sm text-gray-700">{profile.bio}</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
