import express from "express";
import DoctorSchedule from "../models/doctorSchedule.js";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/* =========================
   CREATE DOCTOR SCHEDULE
========================= */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { date, timeSlots, isRecurring, recurringPattern } = req.body;

    if (!date || !timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Date and time slots are required" 
      });
    }

    // Validate time slots
    for (const slot of timeSlots) {
      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json({ 
          success: false, 
          message: "Each time slot must have start and end time" 
        });
      }
    }

    // Check if schedule already exists for this date
    const existingSchedule = await DoctorSchedule.findOne({
      doctorId: req.user.id,
      date: new Date(date),
      isActive: true
    });

    if (existingSchedule) {
      return res.status(400).json({ 
        success: false, 
        message: "Schedule already exists for this date" 
      });
    }

    const schedule = await DoctorSchedule.create({
      doctorId: req.user.id,
      date: new Date(date),
      timeSlots,
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || null
    });

    res.json({ 
      success: true, 
      message: "Schedule created successfully",
      schedule 
    });
  } catch (error) {
    console.error("Create schedule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET DOCTOR SCHEDULE
========================= */
router.get("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { date, startDate, endDate } = req.query;

    let query = { doctorId: req.user.id, isActive: true };

    if (date) {
      query.date = new Date(date);
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const schedules = await DoctorSchedule.find(query)
      .sort({ date: 1 });

    res.json({ 
      success: true, 
      schedules 
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   UPDATE DOCTOR SCHEDULE
========================= */
router.put("/:scheduleId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { scheduleId } = req.params;
    const { timeSlots, isActive } = req.body;

    const schedule = await DoctorSchedule.findOne({
      _id: scheduleId,
      doctorId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }

    // Check if any time slots are booked
    if (timeSlots) {
      const bookedSlots = schedule.timeSlots.filter(slot => 
        slot.status === "booked"
      );

      if (bookedSlots.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Cannot update schedule with booked appointments" 
        });
      }

      schedule.timeSlots = timeSlots;
    }

    if (isActive !== undefined) {
      schedule.isActive = isActive;
    }

    await schedule.save();

    res.json({ 
      success: true, 
      message: "Schedule updated successfully",
      schedule 
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   DELETE DOCTOR SCHEDULE
========================= */
router.delete("/:scheduleId", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { scheduleId } = req.params;

    const schedule = await DoctorSchedule.findOne({
      _id: scheduleId,
      doctorId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ 
        success: false, 
        message: "Schedule not found" 
      });
    }

    // Check if any time slots are booked
    const bookedSlots = schedule.timeSlots.filter(slot => 
      slot.status === "booked"
    );

    if (bookedSlots.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete schedule with booked appointments" 
      });
    }

    // Soft delete by setting isActive to false
    schedule.isActive = false;
    await schedule.save();

    res.json({ 
      success: true, 
      message: "Schedule deleted successfully" 
    });
  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   GET AVAILABLE SLOTS FOR PATIENTS
========================= */
router.get("/available/:doctorId/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    const availableSlots = await DoctorSchedule.getAvailableSlots(doctorId, date);

    res.json({ 
      success: true, 
      availableSlots,
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization
    });
  } catch (error) {
    console.error("Get available slots error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   BOOK TIME SLOT (INTERNAL USE)
========================= */
router.post("/book-slot", requireAuth, async (req, res) => {
  try {
    const { doctorId, date, startTime, appointmentId } = req.body;

    // Only allow this for internal use (from appointment booking)
    const timeSlot = await DoctorSchedule.bookTimeSlot(doctorId, date, startTime, appointmentId);

    res.json({ 
      success: true, 
      message: "Time slot booked successfully",
      timeSlot 
    });
  } catch (error) {
    console.error("Book time slot error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   RELEASE TIME SLOT (INTERNAL USE)
========================= */
router.post("/release-slot", requireAuth, async (req, res) => {
  try {
    const { doctorId, date, startTime } = req.body;

    const timeSlot = await DoctorSchedule.releaseTimeSlot(doctorId, date, startTime);

    res.json({ 
      success: true, 
      message: "Time slot released successfully",
      timeSlot 
    });
  } catch (error) {
    console.error("Release time slot error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* =========================
   COMPLETE TIME SLOT (INTERNAL USE)
========================= */
router.post("/complete-slot", requireAuth, async (req, res) => {
  try {
    const { doctorId, date, startTime } = req.body;

    const timeSlot = await DoctorSchedule.completeTimeSlot(doctorId, date, startTime);

    res.json({ 
      success: true, 
      message: "Time slot marked as completed",
      timeSlot 
    });
  } catch (error) {
    console.error("Complete time slot error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
