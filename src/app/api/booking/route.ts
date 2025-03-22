import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import Schedule from '@/models/Schedule';
import { hasTimeConflict, addBufferTime } from '@/lib/utils/bufferTime';
import stripe from '@/lib/stripe/stripe';

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
    
    // Check if instructor is available at this time
    const bookingDate = new Date(date);
    const schedule = await Schedule.findOne({
      instructor: instructorId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      }
    });
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Instructor schedule not found for this date' },
        { status: 404 }
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
    
    // Determine price based on package and duration
    let amount = 0;
    if (classType === 'class 4') {
      amount = duration === 60 ? 12600 : 15700; // $126 or $157
    } else if (classType === 'class 5') {
      amount = duration === 60 ? 7300 : 9400;   // $73 or $94
    } else if (classType === 'class 7') {
      amount = duration === 60 ? 9400 : 10500;  // $94 or $105
    }
    
    // Apply package discount
    if (packageType === '3 lessons') {
      amount = Math.floor(amount * 2.8); // 3 lessons for the price of 2.8
    } else if (packageType === '10 lessons') {
      amount = Math.floor(amount * 9); // 10 lessons for the price of 9
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
      paymentStatus: 'pending',
    });
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Driving Lesson - ${classType}`,
              description: `${date} at ${startTime} - ${packageType} - ${duration} mins`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/cancel`,
      metadata: {
        bookingId: booking._id.toString(),
      },
    });
    
    // Return the session ID for the client to redirect to Stripe
    return NextResponse.json({ sessionId: session.id, bookingId: booking._id });
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