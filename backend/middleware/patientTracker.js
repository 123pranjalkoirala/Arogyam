// backend/middleware/patientTracker.js
import User from "../models/user.js";
import Appointment from "../models/appointment.js";

// Middleware to track patient visits and update patient status
export const trackPatientVisit = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return next();
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "patient") {
      return next();
    }

    // Check if this is a new patient (first visit)
    if (user.isNewPatient) {
      // Mark as returning patient
      await User.findByIdAndUpdate(userId, {
        isNewPatient: false,
        totalVisits: 1,
        lastVisitDate: new Date(),
        $push: {
          medicalHistory: {
            date: new Date(),
            type: "consultation",
            doctorId: req.user?.id || null,
            notes: "First visit - patient registration",
            diagnosis: "New patient consultation",
            prescription: "Initial assessment"
          }
        }
      });
      
      console.log(`Patient ${user.name} marked as returning patient`);
    } else {
      // Update existing patient
      await User.findByIdAndUpdate(userId, {
        totalVisits: user.totalVisits + 1,
        lastVisitDate: new Date(),
        $push: {
          medicalHistory: {
            date: new Date(),
            type: "consultation", 
            doctorId: req.user?.id || null,
            notes: "Follow-up consultation",
            diagnosis: "Progress assessment",
            prescription: "Continued care"
          }
        }
      });
      
      console.log(`Patient ${user.name} visit count updated to ${user.totalVisits + 1}`);
    }

    next();
  } catch (error) {
    console.error("Patient tracking error:", error);
    next();
  }
};

// Middleware to get patient history for doctors
export const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.body;
    
    if (!patientId) {
      return res.json({ success: false, message: "Patient ID required" });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.json({ success: false, message: "Patient not found" });
    }

    // Return patient history with visit count and status
    res.json({
      success: true,
      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        isNewPatient: patient.isNewPatient,
        totalVisits: patient.totalVisits,
        lastVisitDate: patient.lastVisitDate,
        medicalHistory: patient.medicalHistory || []
      },
      visitStats: {
        isReturningPatient: !patient.isNewPatient,
        isFrequentVisitor: patient.totalVisits > 3,
        daysSinceLastVisit: patient.lastVisitDate ? 
          Math.floor((new Date() - new Date(patient.lastVisitDate)) / (1000 * 60 * 60 * 24)) : null
      }
    });
  } catch (error) {
    console.error("Get patient history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
