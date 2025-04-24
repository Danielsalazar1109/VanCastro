import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe/stripe';
import connectToDatabase from '@/lib/db/mongodb';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook secret is not set' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    
    // Extract the booking ID from the metadata
    const bookingId = session.metadata.bookingId;
    
    if (bookingId) {
      try {
        // Connect to the database
        await connectToDatabase();
        
        // Update the booking status to 'completed'
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'completed',
          paymentId: session.payment_intent,
        });
        
        // Here you would also send a confirmation email to the customer
        // using a service like Nodemailer
        
        console.log(`Payment for booking ${bookingId} completed successfully`);
      } catch (error) {
        console.error('Error updating booking status:', error);
        return NextResponse.json(
          { error: 'Failed to update booking status' },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
