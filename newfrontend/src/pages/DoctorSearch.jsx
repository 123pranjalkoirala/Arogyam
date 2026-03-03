// Premium Doctor Search & Booking Page with Specialization Filter
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import { Search, Star, MapPin, Clock, Award, DollarSign, Filter, X, User, Mail, Phone, GraduationCap } from "lucide-react";

const SPECIALIZATIONS = [
  "All Specializations",
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Gynecologist",
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
  "General Surgeon"
];

export default function DoctorSearch() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDoctorDetailModal, setShowDoctorDetailModal] = useState(false);
  const [doctorRatings, setDoctorRatings] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    reason: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctors");
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors || []);
      }
    } catch (err) {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === "All Specializations" || 
                                 doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const handleViewDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorDetailModal(true);
    // Fetch ratings for this doctor
    try {
      const res = await fetch(`http://localhost:5000/api/ratings/doctor/${doctor._id}`);
      const data = await res.json();
      if (data.success) {
        setDoctorRatings(data);
      }
    } catch (err) {
      console.error("Failed to load ratings");
    }
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
    setShowDoctorDetailModal(false);
    const today = new Date();
    today.setDate(today.getDate() + 1);
    setBookingData({
      date: today.toISOString().split("T")[0],
      time: "09:00",
      reason: ""
    });
  };

  const handlePaymentAndBook = async () => {
    if (!bookingData.date || !bookingData.time) {
      toast.error("Please select date and time");
      return;
    }

    try {
      // Step 1: Initiate payment
      const paymentRes = await fetch("http://localhost:5000/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: bookingData.date,
          time: bookingData.time,
          reason: bookingData.reason
        })
      });

      const paymentData = await paymentRes.json();
      
      if (paymentData.success) {
        // Redirect to mock payment page
        window.location.href = paymentData.paymentUrl;
      } else {
        toast.error(paymentData.message || "Payment initiation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0F9D76] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] to-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
            <p className="text-gray-600 text-lg">Book an appointment with trusted healthcare professionals</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by doctor name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none text-base"
              />
            </div>
            
            {/* Specialization Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialization(spec)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSpecialization === spec
                        ? "bg-[#0F9D76] text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-[#0F9D76] hover:text-[#0F9D76]"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold text-[#0F9D76]">{filteredDoctors.length}</span> doctor{filteredDoctors.length !== 1 ? 's' : ''}
              {selectedSpecialization !== "All Specializations" && ` in ${selectedSpecialization}`}
            </p>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={doctor.picture || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&q=80"}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#0F9D76]/20"
                      onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=47"}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">Dr. {doctor.name}</h3>
                      <p className="text-[#0F9D76] font-medium text-sm mb-2">{doctor.specialization || "General Physician"}</p>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">4.8</span>
                        <span className="text-xs text-gray-500">(120 reviews)</span>
                      </div>
                    </div>
                  </div>

                  {doctor.experience && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Award className="w-4 h-4" />
                      <span>{doctor.experience} years experience</span>
                    </div>
                  )}

                  {doctor.qualification && (
                    <p className="text-sm text-gray-600 mb-3">{doctor.qualification}</p>
                  )}

                  {doctor.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doctor.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#0F9D76]" />
                      <span className="text-lg font-bold text-gray-900">
                        NPR {doctor.consultationFee || 500}
                      </span>
                      <span className="text-sm text-gray-500">/consultation</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDoctor(doctor)}
                        className="px-4 py-2.5 bg-white text-[#0F9D76] border-2 border-[#0F9D76] rounded-lg font-semibold hover:bg-[#0F9D76]/5 transition-all duration-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleBookClick(doctor)}
                        className="px-6 py-2.5 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg mb-4">No doctors found matching your criteria</p>
              <button
                onClick={() => {
                  setSelectedSpecialization("All Specializations");
                  setSearchTerm("");
                }}
                className="px-4 py-2 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor.picture || "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&q=80"}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => e.target.src = "https://i.pravatar.cc/150?img=47"}
                />
                <div>
                  <h3 className="font-bold text-lg">Dr. {selectedDoctor.name}</h3>
                  <p className="text-[#0F9D76] text-sm">{selectedDoctor.specialization}</p>
                  <p className="text-gray-600 text-sm">NPR {selectedDoctor.consultationFee || 500}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={bookingData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <input
                  type="time"
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  value={bookingData.reason}
                  onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                  rows={3}
                  placeholder="Briefly describe your concern..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none resize-none"
                />
              </div>

              <div className="pt-4 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium mb-1">Payment via eSewa</p>
                  <p className="text-xs text-blue-600">Phone: 9865121000 | Scan QR code at payment page</p>
                </div>
                <button
                  onClick={handlePaymentAndBook}
                  className="w-full py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Proceed to Payment (NPR {selectedDoctor.consultationFee || 500})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Detail Modal */}
      {showDoctorDetailModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Details</h2>
              <button
                onClick={() => {
                  setShowDoctorDetailModal(false);
                  setSelectedDoctor(null);
                  setDoctorRatings(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Doctor Header */}
              <div className="flex items-start gap-6 pb-6 border-b border-gray-200">
                <img
                  src={selectedDoctor.picture ? (selectedDoctor.picture.startsWith("http") ? selectedDoctor.picture : `http://localhost:5000${selectedDoctor.picture}`) : "https://via.placeholder.com/120"}
                  alt={selectedDoctor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#0F9D76]/20"
                  onError={(e) => e.target.src = "https://via.placeholder.com/120"}
                />
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Dr. {selectedDoctor.name}</h3>
                  <p className="text-xl text-[#0F9D76] font-semibold mb-3">{selectedDoctor.specialization || "General Physician"}</p>
                  {doctorRatings && doctorRatings.averageRating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-bold text-gray-900">{doctorRatings.averageRating.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({doctorRatings.totalRatings} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>{selectedDoctor.experience || 0} years of experience</span>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedDoctor.qualification && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#0F9D76]" />
                    Qualifications
                  </h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedDoctor.qualification}</p>
                </div>
              )}

              {/* Bio */}
              {selectedDoctor.bio && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">About</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">{selectedDoctor.bio}</p>
                </div>
              )}

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                  {selectedDoctor.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4 text-[#0F9D76]" />
                      <span>{selectedDoctor.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="bg-gradient-to-r from-[#0F9D76]/10 to-[#0d8a66]/10 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gray-900">NPR {selectedDoctor.consultationFee || 500}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowDoctorDetailModal(false);
                      handleBookClick(selectedDoctor);
                    }}
                    className="px-6 py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all shadow-md hover:shadow-lg"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>

              {/* Reviews */}
              {doctorRatings && doctorRatings.ratings && doctorRatings.ratings.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">Patient Reviews</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {doctorRatings.ratings.slice(0, 5).map((rating) => (
                      <div key={rating._id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {rating.patientId?.name || "Anonymous"}
                          </span>
                        </div>
                        {rating.review && (
                          <p className="text-sm text-gray-700">{rating.review}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
