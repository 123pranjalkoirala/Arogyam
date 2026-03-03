import toast from "react-hot-toast";

export default function DoctorAppointmentCard({
  appointment,
  token,
  onRefresh
}) {
  const updateStatus = async (status) => {
    const res = await fetch(
      `http://localhost:5000/api/appointments/${appointment._id}/status`,
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
      onRefresh();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-3">
      <div className="flex justify-between">
        <h3 className="font-semibold text-lg">
          {appointment.patientId.name}
        </h3>
        <span className={`text-sm px-3 py-1 rounded-full
          ${appointment.status === "pending" && "bg-yellow-100"}
          ${appointment.status === "approved" && "bg-green-100"}
          ${appointment.status === "rejected" && "bg-red-100"}
        `}>
          {appointment.status}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        {appointment.date} • {appointment.time}
      </p>

      <p className="text-gray-700">{appointment.reason}</p>

      {/* Actions */}
      {appointment.status === "pending" && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus("approved")}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => updateStatus("rejected")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      )}

      {appointment.status === "approved" && (
        <div className="flex gap-4 flex-wrap">
          <a
            href={`https://meet.jit.si/AROGYAM-${appointment._id}`}
            target="_blank"
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Join Video Call
          </a>

          <input
            type="file"
            onChange={async (e) => {
              const form = new FormData();
              form.append("file", e.target.files[0]);
              form.append("patientId", appointment.patientId._id);
              form.append("appointmentId", appointment._id);
              form.append("title", "Medical Report");

              const res = await fetch("http://localhost:5000/api/reports", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form
              });

              if ((await res.json()).success)
                toast.success("Report uploaded");
            }}
          />
        </div>
      )}
    </div>
  );
}
