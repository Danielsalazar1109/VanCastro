import nodemailer from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_HOST || "smtp.gmail.com",
	port: parseInt(process.env.EMAIL_PORT || "587"),
	secure: process.env.EMAIL_SECURE === "true",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

// Logo configuration
const LOGO_URL = process.env.LOGO_URL || "https://framerusercontent.com/images/jPAQ8xuOTcFAmT9WHP9tr41J4.png";
const LOGO_ALT = "VanCastro Driving School";

// Email templates
const emailTemplates = {
	otpVerification: (data: { userName: string; code: string; purpose: "registration" | "password-reset" }) => ({
		subject: data.purpose === "registration" ? "Verify your email address" : "Password reset code",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #4f46e5; text-align: center;">
          ${data.purpose === "registration" ? "Verify your email address" : "Reset your password"}
        </h2>
        <p>Hello ${data.userName},</p>
        <p>
          ${
				data.purpose === "registration"
					? "Thank you for registering. To complete your registration, please verify your email address with the following code:"
					: "You have requested to reset your password. Use the following code to verify your identity:"
			}
        </p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${data.code}</p>
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
	}),
	invoiceEmail: (data: {
		studentName: string;
		bookingId: string;
		date: string;
		classType: string;
		amount: string | number;
		invoiceNumber?: string;
		notes?: string;
	}) => ({
		subject: "Invoice for Driving Lesson",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #4f46e5; text-align: center;">Invoice</h2>
        <p>Hello ${data.studentName},</p>
        <p>Please find attached the invoice for your driving lesson.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Class Type:</strong> ${data.classType}</p>
          <p><strong>Amount:</strong> $${typeof data.amount === "number" ? data.amount.toFixed(2) : data.amount}</p>
          ${data.invoiceNumber ? `<p><strong>Invoice Number:</strong> ${data.invoiceNumber}</p>` : ""}
        </div>
        ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
        <p>Please review the attached document for detailed information.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
	}),
	bookingPending: (data: {
		studentName: string;
		instructorName: string;
		date: string;
		startTime: string;
		location: string;
		classType: string;
	}) => ({
		subject: "Driving Lesson Booking Request Received",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #f59e0b; text-align: center;">Booking Request Received</h2>
        <p>Hello ${data.studentName},</p>
        <p>We have received your driving lesson booking request. Our team will review it shortly.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Class Type:</strong> ${data.classType}</p>
        </div>
        <p>You can <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://vancastro.vercel.app"}/contracts/${data.classType.replace(/\s+/g, "")}" style="color: #4f46e5; text-decoration: underline; font-weight: bold;">review the contract here</a> for your selected class type.</p>
        <p>Your booking is currently <strong>pending approval</strong>. You will receive another email once your booking is confirmed.</p>
        <p>If you need to make any changes, please contact us as soon as possible.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
	}),
	bookingConfirmation: (data: {
		studentName: string;
		instructorName: string;
		date: string;
		startTime: string;
		location: string;
		classType: string;
	}) => ({
		subject: "Driving Lesson Booking Confirmation",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
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
        <p>You can <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://vancastro.vercel.app"}/contracts/${data.classType.replace(/\s+/g, "")}" style="color: #4f46e5; text-decoration: underline; font-weight: bold;">review the contract here</a> for your selected class type.</p>
        <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
	}),
	bookingRejected: (data: {
		studentName: string;
		instructorName: string;
		date: string;
		startTime: string;
		location: string;
		classType: string;
		reason?: string;
	}) => ({
		subject: "Driving Lesson Booking Request Declined",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #ef4444; text-align: center;">Booking Request Declined</h2>
        <p>Hello ${data.studentName},</p>
        <p>We regret to inform you that your driving lesson booking request has been declined.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Class Type:</strong> ${data.classType}</p>
        </div>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
        <p>If you would like to book another lesson, please visit our website to select a different time or date.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Thank you for your understanding.</p>
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
		subject: "Driving Lesson Cancellation Confirmation",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
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
		oldInstructorName?: string;
		adminName?: string;
	}) => ({
		subject: "Driving Lesson Rescheduled",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #f59e0b; text-align: center;">Booking Rescheduled</h2>
        <p>Hello ${data.studentName},</p>
        <p>Your driving lesson has been rescheduled${data.adminName ? ` by ${data.adminName}` : ""}.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          ${
				data.oldInstructorName
					? `<p><strong>Previous Instructor:</strong> ${data.oldInstructorName}</p>
             <p><strong>New Instructor:</strong> ${data.instructorName}</p>`
					: `<p><strong>Instructor:</strong> ${data.instructorName}</p>`
			}
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

	bookingReminder: (data: {
		studentName: string;
		instructorName: string;
		date: string;
		startTime: string;
		location: string;
		classType: string;
	}) => ({
		subject: "Reminder: Your Driving Lesson Tomorrow",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${LOGO_URL}" alt="${LOGO_ALT}" style="max-width: 150px; height: auto;" />
        </div>
        <h2 style="color: #4f46e5; text-align: center;">Your Driving Lesson is Tomorrow!</h2>
        <p>Hello ${data.studentName},</p>
        <p>This is a friendly reminder that your driving lesson is scheduled for tomorrow. We're looking forward to seeing you!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Instructor:</strong> ${data.instructorName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Time:</strong> ${data.startTime}</p>
          <p><strong>Location:</strong> ${data.location}</p>
          <p><strong>Class Type:</strong> ${data.classType}</p>
        </div>
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
          <p style="font-weight: bold; color: #92400e;">Important Reminder:</p>
          <p>Please remember to bring your ${data.classType === "class 7" ? "learner's permit (yellow paper)" : "driver's license"} to your lesson. You will not be able to drive without it!</p>
        </div>
        <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #22c55e;">
          <p style="font-weight: bold; color: #166534;">You've Got This!</p>
          <p>Remember, every expert was once a beginner. Stay positive, be patient with yourself, and trust in your instructor's guidance. We believe in you and are excited to help you on your driving journey!</p>
        </div>
        <p>If you need to reschedule or cancel, please contact us as soon as possible (at least 24 hours in advance to avoid cancellation fees).</p>
        <p>We look forward to seeing you tomorrow!</p>
        <p>Thank you for choosing our driving school!</p>
      </div>
    `,
	}),
};

// Send email function
export async function sendEmail(
	to: string,
	templateName: keyof typeof emailTemplates,
	data: any,
	attachments?: Attachment[]
) {
	try {
		const template = emailTemplates[templateName](data);

		const mailOptions = {
			from: process.env.EMAIL_FROM || "noreply@drivingschool.com",
			to,
			subject: template.subject,
			html: template.html,
			attachments: attachments || [],
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.messageId);
		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending email:", error);
		return { success: false, error };
	}
}

// Function to format date for emails
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

// Function to send booking confirmation email
export async function sendBookingConfirmationEmail(booking: any, instructorName: string) {
	return sendEmail(booking.user.email, "bookingConfirmation", {
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
	return sendEmail(booking.user.email, "bookingCancellation", {
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
	newTime: string,
	oldInstructor?: any,
	adminName?: string
) {
	const emailData: any = {
		studentName: `${booking.user.firstName} ${booking.user.lastName}`,
		instructorName,
		oldDate: formatDate(booking.date),
		oldTime: booking.startTime,
		newDate: formatDate(newDate),
		newTime: newTime,
		location: booking.location,
	};

	// If there's an instructor change, add the old instructor's name
	if (oldInstructor && oldInstructor.user) {
		emailData.oldInstructorName = `${oldInstructor.user.firstName} ${oldInstructor.user.lastName}`;
	}

	// Add admin name if provided
	if (adminName) {
		emailData.adminName = adminName;
	}

	return sendEmail(booking.user.email, "bookingReschedule", emailData);
}

// Function to send pending booking email
export async function sendBookingPendingEmail(booking: any, instructorName: string) {
	return sendEmail(booking.user.email, "bookingPending", {
		studentName: `${booking.user.firstName} ${booking.user.lastName}`,
		instructorName,
		date: formatDate(booking.date),
		startTime: booking.startTime,
		location: booking.location,
		classType: booking.classType,
	});
}

// Function to send rejected booking email
export async function sendBookingRejectedEmail(booking: any, instructorName: string, reason?: string) {
	return sendEmail(booking.user.email, "bookingRejected", {
		studentName: `${booking.user.firstName} ${booking.user.lastName}`,
		instructorName,
		date: formatDate(booking.date),
		startTime: booking.startTime,
		location: booking.location,
		classType: booking.classType,
		reason,
	});
}

// Function to send invoice email with attachment
export async function sendInvoiceEmail(
	booking: any,
	attachmentBuffer: Buffer,
	attachmentFilename: string,
	invoiceNumber?: string,
	notes?: string
) {
	const attachments: Attachment[] = [
		{
			filename: attachmentFilename,
			content: attachmentBuffer,
		},
	];

	return sendEmail(
		booking.user.email,
		"invoiceEmail",
		{
			studentName: `${booking.user.firstName} ${booking.user.lastName}`,
			bookingId: booking._id,
			date: formatDate(booking.date),
			classType: booking.classType,
			amount: booking.price || "N/A",
			invoiceNumber,
			notes,
		},
		attachments
	);
}

// Function to send 24-hour reminder email
export async function sendBookingReminderEmail(booking: any, instructorName: string) {
	return sendEmail(booking.user.email, "bookingReminder", {
		studentName: `${booking.user.firstName} ${booking.user.lastName}`,
		instructorName,
		date: formatDate(booking.date),
		startTime: booking.startTime,
		location: booking.location,
		classType: booking.classType,
	});
}
