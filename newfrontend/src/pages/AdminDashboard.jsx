// Premium Admin Dashboard with Analytics
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  X,
  Clock,
  Search,
  Trash2,
  Eye,
  Edit,
  Ban,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckSquare,
  XSquare,
  CalendarX
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  useEffect(() => {
    // Load data regardless of token (for admin pranjal access)
    loadData();
    // Refresh stats every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStats(), fetchUsers(), fetchAppointments()]);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer admin-access-key-pranjal" };
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers
      });
      const data = await res.json();
      console.log("=== Admin Stats Response ===");
      console.log("Full response:", data);
      console.log("Total Revenue:", data.totalRevenue);
      console.log("Revenue by Month:", data.revenueByMonth);
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer admin-access-key-pranjal" };
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer admin-access-key-pranjal" };
      const res = await fetch("http://localhost:5000/api/admin/appointments", {
        headers
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer admin-access-key-pranjal" };
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : { Authorization: "Bearer admin-access-key-pranjal" };
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
        method: "DELETE",
        headers
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment deleted successfully");
        fetchAppointments();
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.message || "Failed to delete appointment");
      }
    } catch (err) {
      toast.error("Failed to delete appointment");
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) {
      toast.error("Please select new date and time");
      return;
    }

    try {
      const headers = { 
        "Content-Type": "application/json",
        Authorization: "Bearer admin-access-key-pranjal"
      };
      
      console.log("=== Frontend Reschedule Debug ===");
      console.log("Appointment ID:", selectedAppointment._id);
      console.log("New Date:", rescheduleDate);
      console.log("New Time:", rescheduleTime);
      console.log("Auth Header:", headers.Authorization);
      
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${selectedAppointment._id}/reschedule`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          date: rescheduleDate,
          time: rescheduleTime,
        }),
      });

      const data = await res.json();
      console.log("=== Backend Response ===");
      console.log("Status:", res.status);
      console.log("Response:", data);
      
      if (data.success) {
        toast.success("Appointment rescheduled successfully");
        setShowRescheduleModal(false);
        setSelectedAppointment(null);
        setRescheduleDate("");
        setRescheduleTime("");
        
        // Update the appointment in the local state with new date and time
        setAppointments(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === selectedAppointment._id 
              ? { ...apt, date: rescheduleDate, time: rescheduleTime }
              : apt
          )
        );
        
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.message || "Failed to reschedule appointment");
      }
    } catch (err) {
      toast.error("Failed to reschedule appointment");
    }
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      const headers = token ? { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      } : { 
        "Content-Type": "application/json",
        Authorization: "Bearer admin-access-key-pranjal" 
      };
      const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Appointment ${status} successfully`);
        fetchAppointments();
        fetchStats(); // Refresh stats
      } else {
        toast.error(data.message || "Failed to update appointment");
      }
    } catch (err) {
      toast.error("Failed to update appointment");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  // Remove duplicates and show unique appointments
  const uniqueAppointments = appointments.filter((apt, index, self) => 
    index === self.findIndex((t) => t._id === apt._id)
  );
  const filteredAppointments = uniqueAppointments.slice(0, 20);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending_approval: "bg-orange-100 text-orange-800 border-orange-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return badges[status] || badges.pending;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      doctor: "bg-blue-100 text-blue-800 border-blue-200",
      patient: "bg-green-100 text-green-800 border-green-200"
    };
    return badges[role] || badges.patient;
  };

  const getPatientTypeBadge = (user) => {
    // Check if user exists and has required properties
    if (!user || !user._id) {
      return { text: "N/A", className: "bg-gray-100 text-gray-800 border-gray-200" };
    }
    
    // Count actual appointments for this patient
    const patientAppointments = appointments.filter(apt => 
      apt.patientId && apt.patientId._id === user._id
    );
    
    const appointmentCount = patientAppointments.length;
    
    // Check if patient has booked in the past (by checking if any appointment exists)
    const hasPastBookings = appointmentCount > 0;
    
    // New patient = no past bookings OR first appointment from new account
    if (!hasPastBookings) {
      return { text: "New", className: "bg-green-100 text-green-800 border-green-200" };
    } else {
      // Repeated patient = has booked in the past
      return { text: "Repeated", className: "bg-purple-100 text-purple-800 border-purple-200" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0F9D76] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white">
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="max-w-screen-2xl mx-auto px-8 lg:px-12">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-gray-900 mb-3">Admin Dashboard</h1>
            <p className="text-xl text-gray-600">Manage users, appointments, and system analytics</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <Users className="w-10 h-10 text-blue-500" />
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalPatients || 0}</div>
                <div className="text-base text-gray-600 font-medium">Total Patients</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <UserCheck className="w-10 h-10 text-[#0F9D76]" />
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalDoctors || 0}</div>
                <div className="text-base text-gray-600 font-medium">Total Doctors</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <Calendar className="w-10 h-10 text-purple-500" />
                  <Activity className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats.totalAppointments || 0}</div>
                <div className="text-base text-gray-600 font-medium">Total Appointments</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <Clock className="w-10 h-10 text-yellow-500" />
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stats.pending || 0}</div>
                <div className="text-base text-gray-600 font-medium">Pending Appointments</div>
              </div>
            </div>
          )}

          {/* Patient Identification Statistics */}
          {stats && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-500" />
                Patient Identification Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-green-800">
                      {users.filter(u => {
                        if (u.role !== 'patient') return false;
                        const patientAppointments = appointments.filter(apt => 
                          apt.patientId && apt.patientId._id === u._id
                        );
                        return patientAppointments.length === 0;
                      }).length}
                    </span>
                  </div>
                  <div className="text-sm text-green-700 font-medium">New Patients</div>
                  <div className="text-xs text-green-600 mt-1">First-time patients (no past bookings)</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-lg font-bold text-purple-800">
                      {users.filter(u => {
                        if (u.role !== 'patient') return false;
                        const patientAppointments = appointments.filter(apt => 
                          apt.patientId && apt.patientId._id === u._id
                        );
                        return patientAppointments.length > 0;
                      }).length}
                    </span>
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Repeated Patients</div>
                  <div className="text-xs text-purple-600 mt-1">Patients with past bookings</div>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Status Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.pending || 0}</span>
                </div>
                <div className="text-base text-gray-600">Pending</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.approved || 0}</span>
                </div>
                <div className="text-base text-gray-600">Approved</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <span className="text-2xl font-bold text-gray-900">{stats.rejected || 0}</span>
                </div>
                <div className="text-base text-gray-600">Rejected</div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-4 mb-3">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.totalAppointments - (stats.pending + stats.approved + stats.rejected) || 0}
                  </span>
                </div>
                <div className="text-base text-gray-600">Completed</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "users", label: "Users", icon: Users },
                { id: "appointments", label: "Appointments", icon: Calendar }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-5 px-8 text-base font-semibold transition-all flex items-center justify-center gap-3 ${
                    activeTab === tab.id
                      ? "text-[#0F9D76] border-b-2 border-[#0F9D76] bg-white"
                      : "text-gray-600 hover:text-[#0F9D76] hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && stats && (
                <div className="space-y-8">
                  {/* Enhanced Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <Users className="w-12 h-12" />
                          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <span className="text-sm font-semibold">+12%</span>
                          </div>
                        </div>
                        <div className="text-5xl font-bold mb-3">{(stats.totalPatients || 0) + (stats.totalDoctors || 0)}</div>
                        <div className="text-blue-100 font-medium text-lg">Total Users</div>
                        <div className="mt-3 pt-3 border-t border-blue-400 border-opacity-30">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-100">Live Now</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <UserCheck className="w-12 h-12" />
                          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <span className="text-sm font-semibold">+8%</span>
                          </div>
                        </div>
                        <div className="text-5xl font-bold mb-3">{stats.totalDoctors || 0}</div>
                        <div className="text-emerald-100 font-medium text-lg">Total Doctors</div>
                        <div className="mt-3 pt-3 border-t border-emerald-400 border-opacity-30">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-emerald-100">Active Today</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <Calendar className="w-12 h-12" />
                          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <span className="text-sm font-semibold">+25%</span>
                          </div>
                        </div>
                        <div className="text-5xl font-bold mb-3">{stats.totalAppointments || 0}</div>
                        <div className="text-purple-100 font-medium text-lg">Total Appointments</div>
                        <div className="mt-3 pt-3 border-t border-purple-400 border-opacity-30">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-purple-100">This Month</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                          <Clock className="w-12 h-12" />
                          <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                            <span className="text-sm font-semibold">Urgent</span>
                          </div>
                        </div>
                        <div className="text-5xl font-bold mb-3">{stats.pending || 0}</div>
                        <div className="text-orange-100 font-medium text-lg">Pending Approval</div>
                        <div className="mt-3 pt-3 border-t border-orange-400 border-opacity-30">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
                            <span className="text-xs text-orange-100">Action Required</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced System Overview */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-10 text-white shadow-2xl">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold">System Overview</h3>
                        <div className="bg-green-500 bg-opacity-20 rounded-full p-3">
                          <Activity className="w-7 h-7 text-green-400" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300 font-medium">Total Users</span>
                            <span className="text-3xl font-bold text-white">
                              {(stats.totalPatients || 0) + (stats.totalDoctors || 0)}
                            </span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300 font-medium">Total Appointments</span>
                            <span className="text-3xl font-bold text-white">{stats.totalAppointments || 0}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                        </div>
                        <div className="group">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-300 font-medium">Pending Reviews</span>
                            <span className="text-3xl font-bold text-white">{stats.pending || 0}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style={{width: '30%'}}></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">System Health</span>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-400 font-medium">Optimal</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity - Unchanged */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-10 shadow-xl border border-gray-100">
                      <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Activity className="w-7 h-7 text-blue-600" />
                        </div>
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        {filteredAppointments.slice(0, 6).map(apt => (
                          <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="bg-white rounded-full p-2 shadow-sm">
                                <Calendar className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {apt.patientId?.name} → Dr. {apt.doctorId?.name}
                                </p>
                                <p className="text-sm text-gray-500">{apt.date} at {apt.time}</p>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusBadge(apt.status)}`}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Enhanced Appointments by Status */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-10 shadow-xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-bold text-gray-900">Appointment Status Overview</h3>
                        <div className="bg-indigo-100 rounded-full p-3">
                          <PieChart className="w-7 h-7 text-indigo-600" />
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: 'Pending Approval', value: stats.pending || 0, status: 'pending' },
                              { name: 'Approved', value: stats.approved || 0, status: 'approved' },
                              { name: 'Completed', value: (stats.totalAppointments || 0) - (stats.pending || 0) - (stats.approved || 0) - (stats.rejected || 0), status: 'completed' },
                              { name: 'Rejected', value: stats.rejected || 0, status: 'rejected' },
                              { name: 'Cancelled', value: stats.cancelled || 0, status: 'cancelled' }
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent, value }) => (
                              <text 
                                x={0} 
                                y={0} 
                                fill="white" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                className="text-sm font-bold"
                              >
                                {`${value}`}
                              </text>
                            )}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: 'Pending Approval', value: stats.pending || 0, status: 'pending' },
                              { name: 'Approved', value: stats.approved || 0, status: 'approved' },
                              { name: 'Completed', value: (stats.totalAppointments || 0) - (stats.pending || 0) - (stats.approved || 0) - (stats.rejected || 0), status: 'completed' },
                              { name: 'Rejected', value: stats.rejected || 0, status: 'rejected' },
                              { name: 'Cancelled', value: stats.cancelled || 0, status: 'cancelled' }
                            ].filter(item => item.value > 0).map((entry, index) => {
                              const colors = {
                                'pending': '#F59E0B',
                                'approved': '#10B981', 
                                'completed': '#3B82F6',
                                'rejected': '#EF4444',
                                'cancelled': '#6B7280'
                              };
                              return <Cell key={`cell-${index}`} fill={colors[entry.status]} />;
                            })}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                              border: 'none', 
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                            formatter={(value, name) => [`${value} appointments`, name]}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="mt-6 space-y-3">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Status Breakdown:</div>
                        {[
                          { name: 'Pending Approval', value: stats.pending || 0, status: 'pending', color: '#F59E0B', icon: AlertCircle, desc: 'Waiting for admin review' },
                          { name: 'Approved', value: stats.approved || 0, status: 'approved', color: '#10B981', icon: CheckSquare, desc: 'Confirmed appointments' },
                          { name: 'Completed', value: (stats.totalAppointments || 0) - (stats.pending || 0) - (stats.approved || 0) - (stats.rejected || 0), status: 'completed', color: '#3B82F6', icon: CheckCircle, desc: 'Finished consultations' },
                          { name: 'Rejected', value: stats.rejected || 0, status: 'rejected', color: '#EF4444', icon: XSquare, desc: 'Declined requests' },
                          { name: 'Cancelled', value: stats.cancelled || 0, status: 'cancelled', color: '#6B7280', icon: CalendarX, desc: 'Cancelled by users' }
                        ].filter(item => item.value > 0).map((item) => (
                          <div key={item.status} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded" style={{backgroundColor: item.color}}></div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <item.icon className="w-5 h-5" style={{color: item.color}} />
                                  <span className="font-semibold text-gray-900">{item.name}</span>
                                </div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">{item.value}</div>
                              <div className="text-xs text-gray-500">appointments</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Appointments Trend */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">30-Day Trend Analysis</h3>
                        <div className="bg-emerald-100 rounded-full p-2">
                          <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={stats.appointmentsByDate || []}>
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="_id" 
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: 'none', 
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="count" 
                            stroke="url(#colorGradient)" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Appointments"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-6 bg-emerald-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-emerald-800">Average Daily Appointments</span>
                          <span className="text-xl font-bold text-emerald-900">
                            {stats.appointmentsByDate?.length > 0 
                              ? Math.round((stats.appointmentsByDate.reduce((acc, item) => acc + item.count, 0) / stats.appointmentsByDate.length))
                              : 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Appointments by Specialization */}
                  {stats.appointmentsBySpecialization && stats.appointmentsBySpecialization.length > 0 && (
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 shadow-xl border border-rose-100">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Specialization Analytics</h3>
                        <div className="bg-rose-100 rounded-full p-2">
                          <BarChart3 className="w-6 h-6 text-rose-600" />
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={stats.appointmentsBySpecialization.map(item => ({ name: item._id || "Unknown", count: item.count }))}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={100}
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                          />
                          <YAxis 
                            stroke="#6B7280"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: 'none', 
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                          />
                          <Bar 
                            dataKey="count" 
                            fill="url(#barGradient)" 
                            name="Appointments"
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.appointmentsBySpecialization.slice(0, 4).map((item, index) => (
                          <div key={item._id} className="bg-white rounded-xl p-4 text-center shadow-sm">
                            <div className="text-2xl font-bold text-rose-600 mb-1">{item.count}</div>
                            <div className="text-sm text-gray-600 capitalize">{item._id || "Unknown"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Revenue Chart - Paid Appointments */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border border-green-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">Revenue Analytics</h3>
                        <p className="text-sm text-gray-600 mt-1">Total revenue from all paid appointments</p>
                      </div>
                      <div className="bg-green-100 rounded-full p-2">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stats.revenueByMonth || []}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6B7280"
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6B7280"
                          tick={{ fill: '#6B7280', fontSize: 12 }}
                          tickFormatter={(value) => `Rs. ${value}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: 'none', 
                            borderRadius: '8px',
                            color: 'white'
                          }} 
                          formatter={(value) => [`Rs. ${value?.toLocaleString() || 0}`, 'Revenue']}
                          labelFormatter={(label) => `Month: ${label}`}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="url(#revenueGradient)" 
                          radius={[8, 8, 0, 0]}
                          name="Revenue"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-green-800">Total Revenue</span>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                              Rs. {stats.totalRevenue?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="bg-green-200 rounded-full p-3">
                            <DollarSign className="w-6 h-6 text-green-700" />
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-blue-800">Completed & Paid Appointments</span>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                              {stats.completedAndPaidCount || 0}
                            </p>
                          </div>
                          <div className="bg-blue-200 rounded-full p-3">
                            <CheckCircle className="w-6 h-6 text-blue-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                      />
                    </div>
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="patient">Patients</option>
                      <option value="doctor">Doctors</option>
                      <option value="admin">Admins</option>
                    </select>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.picture || "https://via.placeholder.com/40"}
                                  alt={user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-gray-900">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* APPOINTMENTS TAB */}
              {activeTab === "appointments" && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Doctor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAppointments.map(apt => (
                          <tr key={apt._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={apt.patientId?.picture || "https://via.placeholder.com/40"}
                                  alt={apt.patientId?.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{apt.patientId?.name || "Unknown"}</p>
                                  <p className="text-xs text-gray-500">{apt.patientId?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPatientTypeBadge(apt.patientId || {}).className}`}>
                                {getPatientTypeBadge(apt.patientId || {}).text}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-medium text-gray-900">Dr. {apt.doctorId?.name || "Unknown"}</p>
                                <p className="text-xs text-gray-500">{apt.doctorId?.specialization || "General"}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600">
                              <p>{apt.date}</p>
                              <p className="text-xs text-gray-500">{apt.time}</p>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status)}`}>
                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                              {apt.reason || "-"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                {apt.status !== "approved" && apt.status !== "completed" && apt.status !== "rejected" && (
                                  <button
                                    onClick={() => updateAppointmentStatus(apt._id, "approved")}
                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    Approve
                                  </button>
                                )}
                                {apt.status !== "completed" && apt.status !== "rejected" && (
                                  <button
                                    onClick={() => {
                                      setSelectedAppointment(apt);
                                      setShowRescheduleModal(true);
                                    }}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all flex items-center gap-1"
                                  >
                                    <CalendarX className="w-3 h-3" />
                                    Reschedule
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteAppointment(apt._id)}
                                  className="px-3 py-1.5 bg-gray-500 text-white rounded-lg text-xs font-medium hover:bg-gray-600 transition-all flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {filteredAppointments.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No appointments found</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-10 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-blue-600">Reschedule Appointment</h3>
              <button onClick={() => setShowRescheduleModal(false)}>
                <X className="w-8 h-8 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <div className="mb-8">
              <p className="text-xl text-gray-700 mb-4">Reschedule appointment for:</p>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="font-bold text-lg">Patient: {selectedAppointment.patientId?.name}</p>
                <p className="text-xl text-gray-600">Doctor: Dr. {selectedAppointment.doctorId?.name}</p>
                <p className="text-xl text-gray-600">Current: {selectedAppointment.date} at {selectedAppointment.time}</p>
                <p className="text-xl text-gray-600">Reason: {selectedAppointment.reason || "Not specified"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-lg font-medium mb-3">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-6 py-4 border-2 rounded-xl text-lg focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-3">New Time</label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-6 py-4 border-2 rounded-xl text-lg focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRescheduleAppointment}
                className="flex-1 py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600"
              >
                Reschedule Appointment
              </button>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-4 bg-gray-200 text-gray-700 text-xl font-bold rounded-2xl hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
