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

  //  Admin login 
  const handleAdminLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@arogyam.local",
          password: "admin123",
          role: "admin",
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);

        window.dispatchEvent(new Event("roleChanged"));
        window.dispatchEvent(new Event("tokenChanged"));

        toast.success("Admin access granted!");
        navigate("/admin");
      } else {
        toast.error("Admin account not found. Please create admin account first.");
      }
    } catch (err) {
      toast.error("Failed to access admin");
    }
  };

  // 🔐 Secret admin access by typing "admin pranjal"
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      const currentInput = secretInput + e.key.toLowerCase();
      const newInput = currentInput.slice(-20);
      setSecretInput(newInput);

      if (newInput.includes("admin pranjal")) {
        handleAdminLogin();
        setSecretInput("");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [secretInput, handleAdminLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill all fields");

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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
              className="h-12 w-12"
              alt="AROGYAM"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to <span className="text-[#16A34A]">AROGYAM</span>
          </h1>
          <p className="text-gray-600">Your trusted healthcare companion</p>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("patient")}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  role === "patient"
                    ? "border-[#16A34A] bg-[#16A34A]/5"
                    : "border-gray-200"
                }`}
              >
                <User className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Patient</div>
              </button>

              <button
                onClick={() => setRole("doctor")}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  role === "doctor"
                    ? "border-[#16A34A] bg-[#16A34A]/5"
                    : "border-gray-200"
                }`}
              >
                <Stethoscope className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Doctor</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="flex justify-center my-6">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => toast.error("Google sign-in error")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
