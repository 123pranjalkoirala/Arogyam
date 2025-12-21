// src/components/Navbar.jsx
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
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-lg shadow-md z-50">
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
            <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
              <button onClick={() => navigate("/")} className="hover:text-[#0F9D76]">Home</button>
              <button onClick={() => scrollTo("about")} className="hover:text-[#0F9D76]">About</button>
              <button onClick={() => scrollTo("contact")} className="hover:text-[#0F9D76]">Contact</button>

              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 rounded-lg border border-[#0F9D76] text-[#0F9D76] hover:bg-[#0F9D76] hover:text-white"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-lg bg-[#0F9D76] text-white hover:bg-[#0d8a66]"
              >
                Register
              </button>
            </div>

            <button
              className="md:hidden text-3xl"
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

            <button
              onClick={() => navigate("/book")}
              className="bg-[#0F9D76] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#0d8a66]"
            >
              Book
            </button>

            {role === "admin" && (
              <button onClick={() => navigate("/admin")} className="hover:underline">
                Admin Panel
              </button>
            )}

            <button
              onClick={() => navigate(`/${role}`)}
              className="hover:underline"
            >
              Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-[#0F9D76] text-white px-4 py-2 rounded-full font-bold hover:bg-[#0d8a66]"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu for PUBLIC NAV */}
      {!role && menuOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 flex flex-col gap-4">
          <button onClick={() => navigate("/")}>Home</button>
          <button onClick={() => scrollTo("about")}>About</button>
          <button onClick={() => scrollTo("contact")}>Contact</button>
          <button onClick={() => navigate("/login")} className="text-[#0F9D76] font-semibold">Login</button>
          <button onClick={() => navigate("/register")} className="text-[#0F9D76] font-semibold">Register</button>
        </div>
      )}
    </nav>
  );
}
