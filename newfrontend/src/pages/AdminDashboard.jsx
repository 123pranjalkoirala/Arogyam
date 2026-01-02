// Premium Admin Dashboard with Analytics
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Trash2,
  Eye,
  Edit,
  Ban,
  BarChart3,
  PieChart
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

  useEffect(() => {
    // Allow access even without token (for admin pranjal access)
    // But try to load data if token exists
    if (token) {
      loadData();
      // Refresh stats every 30 seconds for real-time updates
      const interval = setInterval(() => {
        fetchStats();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      // Show message that admin login is needed
      toast.info("Please login as admin to access full features");
    }
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
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
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
      const res = await fetch("http://localhost:5000/api/admin/appointments", {
        headers: { Authorization: `Bearer ${token}` }
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
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === "all" || user.role === userFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredAppointments = appointments.slice(0, 20);

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
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
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-lg text-gray-600">Manage users, appointments, and system analytics</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPatients || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Total Patients</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <UserCheck className="w-8 h-8 text-[#0F9D76]" />
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDoctors || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Total Doctors</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-purple-500" />
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalAppointments || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Total Appointments</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending || 0}</div>
                <div className="text-sm text-gray-600 font-medium">Pending Appointments</div>
              </div>
            </div>
          )}

          {/* Appointment Status Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-bold text-gray-900">{stats.pending || 0}</span>
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg font-bold text-gray-900">{stats.approved || 0}</span>
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span className="text-lg font-bold text-gray-900">{stats.rejected || 0}</span>
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  <span className="text-lg font-bold text-gray-900">
                    {stats.totalAppointments - (stats.pending + stats.approved + stats.rejected) || 0}
                  </span>
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "users", label: "Users", icon: Users },
                { id: "appointments", label: "Appointments", icon: Calendar }
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
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quick Stats */}
                    <div className="bg-gradient-to-br from-[#0F9D76] to-[#0d8a66] rounded-xl p-6 text-white">
                      <h3 className="text-xl font-bold mb-4">System Overview</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span>Total Users</span>
                          <span className="text-2xl font-bold">
                            {(stats.totalPatients || 0) + (stats.totalDoctors || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Total Appointments</span>
                          <span className="text-2xl font-bold">{stats.totalAppointments || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Pending Reviews</span>
                          <span className="text-2xl font-bold">{stats.pending || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {filteredAppointments.slice(0, 5).map(apt => (
                          <div key={apt._id} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {apt.patientId?.name} → Dr. {apt.doctorId?.name}
                              </p>
                              <p className="text-xs text-gray-500">{apt.date} at {apt.time}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(apt.status)}`}>
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Appointments by Status (Pie Chart) */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments by Status</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={stats.appointmentsByStatus || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.appointmentsByStatus?.map((entry, index) => {
                              const colors = ["#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#6B7280"];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Pie>
                          <Tooltip />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Appointments by Date (Line Chart) */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments Trend (Last 30 Days)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.appointmentsByDate || []}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="_id" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="count" stroke="#0F9D76" strokeWidth={2} name="Appointments" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Appointments by Specialization (Bar Chart) */}
                  {stats.appointmentsBySpecialization && stats.appointmentsBySpecialization.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments by Specialization</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stats.appointmentsBySpecialization.map(item => ({ name: item._id || "Unknown", count: item.count }))}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#0F9D76" name="Appointments" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
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
    </div>
  );
}
