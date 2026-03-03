// Email Service for Appointment Notifications
import nodemailer from "nodemailer";

// Create transporter - handle missing credentials gracefully
let transporter;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log("Email service configured with:", process.env.EMAIL_USER);
  } else {
    console.log("⚠️ Email credentials not configured. Emails will be logged but not sent.");
    transporter = null;
  }
} catch (error) {
  console.error("Error configuring email service:", error);
  transporter = null;
}

// Send appointment notification email
export const sendAppointmentNotification = async (email, name, appointmentDetails, type) => {
  try {
    let subject, htmlContent;

    switch (type) {
      case "booking":
        subject = "Appointment Booking Confirmation - AROGYAM";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16A34A; margin-bottom: 10px;">AROGYAM</h1>
              <p style="color: #666;">Healthcare Management System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-bottom: 15px;">Appointment Booking Confirmation</h2>
              <p style="color: #666; margin-bottom: 10px;">Dear ${name},</p>
              <p style="color: #666; margin-bottom: 15px;">Your appointment has been booked successfully and is now pending admin approval.</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #16A34A;">
                <h3 style="color: #333; margin-bottom: 10px;">Appointment Details:</h3>
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentDetails.time}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointmentDetails.reason}</p>
              </div>
              
              <p style="color: #666; margin-top: 15px;">You will receive another notification once your appointment is approved by the admin.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;

      case "approved":
        subject = "Appointment Approved - AROGYAM";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16A34A; margin-bottom: 10px;">AROGYAM</h1>
              <p style="color: #666;">Healthcare Management System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #16A34A; margin-bottom: 15px;">Appointment Approved! ✅</h2>
              <p style="color: #666; margin-bottom: 10px;">Dear ${name},</p>
              <p style="color: #666; margin-bottom: 15px;">Your appointment has been approved by the admin and is now confirmed.</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #16A34A;">
                <h3 style="color: #333; margin-bottom: 10px;">Appointment Details:</h3>
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentDetails.time}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointmentDetails.reason}</p>
              </div>
              
              <p style="color: #666; margin-top: 15px;">Please arrive 10 minutes before your scheduled appointment time.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;

      case "rejected":
        subject = "Appointment Rejected - AROGYAM";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16A34A; margin-bottom: 10px;">AROGYAM</h1>
              <p style="color: #666;">Healthcare Management System</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #dc3545; margin-bottom: 15px;">Appointment Rejected ❌</h2>
              <p style="color: #666; margin-bottom: 10px;">Dear ${name},</p>
              <p style="color: #666; margin-bottom: 15px;">We regret to inform you that your appointment request has been rejected.</p>
              
              <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
                <h3 style="color: #333; margin-bottom: 10px;">Appointment Details:</h3>
                <p style="margin: 5px 0;"><strong>Doctor:</strong> ${appointmentDetails.doctorName}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentDetails.time}</p>
                <p style="margin: 5px 0;"><strong>Reason:</strong> ${appointmentDetails.reason}</p>
              </div>
              
              <p style="color: #666; margin-top: 15px;">Please book a new appointment if needed. If you have any questions, contact our support team.</p>
            </div>
            
            <div style="text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `;
        break;

      default:
        return;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || "arogyam.healthcare@gmail.com",
      to: email,
      subject: subject,
      html: htmlContent
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${email} for ${type}`);
    } else {
      console.log(`📧 Email would be sent to ${email} for ${type} (not configured)`);
      console.log(`📧 Email content:`, { subject, to: email });
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default { sendAppointmentNotification };
