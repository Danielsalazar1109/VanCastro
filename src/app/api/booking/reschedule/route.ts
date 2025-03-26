import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { hasTimeConflict, addBufferTime } from '@/lib/utils/bufferTime';
import { sendBookingRescheduleEmail } from '@/lib/utils/emailService';

export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { 
      bookingId, 
      newDate, 
      newStartTime, 
      instructorName = 'Your Instructor',
      sendEmail = true
    } = body;
    
    // Validate required fields
    if (!bookingId || !newDate || !newStartTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if booking exists and populate user and instructor details
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });
      
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Calculate new end time based on duration
    const newEndTime = addBufferTime(newStartTime, booking.duration);
    
    // Get the new booking date
    const newBookingDate = new Date(newDate);
    
    // Check for time conflicts with other bookings
    const existingBookings = await Booking.find({
      instructor: booking.instructor,
      date: {
        $gte: new Date(newBookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(newBookingDate.setHours(23, 59, 59, 999))
      },
      _id: { $ne: bookingId }, // Exclude the current booking
      status: { $ne: 'cancelled' }
    });
    
    const bookingsForConflictCheck = existingBookings.map(b => ({
      startTime: b.startTime,
      endTime: b.endTime,
      location: b.location
    }));
    
    if (hasTimeConflict(newStartTime, newEndTime, booking.location, bookingsForConflictCheck)) {
      return NextResponse.json(
        { error: 'New time slot is not available due to scheduling conflicts' },
        { status: 400 }
      );
    }
    
    // Store old values for email notification
    const oldDate = booking.date;
    const oldStartTime = booking.startTime;
    
    // Update booking with new date and times
    booking.date = new Date(newDate);
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    await booking.save();
    
    // Send email notification if requested
    let emailSent = false;
    if (sendEmail && booking.user.email) {
      try {
        await sendBookingRescheduleEmail(
          booking,
          instructorName,
          oldDate.toISOString(),
          oldStartTime
        );
        console.log('Reschedule email sent to:', booking.user.email);
        emailSent = true;
      } catch (emailError) {
        console.error('Error sending reschedule email:', emailError);
        // Continue even if email fails
      }
    }
    
    return NextResponse.json({ 
      message: 'Booking rescheduled successfully',
      booking,
      emailSent
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule booking' },
      { status: 500 }
    );
  }
}