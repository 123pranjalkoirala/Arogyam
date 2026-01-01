import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/Landingpage"
import Login from "./pages/Login"
import Register from "./pages/Register"
import RegisterDoctor from "./pages/RegisterDoctor"
import PatientDashboard from "./pages/PatientDashboard"
import DoctorDashboard from "./pages/DoctorDashboard"
import AdminDashboard from "./pages/AdminDashboard"
import BookAppointment from "./pages/BookAppointment"
import DoctorSearch from "./pages/DoctorSearch"
import PaymentSuccess from "./pages/PaymentSuccess"
import Navbar from "./components/Navbar"

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-doctor" element={<RegisterDoctor />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/doctors" element={<DoctorSearch />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentSuccess />} />
      </Routes>
    </>
  )
}
