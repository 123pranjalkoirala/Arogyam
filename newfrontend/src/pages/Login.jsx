// Premium Login Page
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { User, Stethoscope, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [secretInput, setSecretInput] = useState("");

  // Secret admin redirect - completely hidden
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT") return;
      
      const currentInput = secretInput + e.key.toLowerCase();
      setSecretInput(currentInput.slice(-20)); // Keep last 20 chars
      
      if (currentInput.includes("admin pranjal")) {
        // Direct redirect to admin dashboard
        navigate("/admin");
        setSecretInput("");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [secretInput, navigate]);

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
        body: JSON.stringify({ credential: response.credential, role }),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9F7EF] via-white to-[#D6F6EB] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0F9D76]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0F9D76]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0F9D76] to-[#0d8a66] rounded-2xl shadow-lg mb-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
              className="h-12 w-12"
              alt="AROGYAM"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to <span className="text-[#0F9D76]">AROGYAM</span>
          </h1>
          <p className="text-gray-600">Your trusted healthcare companion</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">
          {/* Role Selection - Premium Design */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("patient")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  role === "patient"
                    ? "border-[#0F9D76] bg-[#0F9D76]/5 shadow-md scale-105"
                    : "border-gray-200 hover:border-[#0F9D76]/50 bg-white"
                }`}
              >
                <User className={`w-6 h-6 mx-auto mb-2 ${role === "patient" ? "text-[#0F9D76]" : "text-gray-400"}`} />
                <div className={`font-semibold ${role === "patient" ? "text-[#0F9D76]" : "text-gray-600"}`}>
                  Patient
                </div>
                {role === "patient" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-[#0F9D76] rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setRole("doctor")}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                  role === "doctor"
                    ? "border-[#0F9D76] bg-[#0F9D76]/5 shadow-md scale-105"
                    : "border-gray-200 hover:border-[#0F9D76]/50 bg-white"
                }`}
              >
                <Stethoscope className={`w-6 h-6 mx-auto mb-2 ${role === "doctor" ? "text-[#0F9D76]" : "text-gray-400"}`} />
                <div className={`font-semibold ${role === "doctor" ? "text-[#0F9D76]" : "text-gray-600"}`}>
                  Doctor
                </div>
                {role === "doctor" && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-[#0F9D76] rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all bg-gray-50 focus:bg-white"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0F9D76] focus:border-[#0F9D76] outline-none transition-all bg-gray-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0F9D76] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#0F9D76] to-[#0d8a66] text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-sm text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleLogin} 
              onError={() => toast.error("Google sign-in error")}
              theme="filled_blue"
              size="large"
            />
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button 
                onClick={() => navigate("/register")} 
                className="text-[#0F9D76] font-semibold hover:underline"
              >
                Create Account
              </button>
            </p>
            {role === "doctor" && (
              <p className="text-sm text-gray-500 mt-2">
                New doctor?{" "}
                <button 
                  onClick={() => navigate("/register-doctor")} 
                  className="text-[#0F9D76] font-semibold hover:underline"
                >
                  Register as Doctor
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
