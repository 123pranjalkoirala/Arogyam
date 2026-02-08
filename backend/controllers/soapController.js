// SOAP Controller - Professional Medical Documentation System
import SOAP from "../models/soapNote.js";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";

// Create new SOAP note - Simplified and Working Version
export const createSOAPNote = async (req, res) => {
  try {
    const { appointmentId, subjective, objective, assessment, plan } = req.body;
    const user = req.user;
    
    console.log("=== SOAP CREATE START ===");
    console.log("User:", user?.name, "Role:", user?.role);
    console.log("Appointment ID:", appointmentId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    // Get appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId', 'name email')
      .populate('patientId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    
    console.log("Appointment found:", appointment._id, "Current status:", appointment.status);
    
    // Check authorization
    if (user.role === 'doctor' && appointment.doctorId._id.toString() !== user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    // Force update appointment to completed status
    console.log("=== UPDATING APPOINTMENT STATUS ===");
    await Appointment.findByIdAndUpdate(appointmentId, { 
      status: 'completed',
      completedAt: new Date()
    });
    console.log("Appointment marked as completed");
    
    // Create or update SOAP note
    const soapData = {
      appointmentId,
      doctorId: appointment.doctorId._id,
      patientId: appointment.patientId._id,
      subjective,
      objective,
      assessment,
      plan,
      createdBy: user.id,
      createdAt: new Date()
    };
    
    const soapNote = await SOAP.findOneAndUpdate(
      { appointmentId },
      soapData,
      { upsert: true, new: true, runValidators: true }
    );
    
    console.log("SOAP note saved:", soapNote._id);
    
    // Send notification
    if (user.role === 'doctor') {
      await Notification.create({
        userId: appointment.patientId._id,
        title: "Medical Notes Available",
        message: `Dr. ${user.name} has added medical notes for your appointment`,
        type: "soap_notes",
        relatedId: appointmentId,
        read: false
      });
      console.log("Notification sent to patient");
    }
    
    console.log("=== SOAP CREATE SUCCESS ===");
    res.status(201).json({
      success: true,
      message: "SOAP note created successfully",
      soap: soapNote
    });
    
  } catch (error) {
    console.error("=== SOAP CREATE ERROR ===", error);
    res.status(500).json({
      success: false,
      message: "Failed to create SOAP note",
      error: error.message
    });
  }
};

// Get SOAP note by appointment ID
export const getSOAPNoteByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const user = req.user;
    
    console.log("=== SOAP GET START ===");
    console.log("Appointment ID:", appointmentId);
    console.log("User:", user?.name, "Role:", user?.role);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    console.log("=== SEARCHING FOR SOAP NOTE ===");
    const soapNote = await SOAP.findOne({ appointmentId })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');
    
    console.log("=== SOAP NOTE FOUND ===");
    console.log("SOAP Note:", soapNote);

    if (!soapNote) {
      return res.json({ 
        success: false, 
        message: "No SOAP note found for this appointment" 
      });
    }

    // Check authorization
    console.log("=== AUTHORIZATION CHECK ===");
    console.log("SOAP Patient ID:", soapNote.patientId._id.toString());
    console.log("SOAP Doctor ID:", soapNote.doctorId._id.toString());
    console.log("Current User ID:", user.id);
    console.log("Current User Role:", user.role);
    
    const isPatient = soapNote.patientId._id.toString() === user.id;
    const isDoctor = soapNote.doctorId._id.toString() === user.id;
    
    console.log("Is Patient:", isPatient);
    console.log("Is Doctor:", isDoctor);
    
    if (!isPatient && !isDoctor) {
      console.log("=== AUTHORIZATION FAILED ===");
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view this SOAP note" 
      });
    }

    console.log("=== AUTHORIZATION SUCCESS ===");
    res.json({
      success: true,
      soap: soapNote
    });
  } catch (error) {
    console.error("Error fetching SOAP note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SOAP note",
      error: error.message
    });
  }
};

// Get all SOAP notes for a doctor
export const getDoctorSOAPNotes = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const { page = 1, limit = 10, patientId } = req.query;
    const skip = (page - 1) * limit;

    const query = { doctorId: user.id };
    if (patientId) {
      query.patientId = patientId;
    }

    const soapNotes = await SOAP.find(query)
      .populate('patientId', 'name email')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SOAP.countDocuments(query);

    res.json({
      success: true,
      data: soapNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching SOAP notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SOAP notes",
      error: error.message
    });
  }
};

// Get all SOAP notes for a patient
export const getPatientSOAPNotes = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const soapNotes = await SOAP.find({ patientId: user.id })
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SOAP.countDocuments({ patientId: user.id });

    res.json({
      success: true,
      data: soapNotes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching SOAP notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SOAP notes",
      error: error.message
    });
  }
};

// Update SOAP note
export const updateSOAPNote = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAP.findById(id);
    if (!soapNote) {
      return res.status(404).json({ 
        success: false, 
        message: "SOAP note not found" 
      });
    }

    // Check authorization
    if (soapNote.doctorId.toString() !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to update this SOAP note" 
      });
    }

    // Don't allow updates if already signed
    if (soapNote.status === 'signed') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot update signed SOAP note" 
      });
    }

    // Update SOAP note
    const updatedSOAPNote = await SOAP.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "SOAP note updated successfully",
      data: updatedSOAPNote
    });
  } catch (error) {
    console.error("Error updating SOAP note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update SOAP note",
      error: error.message
    });
  }
};

// Sign SOAP note (final authorization)
export const signSOAPNote = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAP.findById(id);
    if (!soapNote) {
      return res.status(404).json({ 
        success: false, 
        message: "SOAP note not found" 
      });
    }

    // Check authorization
    if (soapNote.doctorId.toString() !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to sign this SOAP note" 
      });
    }

    // Sign the SOAP note
    const signedSOAPNote = await SOAP.findByIdAndUpdate(
      id,
      {
        status: 'signed',
        doctorSignature: {
          timestamp: new Date(),
          ipAddress: req.ip
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "SOAP note signed successfully",
      data: signedSOAPNote
    });
  } catch (error) {
    console.error("Error signing SOAP note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sign SOAP note",
      error: error.message
    });
  }
};

// Delete SOAP note
export const deleteSOAPNote = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAP.findById(id);
    if (!soapNote) {
      return res.status(404).json({ 
        success: false, 
        message: "SOAP note not found" 
      });
    }

    // Check authorization
    if (soapNote.doctorId.toString() !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to delete this SOAP note" 
      });
    }

    // Don't allow deletion if already signed
    if (soapNote.status === 'signed') {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete signed SOAP note" 
      });
    }

    await SOAP.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "SOAP note deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting SOAP note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete SOAP note",
      error: error.message
    });
  }
};
