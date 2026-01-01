import React, { useState } from "react";

const BookAppointment = () => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Appointment booked on ${date}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Book Appointment</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow max-w-md"
      >
        <label className="block mb-2 text-sm font-medium">
          Select Date
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Book
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;
