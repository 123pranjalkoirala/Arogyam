import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/appointments", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setAppointments(data.appointments);
  };

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/appointments/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      }
    );

    if ((await res.json()).success) {
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    }
  };

  return (
    <div className="min-h-screen pt-28 bg-bg p-10">
      <h1 className="text-4xl font-bold mb-6 text-primary">Appointment Requests</h1>

      {appointments.map(a => (
        <div key={a._id} className="bg-white p-5 rounded-xl shadow mb-4 flex justify-between">
          <div>
            <p className="font-bold">{a.patientId?.name}</p>
            <p>{a.date} • {a.time}</p>
            <p className="text-sm text-gray-500">{a.reason}</p>
          </div>

          <div className="flex gap-3">
            {a.status === "pending" && (
              <>
                <button onClick={() => updateStatus(a._id, "approved")} className="bg-green-500 text-white px-4 py-2 rounded">Accept</button>
                <button onClick={() => updateStatus(a._id, "rejected")} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
              </>
            )}
            {a.status !== "pending" && <span className="font-semibold">{a.status}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
