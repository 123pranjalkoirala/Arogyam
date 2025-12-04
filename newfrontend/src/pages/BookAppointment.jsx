import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const doctors = [
  { id: 1, name: "Dr. Sponge Raj", spec: "Cardiologist", img: "https://i.ibb.co/9hVw9HY/sponge-doctor-1.png" },
  { id: 2, name: "Dr. Sponge Maya", spec: "Neurologist", img: "https://i.ibb.co/3hK6X7k/sponge-doctor-2.png" },
  { id: 3, name: "Dr. Sponge Kiran", spec: "Pediatrician", img: "https://i.ibb.co/7QV5X9v/sponge-doctor-3.png" },
  { id: 4, name: "Dr. Sponge Sita", spec: "Dermatologist", img: "https://i.ibb.co/4pY6Z8W/sponge-doctor-4.png" },
]

export default function BookAppointment() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-6xl font-bold text-center text-primary mb-16">Choose Your Doctor</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {doctors.map(doc => (
              <div key={doc.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden transform hover:scale-110 transition duration-300 cursor-pointer">
                <img src={doc.img} alt={doc.name} className="w-full h-64 object-cover" />
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">{doc.name}</h3>
                  <p className="text-xl text-primary mt-2">{doc.spec}</p>
                  <button className="mt-6 bg-primary text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-accent transition shadow-lg">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}