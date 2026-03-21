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
  const schedule = await this.findOne({
    doctorId,
    date: new Date(date),
    isActive: true
  }).populate("timeSlots.appointmentId");

  if (!schedule) return [];

  return schedule.timeSlots.filter(slot => 
    slot.status === "available" && slot.isAvailable
  );
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
