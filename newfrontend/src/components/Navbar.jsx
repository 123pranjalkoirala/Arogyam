// Enhanced Navbar with More Sections
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setRole(localStorage.getItem("role"));
      setUserName(localStorage.getItem("userName"));
    };
    window.addEventListener("roleChanged", updateData);
    window.addEventListener("tokenChanged", updateData);
    window.addEventListener("storage", updateData);

    return () => {
      window.removeEventListener("roleChanged", updateData);
      window.removeEventListener("tokenChanged", updateData);
      window.removeEventListener("storage", updateData);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("roleChanged"));
    window.dispatchEvent(new Event("tokenChanged"));
    navigate("/");
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg shadow-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/2966/2966327.png"
            className="h-10"
            alt="AROGYAM"
          />
          <h1 className="text-2xl font-extrabold text-[#0F9D76]">AROGYAM</h1>
        </div>

        {/* If NOT logged in → show PUBLIC NAV */}
        {!role && (
          <>
            <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
              <button onClick={() => navigate("/")} className="hover:text-[#0F9D76] transition-colors">Home</button>
              <button onClick={() => scrollTo("specializations")} className="hover:text-[#0F9D76] transition-colors">Specialists</button>
              <button onClick={() => scrollTo("features")} className="hover:text-[#0F9D76] transition-colors">Features</button>
              <button onClick={() => scrollTo("articles")} className="hover:text-[#0F9D76] transition-colors">Health Tips</button>
              <button onClick={() => scrollTo("quiz")} className="hover:text-[#0F9D76] transition-colors">Health Quiz</button>
              <button onClick={() => scrollTo("about")} className="hover:text-[#0F9D76] transition-colors">About</button>
              <button onClick={() => scrollTo("contact")} className="hover:text-[#0F9D76] transition-colors">Contact</button>

              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg border border-[#0F9D76] text-[#0F9D76] hover:bg-[#0F9D76] hover:text-white transition-all"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-lg bg-[#0F9D76] text-white hover:bg-[#0d8a66] transition-all"
              >
                Register
              </button>
            </div>

            <button
              className="md:hidden text-3xl text-gray-700"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </>
        )}

        {/* If logged in → DASHBOARD NAV */}
        {role && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {userName ? `Hi, ${userName}` : ""}
            </div>

            {role === "patient" && (
              <button
                onClick={() => navigate("/doctors")}
                className="bg-[#0F9D76] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#0d8a66] transition-all"
              >
                Find Doctors
              </button>
            )}

            {role === "admin" && (
              <button onClick={() => navigate("/admin")} className="hover:underline text-gray-700">
                Admin Panel
              </button>
            )}

            <button
              onClick={() => navigate(`/${role}`)}
              className="hover:underline text-gray-700"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-[#0F9D76] text-white px-4 py-2 rounded-full font-bold hover:bg-[#0d8a66] transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu for PUBLIC NAV */}
      {!role && menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 flex flex-col gap-3 border-t border-gray-100">
          <button onClick={() => {navigate("/"); setMenuOpen(false);}} className="text-left py-2">Home</button>
          <button onClick={() => {scrollTo("specializations"); setMenuOpen(false);}} className="text-left py-2">Specialists</button>
          <button onClick={() => {scrollTo("features"); setMenuOpen(false);}} className="text-left py-2">Features</button>
          <button onClick={() => {scrollTo("articles"); setMenuOpen(false);}} className="text-left py-2">Health Tips</button>
          <button onClick={() => {scrollTo("quiz"); setMenuOpen(false);}} className="text-left py-2">Health Quiz</button>
          <button onClick={() => {scrollTo("about"); setMenuOpen(false);}} className="text-left py-2">About</button>
          <button onClick={() => {scrollTo("contact"); setMenuOpen(false);}} className="text-left py-2">Contact</button>
          <div className="border-t border-gray-200 pt-3 mt-2 flex gap-3">
            <button onClick={() => {navigate("/login"); setMenuOpen(false);}} className="flex-1 px-4 py-2 border border-[#0F9D76] text-[#0F9D76] rounded-lg font-semibold">Login</button>
            <button onClick={() => {navigate("/register"); setMenuOpen(false);}} className="flex-1 px-4 py-2 bg-[#0F9D76] text-white rounded-lg font-semibold">Register</button>
          </div>
        </div>
      )}
    </nav>
  );
}
