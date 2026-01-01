import Appointment from "../models/appointment.js";

export const expireAppointments = async () => {
  await Appointment.updateMany(
    {
      status: "approved",
      expiresAt: { $lt: new Date() }
    },
    { status: "expired" }
  );
};
