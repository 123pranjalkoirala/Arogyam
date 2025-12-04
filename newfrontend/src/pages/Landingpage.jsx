// src/pages/LandingPage.jsx
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute -left-28 top-10 w-80 h-80 bg-[#D6F6EB] rounded-full opacity-40 filter blur-3xl" />
        <div className="absolute right-0 bottom-10 w-60 h-60 bg-[#E9F7EF] rounded-full opacity-50 filter blur-2xl" />
      </div>

      <main className="pt-28 pb-20 min-h-screen bg-gradient-to-b from-[#D6F6EB] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F9D76] leading-tight">Find trusted doctors & book appointments</h1>
              <p className="mt-4 text-lg text-gray-700 max-w-xl">AROGYAM connects you with verified doctors across Nepal. Easily book, manage appointments, and access your health records in one place.</p>

              {/*compact search card */}
              <div className="mt-8 bg-white p-4 rounded-2xl shadow-md">
                <form onSubmit={(e) => { e.preventDefault(); navigate("/login"); }} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <input aria-label="specialty" placeholder="Search doctors, specialties...." className="col-span-2 p-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#3FA46A]/30" />
                  <div className="flex gap-2">
                    <select className="p-3 rounded-lg border border-gray-200 outline-none">
                      <option>Location</option>
                     
                    </select>
                    <button type="submit" className="px-4 py-3 rounded-lg bg-[#0F9D76] text-white font-semibold">Find</button>
                  </div>
                </form>

                <div className="mt-3 text-sm text-gray-500"> Search by doctor name or specialty</div>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={() => navigate("/login")} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Book as Patient</button>
                <button onClick={() => navigate("/register")} className="px-4 py-2 rounded-lg bg-[#E9F7EF] text-[#1E5631] border border-[#D6F6EB]">Join as Doctor</button>
              </div>
            </div>

       <div className="flex justify-center lg:justify-end">
  <div className="w-[420px] max-w-full relative">
    <img 
      src="https://images.pexels.com/photos/8460047/pexels-photo-8460047.jpeg?auto=compress&cs=tinysrgb&w=1200"
      alt="Doctor Team"
      className="rounded-2xl shadow-2xl object-cover"
    />

    <div className="absolute left-4 top-4 bg-white/90 rounded-lg p-3 shadow">
      <div className="text-sm text-gray-600">Expert Team</div>
      <div className="text-base font-semibold text-[#0F9D76]">Certified Doctors</div>
      <div className="text-xs text-gray-500">Trusted • Professional</div>
    </div>
  </div>
</div>


          </section>

          <section id="about" className="mt-16 bg-white rounded-2xl p-10">
            <h2 className="text-3xl font-bold text-[#0F9D76]">About Arogyam</h2>
            <p className="mt-3 text-gray-700">Arogyam is a doctor appointment platform for Nepal focused on accessibility and trust. Aaru kam chai aba backned start gresi graula hai.</p>
          </section>

          <section id="contact" className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F9D76] text-white p-6 rounded-xl">
              <h3 className="text-xl font-semibold">Contact</h3>
              <p className="mt-3">Herald College Kathmandu</p>
              <p className="mt-1">Student: <strong>Pranjal Babu Koirala</strong></p>
              <p className="mt-1">Email: <strong>Pranjalkoirala02@gmail.com</strong></p>
              <p className="mt-1">Phone NO: <strong>9865121000</strong></p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-[#0F9D76]">Get involved</h3>
              <p className="mt-3 text-gray-700">Yau ak bhai sabai ko swasthe herau.</p>
            </div>
          </section>

          <footer className="mt-12">
            <div className="text-center text-sm text-gray-600">© 2025 AROGYAM • Final Year Project by Pranjal Babu Koirala (2407642)</div>
          </footer>
        </div>
      </main>
    </>
  );
}
