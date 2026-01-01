// src/pages/Register.jsx - Green Theme, No Admin
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  // Hidden admin access - double click "A"
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'a' || e.key === 'A') {
        setAdminClickCount(prev => {
          if (prev === 1) {
            setRole("admin");
            toast.success("Admin mode activated");
            return 0;
          }
          return prev + 1;
        });
        setTimeout(() => setAdminClickCount(0), 1000);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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
      if (!res.ok || !data.success) return toast.error(data.message || "Google registration failed");

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

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.first || !form.last || !form.email || !form.password)
      return toast.error("Please fill all fields");
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");

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
      if (!res.ok || !data.success) return toast.error(data.message || "Registration failed");

      toast.success("Account created successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error("Server error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E9F7EF] via-white to-[#D6F6EB] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-[#0F9D76] rounded-2xl flex items-center justify-center shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-[#0F9D76]">AROGYAM</h1>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Join AROGYAM Today
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your account and start your journey towards better healthcare. Get access to verified doctors and easy appointment booking.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-[#0F9D76]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0F9D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Quick Registration</h3>
                <p className="text-sm text-gray-600">Sign up in less than 2 minutes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-[#0F9D76]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0F9D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Free to Join</h3>
                <p className="text-sm text-gray-600">No hidden fees or charges</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-[#0F9D76]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0F9D76]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Secure Account</h3>
                <p className="text-sm text-gray-600">Your information is encrypted and safe</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0F9D76] rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#0F9D76]">AROGYAM</h1>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center lg:text-left">Create Account</h2>
          <p className="text-gray-600 mb-8 text-center lg:text-left">Join AROGYAM and start your healthcare journey</p>

          {/* Role Selector - Only Patient and Doctor */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {["patient", "doctor"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                  role === r
                    ? "bg-[#0F9D76] text-white shadow-md"
                    : "text-gray-600 hover:text-[#0F9D76]"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          {role === "admin" && (
            <div className="mb-4 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">Admin mode activated (Press 'A' twice)</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={form.first}
                  onChange={(e) => update("first", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={form.last}
                  onChange={(e) => update("last", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F9D76]"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F9D76]"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#0F9D76] rounded focus:ring-[#0F9D76] mt-1"
                required
              />
              <label className="text-sm text-gray-600">
                I agree to the{" "}
                <button type="button" className="text-[#0F9D76] hover:underline">Terms of Service</button>{" "}
                and{" "}
                <button type="button" className="text-[#0F9D76] hover:underline">Privacy Policy</button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#0F9D76] text-white font-semibold text-lg shadow-lg hover:bg-[#0d8a66] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleRegister}
              onError={() => toast.error("Google registration failed")}
              theme="outline"
              size="large"
              text="signup_with"
            />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#0F9D76] font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
