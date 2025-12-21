// src/pages/Register.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [form, setForm] = useState({
    first: "",
    last: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // =============================
  // GOOGLE REGISTER
  // =============================
  const handleGoogleRegister = async (response) => {
    if (!response?.credential) return toast.error("Google sign-up failed");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/google-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        return toast.error(data.message || "Google registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      window.dispatchEvent(new Event("roleChanged"));
      window.dispatchEvent(new Event("tokenChanged"));

      toast.success("Account created with Google!");
      navigate(`/${data.role}`);

    } catch (err) {
      toast.error("Network error");
    }

    setLoading(false);
  };

  // =============================
  // EMAIL / PASSWORD REGISTER
  // =============================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.first || !form.last || !form.email || !form.password)
      return toast.error("Please fill all fields");

    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.first} ${form.last}`,
          email: form.email,
          password: form.password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        return toast.error(data.message || "Registration failed");

      toast.success("Account created! Please login.");
      navigate("/login");

    } catch (err) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9F7EF] to-white p-8">

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">

        <div className="text-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            className="mx-auto h-16"
            alt="Logo"
          />
          <h1 className="text-4xl font-extrabold text-green-700 mt-3">Create Account</h1>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          {["patient", "doctor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${
                role === r ? "bg-green-600 text-white shadow-md scale-105" : "text-gray-600 hover:text-green-700"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="First name"
              value={form.first}
              onChange={(e) => update("first", e.target.value)}
              className="p-4 rounded-xl border"
            />

            <input
              placeholder="Last name"
              value={form.last}
              onChange={(e) => update("last", e.target.value)}
              className="p-4 rounded-xl border"
            />
          </div>

          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full p-4 rounded-xl border"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full p-4 rounded-xl border"
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            className="w-full p-4 rounded-xl border"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-xl"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-gray-300" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => toast.error("Google registration failed")}
          />
        </div>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-green-700 font-semibold">
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
