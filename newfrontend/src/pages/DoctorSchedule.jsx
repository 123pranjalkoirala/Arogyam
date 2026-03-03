// src/pages/DoctorSchedule.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function DoctorSchedule() {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "Doctor Schedule • AROGYAM";
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/appointments?my=true", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAppointments(data.appointments || []);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) fetchAppointments();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-24 bg-bg">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary mb-6">Today's Appointments</h2>

          <div className="grid gap-4">
            {appointments.length === 0 && <div className="text-gray-500">No appointments.</div>}
            {appointments.map(a => (
              <div key={a._id} className="bg-white p-4 rounded-xl shadow flex justify-between">
                <div>
                  <div className="font-semibold">{a.patientId?.name ?? "Patient"}</div>
                  <div className="text-sm text-gray-600">{new Date(a.datetime).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Reason: {a.reason || "—"}</div>
                </div>

                <div className="flex flex-col gap-2">
                  {a.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(a._id, "confirmed")} className="px-3 py-2 bg-green-600 text-white rounded">Confirm</button>
                      <button onClick={() => updateStatus(a._id, "rejected")} className="px-3 py-2 bg-red-500 text-white rounded">Reject</button>
                    </>
                  )}
                  {a.status !== "pending" && <div className="text-sm text-gray-600">{a.status}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
