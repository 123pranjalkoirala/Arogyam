// Doctor Dashboard - Main component for doctors

import { useEffect, useState } from "react";



// Import icons for UI

import { Search, User, Calendar as CalendarIcon, Star, Bell, Stethoscope, FileText, Plus, X, AlertCircle, TrendingUp, Clock } from "lucide-react";



// Import components

import ScrollToTop from "../components/ScrollToTop";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import Navbar from "../components/Navbar";



// DOCTOR DASHBOARD COMPONENT - Main Component Definition

// 

// PURPOSE: Central dashboard for doctors to manage their entire medical practice
export default function DoctorDashboard() {

  // NAVIGATION AND AUTHENTICATION SETUP
  const navigate = useNavigate(); 

  // Authentication Data from localStorage

  const token = localStorage.getItem("token");        // JWT token for API calls
  // User Role Identifier

  // Purpose: Determines user's permissions and accessible features

  const userRole = localStorage.getItem("role");       // User role verification
  // User Display Name

  // Purpose: Personalized user experience and UI display
  const userName = localStorage.getItem("userName");      // User display name
  // DEVELOPMENT DEBUGGING - Development and Troubleshooting Tools
  console.log("DOCTOR DASHBOARD DEBUG");

  console.log("Token:", !!token);

  console.log("User Role:", userRole);

  console.log("User Name:", userName);
  // This section defines all the state variables that control the component's
  const [activeTab, setActiveTab] = useState("overview");  // Current active tab
  // Doctor Profile State

  // Purpose: Stores the doctor's professional and personal information

  const [profile, setProfile] = useState(null);              // User profile data
  // Appointments State

  // Purpose: Stores all appointments for the current doctor

  const [appointments, setAppointments] = useState([]);         // User appointments

  // Loading State

  // Purpose: Indicates when async operations are in progress

  const [loading, setLoading] = useState(true);               

  // Search Query State

  // Purpose: Stores the search query for finding appointments by patient name

  const [searchQuery, setSearchQuery] = useState("");
  // These states manage the dashboard's analytical and filtering capabilities
 

  const [stats, setStats] = useState({ total: 0, approved: 0, completed: 0 }); 
  // Appointment Filter State

  // Purpose: Controls which appointments are displayed based on status

  const [filterStatus, setFilterStatus] = useState("all");  

  // MODAL VISIBILITY STATES - UI Modal Controls

  // These states control which modal dialogs are currently visible 

  const [selectedAppointment, setSelectedAppointment] = useState(null);  
  // SOAP Note Modal State

  // Purpose: Controls visibility of SOAP note creation modal

  const [showSOAPModal, setShowSOAPModal] = useState(false);        
// Prescription Modal State

  // Purpose: Controls visibility of prescription creation modal

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);      

  // MEDICAL DATA STATES - Patient Medical Information

  // These states manage medical and patient-related data

  const [soapData, setSoapData] = useState({

    subjective: "",           // Patient's reported symptoms and complaints

    objective: "",           // Doctor's objective observations and clinical findings

    assessment: "",          // Doctor's diagnosis and medical assessment

    plan: "",               // Treatment plan, medications, and recommendations

    followUp: { date: "", notes: "", type: "in_person" }  // Follow-up appointment details

  });



  // PRESCRIPTION STATES - Independent prescription management

  const [prescriptionData, setPrescriptionData] = useState({

    medications: [{

      name: "",

      dosage: "",

      frequency: "",

      duration: "",

      instructions: "",

      quantity: ""

    }],

    diagnosis: "",

    symptoms: "",

    allergies: "",

    refills: 0,

    notes: ""

  });
  // Patient History State

  // Purpose: Stores medical history data for a selected patient

  const [patientHistory, setPatientHistory] = useState(null); 
  // Patient Modal State

  // Purpose: Controls visibility of patient history modal

  const [showPatientModal, setShowPatientModal] = useState(false); 

  // Patient Search State

  // Purpose: Stores the search query for finding patients by ID

  const [searchPatientId, setSearchPatientId] = useState(""); 
  // Profile Editing State

  // Purpose: Controls whether profile is in edit mode

  const [editingProfile, setEditingProfile] = useState(false);
  // Edit Form State

  // Purpose: Stores profile form data during editing

  const [editForm, setEditForm] = useState({

    name: "",

    email: "",

    phone: "",

    gender: "",

    specialization: "",

    qualification: "",

    experience: "",

    consultationFee: "",

    medicalLicense: "",

    hospitalAffiliation: "",

    languages: "",

    bio: ""

  });
  // Notifications State

  // Purpose: Stores notifications for the doctor

  const [notifications, setNotifications] = useState([]); 
