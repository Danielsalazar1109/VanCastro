import connectToDatabase from '@/lib/db/mongodb';
import { sendBookingReminderEmail } from './emailService';

/**
 * Sends reminder emails to clients with bookings scheduled for the next day
 */
export async function sendReminderEmails() {
  try {
    console.log('Starting to send reminder emails...');
    
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
 * Calculates the milliseconds until the next half-hour (XX:30)
 */
function getMillisecondsUntilNextHalfHour() {
  const now = new Date();
  const target = new Date(now);
  
  // Set target time to the next half-hour (XX:30)
  const currentMinutes = now.getMinutes();
  if (currentMinutes < 30) {
    // If current time is before XX:30, set to XX:30
    target.setMinutes(30, 0, 0);
  } else {
    // If current time is after XX:30, set to the next hour's XX:30
    target.setHours(target.getHours() + 1);
    target.setMinutes(30, 0, 0);
  }
  
  // Calculate milliseconds until target time
  return target.getTime() - now.getTime();
}

/**
 * Schedules the next reminder email run at the next half-hour (XX:30)
 * This is a temporary change for testing purposes
 */
function scheduleNextRun() {
  const msUntilNextHalfHour = getMillisecondsUntilNextHalfHour();
  
  console.log(`Scheduling next reminder email run in ${Math.floor(msUntilNextHalfHour / 1000 / 60)} minutes`);
  
  // Schedule the next run
  setTimeout(async () => {
    try {
      // Send reminder emails
      await sendReminderEmails();
    } catch (error) {
      console.error('Error in scheduled reminder email run:', error);
    } finally {
      // Schedule the next run regardless of success/failure
      scheduleNextRun();
    }
  }, msUntilNextHalfHour);
}

/**
 * Initializes the scheduler to send reminder emails at the next half-hour (XX:30)
 * This is a temporary change for testing purposes
 * 
 * Note: This function should be called after the application has started
 * and mongoose has been properly initialized
 */
export function initScheduler() {
  console.log('Initializing reminder email scheduler...');
  
  // Delay the first scheduling to ensure mongoose is properly initialized
  setTimeout(() => {
    // Start the scheduling cycle
    scheduleNextRun();
    console.log('Reminder email scheduler initialized and first run scheduled');
  }, 5000); // 5 second delay to ensure mongoose is initialized
  
  return true;
}