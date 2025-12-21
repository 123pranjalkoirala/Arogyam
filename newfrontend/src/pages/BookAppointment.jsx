import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/doctors")
      .then(res => res.json())
      .then(data => setDoctors(data.doctors || []));
  }, []);

  const book = async () => {
    if (!selectedDoctor || !date || !time)
      return toast.error("Fill all fields");

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        date,
        time,
        reason
      })
    });

    const data = await res.json();
    if (data.success) {
      toast.success("Appointment booked!");
    } else {
      toast.error("Booking failed");
    }
  };

  return (
    <div className="min-h-screen pt-28 bg-bg p-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h2 className="text-3xl font-bold mb-6 text-primary">Book Appointment</h2>

        <select
          className="w-full p-3 border rounded mb-4"
          onChange={e => setSelectedDoctor(e.target.value)}
        >
          <option value="">Select Doctor</option>
          {doctors.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <input type="date" className="w-full p-3 border rounded mb-4" onChange={e => setDate(e.target.value)} />
        <input type="time" className="w-full p-3 border rounded mb-4" onChange={e => setTime(e.target.value)} />
        <textarea placeholder="Reason" className="w-full p-3 border rounded mb-4" onChange={e => setReason(e.target.value)} />

        <button onClick={book} className="w-full bg-primary text-white py-3 rounded-lg font-bold">
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
