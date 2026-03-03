export default function PatientAppointmentCard({ appointment }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 space-y-2">
      <div className="flex justify-between">
        <h3 className="font-semibold">
          Dr. {appointment.doctorId.name}
        </h3>
        <span className={`text-sm px-3 py-1 rounded-full
          ${appointment.status === "pending" && "bg-yellow-100"}
          ${appointment.status === "approved" && "bg-green-100"}
          ${appointment.status === "rejected" && "bg-red-100"}
        `}>
          {appointment.status}
        </span>
      </div>

      <p className="text-gray-600 text-sm">
        {appointment.date} • {appointment.time}
      </p>

      <p className="text-gray-700">{appointment.reason}</p>

      {appointment.status === "approved" && (
        <a
          href={`https://meet.jit.si/AROGYAM-${appointment._id}`}
          target="_blank"
          className="inline-block mt-2 bg-primary text-white px-4 py-2 rounded"
        >
          Join Video Consultation
        </a>
      )}
    </div>
  );
}