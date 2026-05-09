import express from "express";
import DoctorSchedule from "../models/doctorSchedule.js";
import User from "../models/user.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper function to get dates for specific day of week for next N weeks
function getDatesForDayOfWeek(dayName, weeks = 4) {
  const dayMap = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 0
  };
  
  const targetDay = dayMap[dayName];
  if (targetDay === undefined) return [];
  
  const dates = [];
  const today = new Date();
  
  for (let week = 0; week < weeks; week++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + (week * 7));
    
    // Find the next occurrence of the target day
    const currentDay = currentDate.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    currentDate.setDate(currentDate.getDate() + daysUntilTarget);
    
    // Set time to start of day
    currentDate.setHours(0, 0, 0, 0);
    
    dates.push(new Date(currentDate));
  }
  
  return dates;
}

/* =========================
   CREATE DOCTOR SCHEDULE
========================= */
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { date, dates, timeSlots, isRecurring, recurringPattern, selectedDays } = req.body;

    console.log("=== SCHEDULE CREATION REQUEST ===");
    console.log("Request body:", req.body);
    console.log("dates:", dates);
    console.log("timeSlots:", timeSlots);
    console.log("isRecurring:", isRecurring);
    console.log("selectedDays:", selectedDays);

    // Handle recurring schedules
    if (isRecurring && selectedDays && selectedDays.length > 0) {
      console.log("Creating recurring schedule for days:", selectedDays);
      
      // Create schedules for each selected day for the next 4 weeks
      const createdSchedules = [];
      const errors = [];
      
      for (const day of selectedDays) {
        try {
          // Get dates for this day of week for the next 4 weeks
          const datesForDay = getDatesForDayOfWeek(day, 4);
          
          for (const dateForDay of datesForDay) {
            const schedule = await DoctorSchedule.create({
              doctorId: req.user.id,
              date: dateForDay,
              timeSlots,
              isRecurring: true,
              recurringPattern: recurringPattern || "weekly",
              selectedDays: [day]
            });
            
            createdSchedules.push(schedule);
            console.log(`Created recurring schedule for ${day} on ${dateForDay}`);
          }
        } catch (error) {
          console.error(`Error creating recurring schedule for ${day}:`, error);
          errors.push({ day, message: error.message });
        }
      }
      
      if (createdSchedules.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "No schedules were created",
          errors 
        });
      }
      
      return res.json({ 
        success: true, 
        message: `${createdSchedules.length} recurring schedule(s) created successfully`,
        schedules: createdSchedules,
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // Handle single date schedules
    const datesToProcess = dates || (date ? [date] : []);
    
    // Filter out empty date strings
    const validDates = datesToProcess.filter(d => d && d.trim() !== "");
    
    console.log("datesToProcess:", datesToProcess);
    console.log("validDates:", validDates);

    if (!validDates || validDates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one valid date is required" 
      });
    }

    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Time slots are required" 
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

    // Create schedules for each date - ALLOW MULTIPLE SCHEDULES PER DAY
    const createdSchedules = [];
    const errors = [];

    for (const dateToProcess of validDates) {
      try {
        console.log("Processing date:", dateToProcess);
        
        // Simply create schedule without checking for existing ones
        // This allows multiple schedules for the same day
        const schedule = await DoctorSchedule.create({
          doctorId: req.user.id,
          date: new Date(dateToProcess),
          timeSlots,
          isRecurring: isRecurring || false,
          recurringPattern: recurringPattern || null
        });

        createdSchedules.push(schedule);
        console.log("Schedule created successfully for date:", dateToProcess);
      } catch (error) {
        console.error("Error creating schedule for date:", dateToProcess, error);
        errors.push({ date: dateToProcess, message: error.message });
      }
    }

    if (createdSchedules.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No schedules were created",
        errors 
      });
    }

    console.log("Final result - Created:", createdSchedules.length, "Errors:", errors.length);

    res.json({ 
      success: true, 
      message: `${createdSchedules.length} schedule(s) created successfully`,
      schedules: createdSchedules,
      errors: errors.length > 0 ? errors : undefined
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

    console.log("=== BACKEND AVAILABLE SLOTS ROUTE ===");
    console.log("Doctor ID:", doctorId);
    console.log("Date:", date);

    // Verify doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    console.log("Doctor found:", doctor.name);

    const availableSlots = await DoctorSchedule.getAvailableSlots(doctorId, date);

    console.log("=== BACKEND RESPONSE ===");
    console.log("Available slots count:", availableSlots.length);
    console.log("Available slots:", availableSlots);

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
