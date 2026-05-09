import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: [{
    startTime: {
      type: String, // Format: "09:00"
      required: true
    },
    endTime: {
      type: String, // Format: "09:30"
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null
    },
    status: {
      type: String,
      enum: ["available", "booked", "completed", "cancelled"],
      default: "available"
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
doctorScheduleSchema.index({ doctorId: 1, date: 1, isActive: 1 });
doctorScheduleSchema.index({ doctorId: 1, date: 1, "timeSlots.startTime": 1 });

// Pre-save middleware to update updatedAt
doctorScheduleSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get available slots for a doctor on a specific date
doctorScheduleSchema.statics.getAvailableSlots = async function(doctorId, date) {
  // Normalize the input date to start of day for consistent comparison
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log("=== GET AVAILABLE SLOTS ===");
  console.log("Doctor ID:", doctorId);
  console.log("Input Date (raw):", date);
  console.log("Target Date (parsed):", targetDate);
  console.log("Start of Day:", startOfDay);
  console.log("End of Day:", endOfDay);

  // First, let's check ALL schedules for this doctor regardless of date
  const allDoctorSchedules = await this.find({
    doctorId,
    isActive: true
  }).populate("timeSlots.appointmentId");

  console.log("=== ALL DOCTOR SCHEDULES ===");
  console.log("Total schedules for doctor:", allDoctorSchedules.length);
  allDoctorSchedules.forEach(s => {
    console.log(`Schedule ${s._id}:`, {
      date: s.date,
      dateType: typeof s.date,
      dateObj: new Date(s.date),
      timeSlots: s.timeSlots.length
    });
  });

  // Now filter by date range
  const schedules = allDoctorSchedules.filter(schedule => {
    const scheduleDate = new Date(schedule.date);
    console.log(`Comparing schedule ${schedule._id}:`, {
      scheduleDate: scheduleDate,
      startOfDay: startOfDay,
      endOfDay: endOfDay,
      inRange: scheduleDate >= startOfDay && scheduleDate <= endOfDay
    });
    return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
  });

  console.log("=== FILTERED SCHEDULES ===");
  console.log("Schedules in date range:", schedules.length);
  schedules.forEach(s => {
    console.log(`Filtered Schedule ${s._id}:`, {
      date: s.date,
      timeSlots: s.timeSlots.length
    });
  });

  if (!schedules || schedules.length === 0) return [];

  // Aggregate all available slots from all schedules
  const allAvailableSlots = [];
  
  schedules.forEach(schedule => {
    const availableSlots = schedule.timeSlots.filter(slot => 
      slot.status === "available" && slot.isAvailable
    );
    
    console.log(`Schedule ${schedule._id} has ${availableSlots.length} available slots`);
    
    // Add schedule reference to each slot for debugging
    availableSlots.forEach(slot => {
      allAvailableSlots.push({
        ...slot.toObject(),
        scheduleId: schedule._id,
        scheduleDate: schedule.date
      });
    });
  });

  console.log("Total available slots:", allAvailableSlots.length);

  // Sort by start time
  return allAvailableSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

// Static method to book a time slot
doctorScheduleSchema.statics.bookTimeSlot = async function(doctorId, date, startTime, appointmentId) {
  const schedule = await this.findOne({
    doctorId,
    date: new Date(date),
    isActive: true
  });

  if (!schedule) {
    throw new Error("No schedule found for this date");
  }

  const timeSlot = schedule.timeSlots.find(slot => 
    slot.startTime === startTime && slot.status === "available"
  );

  if (!timeSlot) {
    throw new Error("Time slot not available");
  }

  timeSlot.isAvailable = false;
  timeSlot.status = "booked";
  timeSlot.appointmentId = appointmentId;

  await schedule.save();
  return timeSlot;
};

// Static method to release a time slot
doctorScheduleSchema.statics.releaseTimeSlot = async function(doctorId, date, startTime) {
  const schedule = await this.findOne({
    doctorId,
    date: new Date(date),
    isActive: true
  });

  if (!schedule) return null;

  const timeSlot = schedule.timeSlots.find(slot => 
    slot.startTime === startTime
  );

  if (timeSlot) {
    timeSlot.isAvailable = true;
    timeSlot.status = "available";
    timeSlot.appointmentId = null;
    await schedule.save();
  }

  return timeSlot;
};

// Static method to mark time slot as completed
doctorScheduleSchema.statics.completeTimeSlot = async function(doctorId, date, startTime) {
  const schedule = await this.findOne({
    doctorId,
    date: new Date(date),
    isActive: true
  });

  if (!schedule) return null;

  const timeSlot = schedule.timeSlots.find(slot => 
    slot.startTime === startTime
  );

  if (timeSlot) {
    timeSlot.status = "completed";
    await schedule.save();
  }

  return timeSlot;
};

const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;
