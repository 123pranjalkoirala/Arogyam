// src/pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ first: "", last: "", email: "", password: "", confirm: "", role: "patient" });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.first || !form.last || !form.email || !form.password) {
      toast.error("Please fill required fields");
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // mock register — store role
      localStorage.setItem("role", form.role);
      window.dispatchEvent(new Event("roleChanged"));
      toast.success("Account created (mock)");
      setLoading(false);
      nav(`/${form.role}`);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#E9F7EF] flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-12 -z-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1350&q=80')" }} />

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-xl w-full border border-green-200/40">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#1E5631]">Create account</h1>
          <p className="text-gray-600 mt-1">Join AROGYAM — connect with trusted doctors</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.first} onChange={e => update("first", e.target.value)} placeholder="First name" className="p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />
            <input value={form.last} onChange={e => update("last", e.target.value)} placeholder="Last name" className="p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />
          </div>

          <input value={form.email} onChange={e => update("email", e.target.value)} type="email" placeholder="Email" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />
          <input value={form.password} onChange={e => update("password", e.target.value)} type="password" placeholder="Password" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />
          <input value={form.confirm} onChange={e => update("confirm", e.target.value)} type="password" placeholder="Confirm password" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />

          <select value={form.role} onChange={e => update("role", e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none">
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} className="w-full px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-[#2E8B57] to-[#3FA46A] font-semibold shadow-md hover:scale-[1.02] transition">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-[#2E8B57] font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
