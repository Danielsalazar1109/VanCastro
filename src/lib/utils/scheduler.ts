import connectToDatabase from '@/lib/db/mongodb';
import { sendBookingReminderEmail } from './emailService';
import cron from 'node-cron';

/**
 * Sends reminder emails to clients with bookings scheduled for the next day
 */
export async function sendReminderEmails() {
  try {
    console.log('Starting to send reminder emails...', new Date().toISOString());
    
    // Connect to the database first
    const mongoose = await connectToDatabase();
    
    // Only import the Booking model after connecting to the database
    // This ensures mongoose is properly initialized
    const Booking = (await import('@/models/Booking')).default;
    
    // Calculate the date range for tomorrow (24 hours from now)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Set time to start of day
    const tomorrowStart = new Date(tomorrow);
    tomorrowStart.setHours(0, 0, 0, 0);
    
    // Set time to end of day
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    console.log(`Looking for bookings between ${tomorrowStart.toISOString()} and ${tomorrowEnd.toISOString()}`);

    // Find all approved bookings scheduled for tomorrow
    const bookings = await Booking.find({
      date: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd
      },
      status: 'approved'
    }).populate({
      path: 'instructor',
      populate: {
        path: 'user',
        select: 'firstName lastName'
      }
    }).populate('user', 'firstName lastName email');

    if (!bookings || bookings.length === 0) {
      console.log('No bookings found for tomorrow');
      return { remindersSent: 0, message: 'No bookings found for tomorrow' };
    }

    console.log(`Found ${bookings.length} bookings for tomorrow`);

    // Send reminder emails
    let remindersSent = 0;
    for (const booking of bookings) {
      try {
        const instructorName = `${booking.instructor.user.firstName} ${booking.instructor.user.lastName}`;
        
        await sendBookingReminderEmail(booking, instructorName);
        remindersSent++;
        console.log(`Sent reminder email for booking ${booking._id}`);
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking._id}:`, error);
        // Continue with the next booking even if one fails
      }
    }

    console.log(`Successfully sent ${remindersSent} reminder emails`);
    return { remindersSent, message: `Successfully sent ${remindersSent} reminder emails` };
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    throw error;
  }
}

/**
 * Initializes the scheduler to send reminder emails at 8 AM daily
 * 
 * Note: In serverless environments like Vercel, cron jobs may not run reliably
 * as the server might not be running continuously. Consider using a dedicated
 * cron service like Vercel Cron or a third-party service for production.
 */
export function initScheduler() {
  console.log('Initializing reminder email scheduler...', new Date().toISOString());
  
  // Schedule the job to run at 8 AM every day with explicit timezone configuration
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule('10 0 0 ? * * *', async () => {
    try {
      console.log('Cron job: Sending reminder emails...', new Date().toISOString());
      await sendReminderEmails();
    } catch (error) {
      console.error('Error in reminder email cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Vancouver" // Explicit timezone configuration
  });
  
  console.log('Reminder email scheduler initialized to run at 8 AM daily in America/Vancouver timezone');
  return true;
}