// Notifications Modal State

  // Purpose: Controls visibility of notifications modal

  const [showNotifications, setShowNotifications] = useState(false); 
  // SCHEDULE MANAGEMENT STATES - Doctor Availability

  // These states manage the doctor's availability scheduling system

  const [schedules, setSchedules] = useState([]);           
  // Schedule Modal State

  // Purpose: Controls visibility of schedule creation modal

  const [showScheduleModal, setShowScheduleModal] = useState(false); 
  // Schedule Form State

  // Purpose: Stores the schedule creation form data

  const [scheduleForm, setScheduleForm] = useState({         

    dates: [""],                   // Array of selected dates for availability (up to 5 dates) - starts with one empty date

    timeSlots: [{ startTime: "", endTime: "" }], // Array of available time slots for each day

    isRecurring: false,          // Whether this schedule repeats (daily/weekly/monthly)

    recurringPattern: "weekly",         // Pattern for recurring schedules

    selectedDays: [],            // Selected days of week for recurring schedules

    overwriteExisting: false     // Whether to overwrite existing schedules

  });
  // Component lifecycle hooks

  useEffect(() => {

    // Authentication check

    if (!token) {

      navigate("/login");

      return;

    }

    // Role verification

    if (userRole !== "doctor") {

      console.log("ROLE MISMATCH");

      toast.error(`Access denied. This dashboard is for doctors only. Your role: ${userRole}`);

      navigate(`/${userRole}`);

      return;

    }

    // Load data

    loadData();

  }, [token, userRole, navigate]);



  // Data loading functions

  const loadData = async () => {

    setLoading(true);

    try {

      // Load data in parallel

      await Promise.all([

        fetchAppointments(),

        fetchProfile(),

        fetchSchedules()

      ]);

    } catch (err) {

      console.error("Error loading data:", err);

    } finally {

      setLoading(false);

    }

  };
  // APPOINTMENT DATA FETCHING
  // Fetch Appointments Function

  // Purpose: Retrieves all appointments for the current doctor from the API

  const fetchAppointments = async () => {

    try {

      // Debug logging - track API call initiation

      console.log("=== FETCHING APPOINTMENTS ===");

      

      // API call to fetch appointments

      // Headers include JWT token for authentication

      const res = await fetch("http://localhost:5000/api/appointments", {

        headers: { Authorization: `Bearer ${token}` }

      });

      

      // Log response status for debugging

      console.log("Response status:", res.status);

      

      // HTTP Error Handling

      // Check if response is successful (status 200-299)

      if (!res.ok) {

        throw new Error(`HTTP error! status: ${res.status}`);

      }

      

      // Parse JSON response

      const data = await res.json();

      console.log("Raw API response:", data);

      

      // Success Handling - Process and store appointments

      if (data.success && data.appointments) {

        // Log successful data retrieval

        console.log("Appointments found:", data.appointments.length);

        

        // Update appointments state - triggers UI re-render

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

      const selectedDate = scheduleForm.dates[0];

      

      if (!selectedDate || scheduleForm.timeSlots.some(slot => !slot.startTime || !slot.endTime)) {

        toast.error("Please select a date and fill all time slots");

        return;

      }



      // Filter out empty time slots

      const validTimeSlots = scheduleForm.timeSlots.filter(slot => slot.startTime && slot.endTime);

      

      if (validTimeSlots.length === 0) {

        toast.error("Please add at least one time slot");

        return;

      }



      // Create form data

      const formData = {

        dates: [selectedDate],

        timeSlots: validTimeSlots,

        isRecurring: scheduleForm.isRecurring,

        recurringPattern: scheduleForm.recurringPattern,

        selectedDays: scheduleForm.selectedDays,

        overwriteExisting: scheduleForm.overwriteExisting

      };



      console.log("=== FRONTEND SCHEDULE CREATION ===");

      console.log("Form data:", formData);



      // Send schedule data

      const res = await fetch("http://localhost:5000/api/doctor-schedule", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`

        },

        body: JSON.stringify(formData)

      });

      

      const data = await res.json();

      

      console.log("Backend response:", data);

      

      if (data.success) {

        toast.success(`Schedule created successfully with ${validTimeSlots.length} time slot(s)`);

        setShowScheduleModal(false);

        setScheduleForm({

          dates: [""],

          timeSlots: [{ startTime: "", endTime: "" }],

          isRecurring: false,

          recurringPattern: "weekly",

          selectedDays: [],

          overwriteExisting: false

        });

        fetchSchedules();

      } else {

        // Handle partial success or complete failure

        if (data.schedules && data.schedules.length > 0) {

          toast.success(`Schedule created with ${validTimeSlots.length} time slot(s)`);

          if (data.errors && data.errors.length > 0) {

            // Show specific error messages

            data.errors.forEach(error => {

              toast.error(`${error.date}: ${error.message}`);

            });

          }

          setShowScheduleModal(false);

          setScheduleForm({

            dates: [""],

            timeSlots: [{ startTime: "", endTime: "" }],

            isRecurring: false,

            recurringPattern: "",

            overwriteExisting: false

          });

          fetchSchedules();

        } else {

        // Complete failure - show all errors

        console.log("Complete failure - errors:", data.errors);

        if (data.errors && data.errors.length > 0) {

          data.errors.forEach(error => {

            console.log("Error detail:", error);

            toast.error(`${error.date}: ${error.message}`);

          });

          

          // If error is about existing schedule, suggest using overwrite

          const hasExistingScheduleError = data.errors.some(error => 

            error.message.includes("Schedule already exists")

          );

          

          if (hasExistingScheduleError) {

            toast("Tip: Check 'Overwrite existing schedules' to replace existing schedules");

          }

        } else {

          toast.error(data.message || "Failed to create schedule");

        }

      }

      }

    } catch (err) {

      console.error("Error creating schedule:", err);

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



  const clearExistingSchedule = async () => {

    try {

      const selectedDate = scheduleForm.dates[0];

      if (!selectedDate) {

        toast.error("Please select a date first");

        return;

      }



      // Find existing schedule for this date

      const existingSchedule = schedules.find(s => 

        new Date(s.date).toDateString() === new Date(selectedDate).toDateString()

      );



      if (!existingSchedule) {

        toast.error("No existing schedule found for this date");

        return;

      }



      const res = await fetch(`http://localhost:5000/api/doctor-schedule/${existingSchedule._id}`, {

        method: "DELETE",

        headers: { Authorization: `Bearer ${token}` }

      });

      

      const data = await res.json();

      if (data.success) {

        toast.success("Existing schedule cleared successfully");

        fetchSchedules();

      } else {

        toast.error(data.message || "Failed to clear existing schedule");

      }

    } catch (err) {

      toast.error("Failed to clear existing schedule");

    }

  };



  const addTimeSlot = () => {

    if (scheduleForm.timeSlots.length < 5) {

      setScheduleForm({

        ...scheduleForm,

        timeSlots: [...scheduleForm.timeSlots, { startTime: "", endTime: "" }]

      });

    } else {

      toast.error("Maximum 5 time slots allowed per day");

    }

  };



  const removeTimeSlot = (index) => {

    setScheduleForm({

      ...scheduleForm,

      timeSlots: scheduleForm.timeSlots.filter((_, i) => i !== index)

    });

  };



  const addScheduleDate = () => {

    if (scheduleForm.dates.length < 5) {

      setScheduleForm({

        ...scheduleForm,

        dates: [...scheduleForm.dates, ""]

      });

    }

  };



  const removeScheduleDate = (index) => {

    if (scheduleForm.dates.length > 1) {

      setScheduleForm({

        ...scheduleForm,

        dates: scheduleForm.dates.filter((_, i) => i !== index)

      });

    }

  };



  const updateScheduleDate = (index, value) => {

    const newDates = [...scheduleForm.dates];

    newDates[index] = value;

    setScheduleForm({

      ...scheduleForm,

      dates: newDates

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



  // Helper functions for prescription management

  const addMedication = () => {

    setPrescriptionData({

      ...prescriptionData,

      medications: [...prescriptionData.medications, { 

        name: "", 

        dosage: "", 

        frequency: "", 

        duration: "", 

        instructions: "", 

        quantity: "" 

      }]

    });

  };



  const removeMedication = (index) => {

    const newMedications = prescriptionData.medications.filter((_, i) => i !== index);

    setPrescriptionData({

      ...prescriptionData,

      medications: newMedications

    });

  };



  const updateMedication = (index, field, value) => {

    const newMedications = [...prescriptionData.medications];

    newMedications[index][field] = value;

    setPrescriptionData({

      ...prescriptionData,

      medications: newMedications

    });

  };



  const handleCreatePrescription = async () => {

    // Validate medications

    const validMedications = prescriptionData.medications.filter(med => 

      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()

    );



    if (validMedications.length === 0) {

      toast.error("Please add at least one complete medication");

      return;

    }



    if (!prescriptionData.diagnosis.trim()) {

      toast.error("Please enter diagnosis");

      return;

    }



    try {

      const res = await fetch("http://localhost:5000/api/prescriptions", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`

        },

        body: JSON.stringify({

          patientId: selectedAppointment.patientId._id,

          appointmentId: selectedAppointment._id,

          medications: validMedications,

          diagnosis: prescriptionData.diagnosis,

          symptoms: prescriptionData.symptoms,

          allergies: prescriptionData.allergies,

          refills: prescriptionData.refills,

          notes: prescriptionData.notes

        })

      });



      const data = await res.json();

      if (data.success) {

        toast.success("Prescription created successfully");

        setShowPrescriptionModal(false);

        setPrescriptionData({

          medications: [{

            name: "",

            dosage: "",

            frequency: "",

            duration: "",

            instructions: "",

            quantity: ""

          }],

          diagnosis: "",

          symptoms: "",

          allergies: "",

          refills: 0,

          notes: ""

        });

        setSelectedAppointment(null);

        fetchAppointments();

      } else {

        toast.error(data.message || "Failed to create prescription");

      }

    } catch (err) {

      toast.error("Failed to create prescription");

    }

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

                                        setShowPrescriptionModal(true);

                                      }}

                                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-all"

                                    >

                                      Write Prescription

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

                  <div className="bg-white border border-gray-200 rounded-lg p-8 w-full">

                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                      {/* Profile Picture */}

                      <div className="flex-shrink-0 lg:w-80">

                        {profile.picture ? (

                          <img

                            src={profile.picture}

                            alt={profile.name}

                            className="w-48 h-48 rounded-full object-cover border-4 border-[#1E88E5] flex-shrink-0 mx-auto"

                            onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=47"}

                          />

                        ) : (

                          <div className="w-48 h-48 rounded-full bg-gray-200 border-4 border-[#1E88E5] flex items-center justify-center mx-auto">

                            <User className="w-20 h-20 text-gray-400" />

                          </div>

                        )}

                      </div>



                      {/* Profile Information - Takes all remaining space */}

                      <div className="flex-1 w-full min-w-0 space-y-6">

                        {editingProfile ? (

                          <>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>

                                <input

                                  type="text"

                                  value={editForm.name}

                                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>

                                <input

                                  type="email"

                                  value={editForm.email}

                                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>

                                <input

                                  type="tel"

                                  value={editForm.phone}

                                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>

                                <input

                                  type="text"

                                  value={editForm.specialization}

                                  onChange={(e) => setEditForm({...editForm, specialization: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>

                                <input

                                  type="number"

                                  value={editForm.experience}

                                  onChange={(e) => setEditForm({...editForm, experience: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee (Rs.)</label>

                                <input

                                  type="number"

                                  value={editForm.consultationFee}

                                  onChange={(e) => setEditForm({...editForm, consultationFee: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>

                                <input

                                  type="text"

                                  value={editForm.qualification}

                                  onChange={(e) => setEditForm({...editForm, qualification: e.target.value})}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                              <div className="md:col-span-2">

                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>

                                <textarea

                                  value={editForm.bio}

                                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}

                                  rows={4}

                                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"

                                />

                              </div>

                            </div>

                          </>

                        ) : (

                          <>

                            <div>

                              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>

                              <p className="text-base font-medium text-gray-900">Dr. {profile.name || "Not provided"}</p>

                            </div>



                            <div>

                              <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>

                              <p className="text-base text-gray-700">{profile.email || "Not provided"}</p>

                            </div>

                              <div>

                              <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>

                              <p className="text-base text-gray-700">{profile.phone || "Not provided"}</p>

                            </div>



                            {profile.specialization && (

                              <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">Specialization</label>

                                <p className="text-base text-gray-700">{profile.specialization}</p>

                              </div>

                            )}



                            {profile.experience && (

                              <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">Experience</label>

                                <p className="text-base text-gray-700">{profile.experience} years</p>

                              </div>

                            )}



                            {profile.qualification && (

                              <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">Qualification</label>

                                <p className="text-base text-gray-700">{profile.qualification}</p>

                              </div>

                            )}



                            {profile.consultationFee && (

                              <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">Consultation Fee</label>

                                <p className="text-base text-gray-700">Rs. {profile.consultationFee}</p>

                              </div>

                            )}



                            {profile.bio && (

                              <div>

                                <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>

                                <p className="text-base text-gray-700">{profile.bio}</p>

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



      {/* Prescription Creation Modal */}

      {showPrescriptionModal && selectedAppointment && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">

              <div className="flex justify-between items-center">

                <h2 className="text-2xl font-bold flex items-center gap-2">

                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">

                    <span className="text-lg">📋</span>

                  </div>

                  Medical Prescription

                </h2>

                <button onClick={() => setShowPrescriptionModal(false)}>

                  <X className="w-6 h-6 text-white hover:bg-white/20 rounded-full p-1" />

                </button>

              </div>

              <div className="mt-2 text-sm text-blue-100">

                Patient: <strong className="text-white">{selectedAppointment.patientId?.name}</strong> | 

                Date: <strong className="text-white">{selectedAppointment.date}</strong> at <strong className="text-white">{selectedAppointment.time}</strong>

              </div>

            </div>



            <div className="p-6 space-y-6">

              {/* Patient Information */}

              <div className="bg-white rounded-xl p-4 border border-blue-200">

                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">

                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">

                    <span className="text-sm">👤</span>

                  </div>

                  Patient Information

                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-blue-700 mb-2">Diagnosis</label>

                    <textarea

                      value={prescriptionData.diagnosis}

                      onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}

                      rows={2}

                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-blue-50"

                      placeholder="Primary diagnosis..."

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-blue-700 mb-2">Symptoms</label>

                    <textarea

                      value={prescriptionData.symptoms}

                      onChange={(e) => setPrescriptionData({...prescriptionData, symptoms: e.target.value})}

                      rows={2}

                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-blue-50"

                      placeholder="Patient symptoms..."

                    />

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-medium text-blue-700 mb-2">Allergies</label>

                  <input

                    type="text"

                    value={prescriptionData.allergies}

                    onChange={(e) => setPrescriptionData({...prescriptionData, allergies: e.target.value})}

                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-blue-50"

                    placeholder="Known allergies..."

                  />

                </div>

              </div>



              {/* Medications Section */}

              <div className="bg-white rounded-xl p-4 border border-indigo-200">

                <div className="flex justify-between items-center mb-4">

                  <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">

                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">

                      <span className="text-sm">💊</span>

                    </div>

                    Medications

                  </h3>

                  <button

                    onClick={addMedication}

                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"

                  >

                    <Plus className="w-4 h-4" />

                    Add Medication

                  </button>

                </div>



                <div className="space-y-4">

                  {prescriptionData.medications.map((med, index) => (

                    <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">

                      <div className="flex justify-between items-start mb-3">

                        <h4 className="font-semibold text-indigo-900">Medication #{index + 1}</h4>

                        {prescriptionData.medications.length > 1 && (

                          <button

                            onClick={() => removeMedication(index)}

                            className="text-red-500 hover:text-red-700 transition-colors"

                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        )}

                      </div>

                      



                      <div className="grid grid-cols-2 gap-3">

                        <div>

                          <label className="block text-sm font-medium text-indigo-700 mb-1">Medication Name</label>

                          <input

                            type="text"

                            value={med.name}

                            onChange={(e) => updateMedication(index, 'name', e.target.value)}

                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none bg-white"

                            placeholder="e.g., Amoxicillin"

                          />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-indigo-700 mb-1">Dosage</label>

                          <input

                            type="text"

                            value={med.dosage}

                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}

                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none bg-white"

                            placeholder="e.g., 500mg"

                          />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-indigo-700 mb-1">Frequency</label>

                          <input

                            type="text"

                            value={med.frequency}

                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}

                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none bg-white"

                            placeholder="e.g., 3 times daily"

                          />

                        </div>

                        <div>

                          <label className="block text-sm font-medium text-indigo-700 mb-1">Duration</label>

                          <input

                            type="text"

                            value={med.duration}

                            onChange={(e) => updateMedication(index, 'duration', e.target.value)}

                          />

                        </div>

                        <div className="col-span-2">

                          <label className="block text-sm font-medium text-indigo-700 mb-1">Special Instructions</label>

                          <textarea

                            value={med.instructions}

                            onChange={(e) => updateMedication(index, 'instructions', e.target.value)}

                            rows={2}

                            className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none bg-white"

                            placeholder="Take with food, avoid alcohol..."

                          />

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>



              {/* Additional Information */}

              <div className="bg-white rounded-xl p-4 border border-purple-200">

                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">

                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">

                    <span className="text-sm">📝</span>

                  </div>

                  Additional Information

                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-purple-700 mb-2">Refills</label>

                    <input

                      type="number"

                      value={prescriptionData.refills}

                      onChange={(e) => setPrescriptionData({...prescriptionData, refills: parseInt(e.target.value) || 0})}

                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none bg-purple-50"

                      placeholder="Number of refills..."

                      min="0"

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-purple-700 mb-2">Additional Notes</label>

                    <textarea

                      value={prescriptionData.notes}

                      onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}

                      rows={3}

                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none bg-purple-50"

                      placeholder="Additional prescription notes..."

                    />

                  </div>

                </div>

              </div>

            </div>



            <div className="sticky bottom-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-b-3xl">

              <div className="flex gap-3">

                <button

                  onClick={handleCreatePrescription}

                  disabled={prescriptionData.medications.filter(med => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()).length === 0 || !prescriptionData.diagnosis.trim()}

                  className="flex-1 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"

                >

                  <div className="flex items-center justify-center gap-2">

                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">

                      <span className="text-white text-sm">📋</span>

                    </div>

                    Create Prescription

                  </div>

                </button>

                <button

                  onClick={() => setShowPrescriptionModal(false)}

                  className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors"

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

              {/* Schedule Type Selection */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">

                  Schedule Type

                </label>

                <div className="flex gap-4">

                  <label className="flex items-center">

                    <input

                      type="radio"

                      name="scheduleType"

                      checked={!scheduleForm.isRecurring}

                      onChange={() => setScheduleForm({...scheduleForm, isRecurring: false})}

                      className="mr-2"

                    />

                    <span>Single Day</span>

                  </label>

                  <label className="flex items-center">

                    <input

                      type="radio"

                      name="scheduleType"

                      checked={scheduleForm.isRecurring}

                      onChange={() => setScheduleForm({...scheduleForm, isRecurring: true})}

                      className="mr-2"

                    />

                    <span>Weekly Recurring</span>

                  </label>

                </div>

              </div>



              {/* Date Selection - Single Date Focus */}

              {!scheduleForm.isRecurring && (

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Select Date for Availability

                  </label>

                  <div className="flex gap-3">

                    <input

                      type="date"

                      value={scheduleForm.dates[0] || ""}

                      onChange={(e) => updateScheduleDate(0, e.target.value)}

                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"

                      min={new Date().toISOString().split('T')[0]}

                    />

                    <button

                      onClick={clearExistingSchedule}

                      className="px-4 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"

                    >

                      Clear Existing

                    </button>

                  </div>

                  <p className="text-xs text-gray-500 mt-1">

                    Select a date and add up to 5 different time slots for that day. Use "Clear Existing" to remove any existing schedule for that date.

                  </p>

                </div>

              )}



              {/* Day Selection for Recurring Schedule */}

              {scheduleForm.isRecurring && (

                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-2">

                    Select Days of Week

                  </label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (

                      <label key={day} className="flex items-center">

                        <input

                          type="checkbox"

                          checked={scheduleForm.selectedDays.includes(day)}

                          onChange={(e) => {

                            if (e.target.checked) {

                              setScheduleForm({...scheduleForm, selectedDays: [...scheduleForm.selectedDays, day]});

                            } else {

                              setScheduleForm({...scheduleForm, selectedDays: scheduleForm.selectedDays.filter(d => d !== day)});

                            }

                          }}

                          className="mr-2"

                        />

                        <span className="text-sm">{day}</span>

                      </label>

                    ))}

                  </div>

                  <p className="text-xs text-gray-500 mt-1">

                    Select days of the week when you want to be available. Time slots will apply to all selected days.

                  </p>

                </div>

              )}



              {/* Time Slots */}

              <div>

                <div className="flex justify-between items-center mb-2">

                  <label className="block text-sm font-medium text-gray-700">

                    Time Slots (Add up to 5 time slots for this day)

                  </label>

                  {scheduleForm.timeSlots.length < 5 && (

                    <button

                      onClick={addTimeSlot}

                      className="px-3 py-1 bg-[#0F9D76] text-white rounded-lg text-sm font-medium hover:bg-[#0E8A6A] transition-all"

                    >

                      Add Time Slot ({scheduleForm.timeSlots.length}/5)

                    </button>

                  )}

                </div>

                

                <div className="space-y-3">

                  {scheduleForm.timeSlots.map((slot, index) => (

                    <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">

                      <div className="flex-1">

                        <label className="block text-xs text-gray-600 mb-1">Start Time</label>

                        <input

                          type="time"

                          value={slot.startTime}

                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}

                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"

                          placeholder="Start Time"

                        />

                      </div>

                      <span className="text-gray-500 self-center">to</span>

                      <div className="flex-1">

                        <label className="block text-xs text-gray-600 mb-1">End Time</label>

                        <input

                          type="time"

                          value={slot.endTime}

                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}

                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"

                          placeholder="End Time"

                        />

                      </div>

                      {scheduleForm.timeSlots.length > 1 && (

                        <button

                          onClick={() => removeTimeSlot(index)}

                          className="p-2 text-red-500 hover:text-red-700 self-center"

                        >

                          <X className="w-4 h-4" />

                        </button>

                      )}

                    </div>

                  ))}

                </div>

                

                {scheduleForm.timeSlots.length >= 5 && (

                  <p className="text-sm text-gray-500 mt-2">

                    Maximum 5 time slots reached for this day

                  </p>

                )}

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



              {/* Overwrite Existing Option */}

              <div>

                <label className="flex items-center gap-2">

                  <input

                    type="checkbox"

                    checked={scheduleForm.overwriteExisting || false}

                    onChange={(e) => setScheduleForm({...scheduleForm, overwriteExisting: e.target.checked})}

                    className="rounded border-gray-300 text-[#0F9D76] focus:ring-[#0F9D76]"

                  />

                  <span className="text-sm font-medium text-gray-700">Overwrite existing schedules</span>

                </label>

                <p className="text-xs text-gray-500 mt-1">

                  Replace existing schedules for the selected dates (only if no appointments are booked)

                </p>

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

