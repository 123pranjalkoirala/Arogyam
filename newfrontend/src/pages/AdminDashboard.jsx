// src/pages/AdminDashboard.jsx
import { useEffect } from "react";

export default function AdminDashboard() {
  useEffect(() => { document.title = "Admin Dashboard • AROGYAM"; }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary to-gray-900 text-white pt-28">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <p className="mt-3 opacity-80">Manage doctors, users, and system settings.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-semibold">Users</h3>
            </div>
            <div className="p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-semibold">Doctors</h3>
            </div>
            <div className="p-6 bg-white/5 rounded-xl">
              <h3 className="text-xl font-semibold">Appointments</h3>
            </div>
          </div>
        </div>

        <div className="text-center py-20">
          <h2 className="text-2xl mt-10">System Overview</h2>
          <p className="text-lg mt-4 opacity-80">Developed by Pranjal Babu Koirala • 2407642</p>
        </div>
      </div>
    </div>
  );
}
