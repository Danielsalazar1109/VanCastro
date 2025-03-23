import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import Schedule from '@/models/Schedule';
import { hasTimeConflict, addBufferTime } from '@/lib/utils/bufferTime';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { 
      userId, 
      instructorId, 
      location, 
      classType, 
      packageType, 
      duration, 
      date, 
      startTime 
    } = body;
    
    // Validate required fields
    if (!userId || !instructorId || !location || !classType || !packageType || !duration || !date || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if instructor exists
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }
    
    // Check if instructor teaches this class type
    if (!instructor.classTypes.includes(classType)) {
      return NextResponse.json(
        { error: 'Instructor does not teach this class type' },
        { status: 400 }
      );
    }
    
    // Check if instructor is available at this location
    if (!instructor.locations.includes(location)) {
      return NextResponse.json(
        { error: 'Instructor is not available at this location' },
        { status: 400 }
      );
    }
    
    // Calculate end time based on duration
    const endTime = addBufferTime(startTime, duration);
    
    // Get the booking date
    const bookingDate = new Date(date);
    
    // Check if instructor is generally available on this day of week
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];
    const instructorAvailability = instructor.availability.find((a: any) => a.day === dayOfWeek);
    
    if (!instructorAvailability || !instructorAvailability.isAvailable) {
      return NextResponse.json(
        { error: `Instructor is not available on ${dayOfWeek}` },
        { status: 400 }
      );
    }
    
    // Check if the requested time is within instructor's availability hours
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [availStartHour, availStartMinute] = instructorAvailability.startTime.split(':').map(Number);
    const [availEndHour, availEndMinute] = instructorAvailability.endTime.split(':').map(Number);
    
    const requestedTimeInMinutes = startHour * 60 + startMinute;
    const availStartInMinutes = availStartHour * 60 + availStartMinute;
    const availEndInMinutes = availEndHour * 60 + availEndMinute;
    
    if (requestedTimeInMinutes < availStartInMinutes || requestedTimeInMinutes + parseInt(duration) > availEndInMinutes) {
      return NextResponse.json(
        { error: 'Requested time is outside instructor\'s availability hours' },
        { status: 400 }
      );
    }
    
    // Check for time conflicts
    const existingBookings = await Booking.find({
      instructor: instructorId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    });
    
    const bookingsForConflictCheck = existingBookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.location
    }));
    
    if (hasTimeConflict(startTime, endTime, location, bookingsForConflictCheck)) {
      return NextResponse.json(
        { error: 'Time slot is not available due to scheduling conflicts' },
        { status: 400 }
      );
    }
    
    // Create a new booking with pending status
    const booking = await Booking.create({
      user: userId,
      instructor: instructorId,
      location,
      classType,
      package: packageType,
      duration,
      date: new Date(date),
      startTime,
      endTime,
      status: 'pending',
      paymentStatus: 'completed', // Set as completed since we're not using Stripe
    });
    
    // Return the booking ID
    return NextResponse.json({ bookingId: booking._id });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');
    
    // Build query based on parameters
    const query: any = {};
    
    if (userId) {
      query.user = userId;
    }
    
    if (instructorId) {
      query.instructor = instructorId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get bookings based on query
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ date: 1, startTime: 1 });
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { bookingId, status } = body;
    
    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Update booking status
    booking.status = status;
    await booking.save();
    
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}