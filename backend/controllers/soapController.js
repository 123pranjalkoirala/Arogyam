// SOAP Controller - Professional Medical Documentation System
import SOAPNote from "../models/soapNote.js";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Get user from JWT token
const getUserFromToken = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Create new SOAP note
export const createSOAPNote = async (req, res) => {
  try {
    const { appointmentId, soapNotes } = req.body;
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    // Verify appointment exists and belongs to doctor
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }

    if (appointment.doctorId.toString() !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to create SOAP note for this appointment" 
      });
    }

    // Parse and validate SOAP data
    const soapData = {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: user.id,
      ...soapNotes,
      status: 'draft'
    };

    // Create SOAP note
    const soapNote = new SOAPNote(soapData);
    await soapNote.save();

    res.status(201).json({
      success: true,
      message: "SOAP note created successfully",
      data: soapNote
    });
  } catch (error) {
    console.error("Error creating SOAP note:", error);
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
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAPNote.findOne({ appointmentId })
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialization');

    if (!soapNote) {
      return res.status(404).json({ 
        success: false, 
        message: "SOAP note not found" 
      });
    }

    // Check authorization
    if (soapNote.patientId._id.toString() !== user.id && 
        soapNote.doctorId._id.toString() !== user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized to view this SOAP note" 
      });
    }

    res.json({
      success: true,
      data: soapNote
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
    const user = getUserFromToken(req);
    
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

    const soapNotes = await SOAPNote.find(query)
      .populate('patientId', 'name email')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SOAPNote.countDocuments(query);

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
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const soapNotes = await SOAPNote.find({ patientId: user.id })
      .populate('doctorId', 'name email specialization')
      .populate('appointmentId', 'date time')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SOAPNote.countDocuments({ patientId: user.id });

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
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAPNote.findById(id);
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
    const updatedSOAPNote = await SOAPNote.findByIdAndUpdate(
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
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAPNote.findById(id);
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
    const signedSOAPNote = await SOAPNote.findByIdAndUpdate(
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
    const user = getUserFromToken(req);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }

    const soapNote = await SOAPNote.findById(id);
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

    await SOAPNote.findByIdAndDelete(id);

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
