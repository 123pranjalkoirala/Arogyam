// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // store role (mock) and notify navbar
      localStorage.setItem("role", role);
      window.dispatchEvent(new Event("roleChanged")); // important for immediate update
      toast.success(`Logged in as ${role}`);
      setLoading(false);
      navigate(`/${role}`);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#E9F7EF] flex items-center justify-center p-6 relative">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-12 -z-10"
        style={{ backgroundImage:
          "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1350&q=80')"
        }}
      />

      <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-green-200/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png" alt="logo" className="h-12 w-12" />
            <div>
              <div className="text-xl font-bold text-[#0F9D76]">AROGYAM</div>
              <div className="text-xs text-gray-500">Doctor Appointment System</div>
            </div>
          </div>

          <button onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2E8B57] to-[#3FA46A] text-white text-sm">
            ← Back
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#1E5631]">Welcome Back</h1>
          <p className="text-gray-600 mt-1">Sign in to continue to AROGYAM</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#3FA46A] focus:ring-2 focus:ring-[#3FA46A]/30 outline-none" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#3FA46A] focus:ring-2 focus:ring-[#3FA46A]/30 outline-none" />

          <div className="flex items-center justify-between gap-4">
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="p-3 rounded-xl border border-gray-200 outline-none">
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" disabled={loading}
              className="ml-auto px-6 py-3 rounded-2xl text-white bg-gradient-to-r from-[#2E8B57] to-[#3FA46A] font-semibold shadow-md hover:scale-[1.02] transition">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account? <button onClick={() => navigate("/register")} className="text-[#2E8B57] font-semibold">Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
}
