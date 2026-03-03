// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "Admin Panel • AROGYAM";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setUsers(data.users || []);
    } catch (err) { console.error(err); }
  };

  const changeRole = async (userId, role) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) fetchUsers();
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-24 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-primary mb-6">Admin - Manage Users</h2>

          <div className="grid gap-4">
            {users.map(u => (
              <div key={u._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  <div className="text-sm text-gray-600">Role: <strong>{u.role}</strong></div>
                </div>

                <div className="flex gap-2">
                  {u.role !== "doctor" && <button onClick={() => changeRole(u._id, "doctor")} className="px-3 py-2 bg-primary text-white rounded">Make Doctor</button>}
                  {u.role !== "admin" && <button onClick={() => changeRole(u._id, "admin")} className="px-3 py-2 bg-yellow-500 text-white rounded">Make Admin</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
