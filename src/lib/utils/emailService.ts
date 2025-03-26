import nodemailer from 'nodemailer';

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email templates
const emailTemplates = {
  bookingConfirmation: (data: {
    studentName: string;
    instructorName: string;
    date: string;
    startTime: string;
    location: string;
    classType: string;
  }) => ({
    subject: 'Driving Lesson Booking Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Booking Confirmation</h2>
        <p>Hello ${data.studentName},</p>
        <p>Your driving lesson has been successfully booked!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Class Type:</strong> ${data.classType}</p>
        </div>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
  }),

  bookingCancellation: (data: {
    studentName: string;
    instructorName: string;
    date: string;
    startTime: string;
    location: string;
  }) => ({
    subject: 'Driving Lesson Cancellation Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #ef4444; text-align: center;">Booking Cancellation</h2>
        <p>Hello ${data.studentName},</p>
        <p>Your driving lesson has been cancelled.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>If you would like to book another lesson, please visit our website.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
  }),

  bookingReschedule: (data: {
    studentName: string;
    instructorName: string;
    oldDate: string;
    oldTime: string;
    newDate: string;
    newTime: string;
    location: string;
  }) => ({
    subject: 'Driving Lesson Rescheduled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #f59e0b; text-align: center;">Booking Rescheduled</h2>
        <p>Hello ${data.studentName},</p>
        <p>Your driving lesson has been rescheduled.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Previous Date:</strong> ${data.oldDate}</p>
          <p><strong>Previous Time:</strong> ${data.oldTime}</p>
          <p><strong>New Date:</strong> ${data.newDate}</p>
          <p><strong>New Time:</strong> ${data.newTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>If you need to make any changes, please contact us at least 24 hours in advance.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail(
  to: string,
  templateName: keyof typeof emailTemplates,
  data: any
) {
  try {
    const template = emailTemplates[templateName](data);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@drivingschool.com',
      to,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Function to format date for emails
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Function to send booking confirmation email
export async function sendBookingConfirmationEmail(booking: any, instructorName: string) {
  return sendEmail(booking.user.email, 'bookingConfirmation', {
    studentName: `${booking.user.firstName} ${booking.user.lastName}`,
    instructorName,
    date: formatDate(booking.date),
    startTime: booking.startTime,
    location: booking.location,
    classType: booking.classType,
  });
}

// Function to send booking cancellation email
export async function sendBookingCancellationEmail(booking: any, instructorName: string) {
  return sendEmail(booking.user.email, 'bookingCancellation', {
    studentName: `${booking.user.firstName} ${booking.user.lastName}`,
    instructorName,
    date: formatDate(booking.date),
    startTime: booking.startTime,
    location: booking.location,
  });
}

// Function to send booking reschedule email
export async function sendBookingRescheduleEmail(
  booking: any,
  instructorName: string,
  newDate: string,
  newTime: string
) {
  return sendEmail(booking.user.email, 'bookingReschedule', {
    studentName: `${booking.user.firstName} ${booking.user.lastName}`,
    instructorName,
    oldDate: formatDate(booking.date),
    oldTime: booking.startTime,
    newDate: formatDate(newDate),
    newTime: newTime,
    location: booking.location,
  });
}