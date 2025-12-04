// src/components/Navbar.jsx
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || null);

  useEffect(() => {
    // update on storage changes from other tabs
    const onStorage = (e) => {
      if (e.key === "role") setRole(localStorage.getItem("role") || null);
    };
    // custom event for same-tab updates
    const onRoleChanged = () => setRole(localStorage.getItem("role") || null);

    window.addEventListener("storage", onStorage);
    window.addEventListener("roleChanged", onRoleChanged);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("roleChanged", onRoleChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("role");
    // notify other listeners (same tab)
    window.dispatchEvent(new Event("roleChanged"));
    setRole(null);
    navigate("/");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/85 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
               alt="AROGYAM" className="h-10 w-10" />
          <div>
            <div className="text-lg font-bold text-[#0F9D76]">AROGYAM</div>
            <div className="text-xs text-gray-500 -mt-0.5">Healthcare • Appointments</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-6 text-sm text-gray-700">
            <Link to="/" className="hover:text-[#0F9D76] transition">Home</Link>
            <a href="#about" className="hover:text-[#0F9D76] transition">About</a>
            <a href="#contact" className="hover:text-[#0F9D76] transition">Contact</a>
          </div>

          {!role ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="hidden md:inline-block px-4 py-2 rounded-lg text-[#0F9D76] border border-[#CFF3E4] hover:bg-[#F7FFF8] transition text-sm font-semibold"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2E8B57] to-[#3FA46A] text-white text-sm font-semibold shadow-sm hover:scale-[1.02] transition"
              >
                Get Started
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">
                Signed in as <strong className="text-[#0F9D76] capitalize ml-1">{role}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-white text-[#0F9D76] rounded-full font-semibold border border-[#E6F6EE]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
