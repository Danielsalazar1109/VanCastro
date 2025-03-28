import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import { hasTimeConflict, addBufferTime } from '@/lib/utils/bufferTime';
import { sendBookingRescheduleEmail } from '@/lib/utils/emailService';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if the user is authenticated and has admin role
    const session = await getServerSession();
    
    // Parse the request body
    const body = await request.json();
    const { 
      bookingId, 
      newDate, 
      newStartTime, 
      newInstructorId,
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
    
    // Determine which instructor to use
    const instructorId = newInstructorId || booking.instructor._id;
    
    // If instructor is changing, validate the new instructor
    if (newInstructorId && newInstructorId !== booking.instructor._id.toString()) {
      const newInstructor = await mongoose.model('Instructor').findById(newInstructorId)
        .populate('user', 'firstName lastName email');
      
      if (!newInstructor) {
        return NextResponse.json(
          { error: 'New instructor not found' },
          { status: 404 }
        );
      }
      
      // Check if new instructor can teach this class type
      if (!newInstructor.classTypes.includes(booking.classType)) {
        return NextResponse.json(
          { error: 'Selected instructor cannot teach this class type' },
          { status: 400 }
        );
      }
      
      // Check if new instructor is available at this location
      if (!newInstructor.locations.includes(booking.location)) {
        return NextResponse.json(
          { error: 'Selected instructor is not available at this location' },
          { status: 400 }
        );
      }
    }
    
    // Check for time conflicts with other bookings
    const existingBookings = await Booking.find({
      instructor: instructorId,
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
    const oldInstructor = booking.instructor;
    
    // Update booking with new date, times, and instructor if provided
    booking.date = new Date(newDate);
    booking.startTime = newStartTime;
    booking.endTime = newEndTime;
    
    // Update instructor if a new one was provided
    if (newInstructorId && newInstructorId !== booking.instructor._id.toString()) {
      booking.instructor = newInstructorId;
    }
    
    await booking.save();
    
    // Send email notification if requested
    let emailSent = false;
    if (sendEmail && booking.user.email) {
      try {
        // If instructor was changed, we need to fetch the new instructor's details
        let newInstructorName = instructorName; // Default to admin name
        
        if (newInstructorId && newInstructorId !== oldInstructor._id.toString()) {
          // Fetch the new instructor details to get their name
          const newInstructor = await mongoose.model('Instructor').findById(newInstructorId)
            .populate('user', 'firstName lastName');
            
          if (newInstructor && newInstructor.user) {
            newInstructorName = `${newInstructor.user.firstName} ${newInstructor.user.lastName}`;
          }
        } else {
          // If instructor didn't change, use the original instructor's name
          newInstructorName = `${oldInstructor.user.firstName} ${oldInstructor.user.lastName}`;
        }
        
        await sendBookingRescheduleEmail(
          booking,
          newInstructorName, // Use the actual instructor's name, not the admin's name
          oldDate.toISOString(),
          oldStartTime,
          newInstructorId ? oldInstructor : null,
          instructorName // Pass the admin name separately
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