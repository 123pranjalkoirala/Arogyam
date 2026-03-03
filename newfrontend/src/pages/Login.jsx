// src/pages/Login.jsx - Updated for working Google Login
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("All fields required");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();

      if (data.success) {
        console.log("=== LOGIN DEBUG ===");
        console.log("Backend response:", data);
        console.log("Role from backend:", data.role);
        console.log("Name from backend:", data.name);
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);
        
        console.log("Stored in localStorage - role:", localStorage.getItem("role"));
        console.log("Navigating to:", `/${data.role}`);
        
        toast.success("Login successful!");
        navigate(`/${data.role}`);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role,
        }),
      });
      const data = await res.json();

      if (data.success) {
        console.log("=== GOOGLE LOGIN DEBUG ===");
        console.log("Backend response:", data);
        console.log("Role from backend:", data.role);
        console.log("Name from backend:", data.name);
        
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);
        
        console.log("Stored in localStorage - role:", localStorage.getItem("role"));
        console.log("Navigating to:", `/${data.role}`);
        
        toast.success("Google login successful!");
        navigate(`/${data.role}`);
      } else {
        toast.error(data.message || "Google login failed");
      }
    } catch (err) {
      toast.error("Google login error");
    }
  };

  // Hidden admin access - detect "admin pranjal" being typed
  useEffect(() => {
    let typedKeys = [];
    
    const handleKeyDown = (e) => {
      if (e.key && typeof e.key === 'string') {
        typedKeys.push(e.key.toLowerCase());
      }
      
      // Keep only last 15 characters to check for "admin pranjal"
      if (typedKeys.length > 15) {
        typedKeys = typedKeys.slice(-15);
      }
      
      const typedString = typedKeys.join('');
      if (typedString.includes('admin pranjal')) {
        // Grant admin access
        localStorage.setItem("token", "admin-access-key-pranjal");
        localStorage.setItem("role", "admin");
        localStorage.setItem("userName", "Admin Pranjal");
        toast.success("Admin access granted!");
        navigate("/admin");
        typedKeys = []; // Clear typed keys
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your AROGYAM account</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setRole("patient")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              role === "patient"
                ? "bg-[#0F9D76] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Patient
          </button>
          <button
            onClick={() => setRole("doctor")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              role === "doctor"
                ? "bg-[#0F9D76] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Stethoscope className="w-5 h-5 inline mr-2" />
            Doctor
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F9D76] outline-none pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F9D76] text-white rounded-lg font-semibold hover:bg-[#0d8a66] transition-all disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">or</div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => toast.error("Google sign-in failed")}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
            logo_alignment="left"
          />
        </div>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-[#0F9D76] font-semibold hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}