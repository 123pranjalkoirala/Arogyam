// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password)
      return toast.error("Please fill all fields");

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        return toast.error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      window.dispatchEvent(new Event("roleChanged"));
      window.dispatchEvent(new Event("tokenChanged"));

      toast.success("Login successful!");
      navigate(`/${data.role}`);

    } catch (err) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: response.credential,
          role, // ✔ SEND ROLE HERE
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success)
        return toast.error(data.message || "Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userName", data.name);

      window.dispatchEvent(new Event("roleChanged"));
      window.dispatchEvent(new Event("tokenChanged"));

      toast.success("Google Login Successful!");
      navigate(`/${data.role}`);

    } catch (err) {
      toast.error("Google login error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9F7EF] to-white p-8">

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 border border-green-100">

        <div className="text-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            className="mx-auto h-16"
          />
          <h1 className="text-4xl font-extrabold text-green-700 mt-3">AROGYAM</h1>
          <p className="text-gray-500">Doctor Appointment System</p>
        </div>

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

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 rounded-xl border"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl border"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-xl shadow-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-gray-300" />
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => toast.error("Google sign-in error")} />
        </div>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} className="text-green-700 font-semibold">Create One</button>
        </p>
      </div>
    </div>
  );
}
