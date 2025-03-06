import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';
import stripe from '@/lib/stripe/stripe';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, email, phone, date, timeSlot, service } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !date || !timeSlot || !service) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a new booking with pending payment status
    const booking = await Booking.create({
      firstName,
      lastName,
      email,
      phone,
      date: new Date(date),
      timeSlot,
      service,
      paymentStatus: 'pending',
    });
    
    // Determine price based on service
    let amount = 5000; // Default $50.00 (in cents)
    if (service === 'refresher') {
      amount = 4500; // $45.00
    } else if (service === 'test') {
      amount = 5500; // $55.00
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Driving Lesson - ${service}`,
              description: `${date} at ${timeSlot}`,
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

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all bookings (for admin purposes)
    const bookings = await Booking.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
