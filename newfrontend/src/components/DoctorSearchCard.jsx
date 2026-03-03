export default function DoctorSearchCard({ doctor, onSelect }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">{doctor.name}</h3>
        <p className="text-sm text-gray-600">{doctor.specialization}</p>
      </div>

      <button
        onClick={() => onSelect(doctor)}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Book
      </button>
    </div>
  );
}