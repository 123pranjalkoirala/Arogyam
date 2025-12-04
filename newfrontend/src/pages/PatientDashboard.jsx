// src/pages/PatientDashboard.jsx
import { useNavigate } from "react-router-dom"
import { QRCodeSVG } from "qrcode.react"

export default function PatientDashboard() {
  const navigate = useNavigate()
  const patientName = "Pranjal Babu Koirala"

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg to-primary/10 pt-24">
      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* Welcome Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12 text-center border-4 border-primary">
        
          <h1 className="text-6xl font-bold text-primary mb-4">Welcome Back aru kam bistarai hai,</h1>
          <h2 className="text-5xl font-black text-gray-800">{patientName}</h2>
          <p className="text-2xl text-gray-600 mt-4">Patient • AROGYAM Healthcare System</p>
        </div>
        </div>

        

           
            
 

        {/* Footer Credit */}
        <div className="text-center mt-20 text-gray-600">
          <p className="text-xl">Final Year Project by <strong>Pranjal Babu Koirala • 2407642</strong></p>
          <p className="text-lg mt-2">Herald College Kathmandu • L6CG8</p>
        </div>
      </div>
  )
}
  
     
  
