// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* NAVBAR */}
      <Navbar />

      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -left-28 top-10 w-80 h-80 bg-[#D6F6EB] rounded-full opacity-40 blur-3xl" />
        <div className="absolute right-0 bottom-10 w-60 h-60 bg-[#E9F7EF] rounded-full opacity-50 blur-2xl" />
      </div>

      <main className="pt-32 pb-20 min-h-screen bg-gradient-to-b from-[#D6F6EB] to-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* HERO */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F9D76] leading-tight">
                Find trusted doctors & book appointments
              </h1>

              <p className="mt-4 text-lg text-gray-700 max-w-xl">
                AROGYAM connects you with verified doctors across Nepal. 
                Easily book, manage appointments, and access health records.
              </p>

              {/* Search Bar */}
              <div className="mt-8 bg-white p-4 rounded-2xl shadow-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    navigate("/login");
                  }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                >
                  <input
                    placeholder="Search doctors, specialties..."
                    className="col-span-2 p-3 rounded-lg border border-gray-200"
                  />
                  <button
                    type="submit"
                    className="px-4 py-3 rounded-lg bg-[#0F9D76] text-white font-semibold"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                >
                  Book as Patient
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-4 py-2 rounded-lg bg-[#E9F7EF] text-[#1E5631]"
                >
                  Join as Doctor
                </button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="https://images.pexels.com/photos/8460047/pexels-photo-8460047.jpeg"
                className="w-[420px] rounded-2xl shadow-2xl object-cover"
              />
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="mt-16 bg-white rounded-2xl p-10 shadow">
            <h2 className="text-3xl font-bold text-[#0F9D76]">About Arogyam</h2>
            <p className="mt-3 text-gray-700">
              Arogyam is a Nepal-focused digital doctor appointment system built to improve healthcare accessibility.
            </p>
          </section>

          {/* CONTACT */}
          <section id="contact" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F9D76] text-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold">Contact</h3>
              <p className="mt-3">Herald College Kathmandu</p>
              <p className="mt-1">Student: <strong>Pranjal Babu Koirala</strong></p>
              <p className="mt-1">Email: <strong>Pranjalkoirala02@gmail.com</strong></p>
              <p className="mt-1">Phone: <strong>9865121000</strong></p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-[#0F9D76]">Get involved</h3>
              <p className="mt-3 text-gray-700">Yau ak bhai sabai ko swasthya herau.</p>
            </div>
          </section>

          <footer className="mt-12 text-center text-sm text-gray-600">
            © 2025 AROGYAM • Final Year Project by Pranjal Babu Koirala (2407642)
          </footer>

        </div>
      </main>
    </>
  );
}
