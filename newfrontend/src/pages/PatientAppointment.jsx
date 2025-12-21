// src/pages/PatientAppointments.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PatientAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName") || "You";

  useEffect(() => {
    document.title = "My Appointments • AROGYAM";
    fetchDoctors();
    fetchMyAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/doctors");
      const data = await res.json();
      if (data.success) setDoctors(data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const role = localStorage.getItem("role");
      // get user id from token? for now backend supports query by role/userId - here we ask server with token
      const res = await fetch("http://localhost:5000/api/appointments?my=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return alert("Please fill required fields");
    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor,
          datetime: new Date(`${date}T${time}`),
          reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Appointment requested");
        setReason("");
        fetchMyAppointments();
      } else alert(data.message || "Failed");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg pt-28 pb-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-primary mb-2">Hello, {userName}</h2>
            <p className="text-gray-600 mb-6">Book a new appointment or view your upcoming ones.</p>

            <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <select
                className="p-3 rounded-xl border"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
              >
                <option value="">Choose Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.speciality || d.role}</option>)}
              </select>

              <input type="date" className="p-3 rounded-xl border" value={date} onChange={e => setDate(e.target.value)} required />
              <input type="time" className="p-3 rounded-xl border" value={time} onChange={e => setTime(e.target.value)} required />

              <textarea placeholder="Reason (optional)" className="col-span-1 md:col-span-3 p-3 rounded-xl border" value={reason} onChange={e => setReason(e.target.value)} />

              <button className="col-span-1 md:col-span-3 bg-primary text-white py-3 rounded-xl font-bold" type="submit">Request Appointment</button>
            </form>
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">My Appointments</h3>
            <div className="grid gap-4">
              {appointments.length === 0 && <div className="text-gray-500">No appointments yet.</div>}
              {appointments.map(a => (
                <div key={a._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                  <div>
                    <div className="font-bold">{a.doctorId?.name ?? "Doctor"}</div>
                    <div className="text-sm text-gray-600">{new Date(a.datetime).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Status: <strong>{a.status}</strong></div>
                    {a.reason && <div className="text-sm mt-1">Reason: {a.reason}</div>}
                  </div>
                  <div>
                    {a.status === "pending" && <div className="text-sm text-gray-500">Awaiting confirmation</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
