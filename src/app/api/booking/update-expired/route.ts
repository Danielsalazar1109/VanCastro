import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking, { IBookingModel } from '@/models/Booking';

/**
 * API route to update expired bookings
 * This route finds all pending bookings older than 24 hours and updates them to cancelled
 * Can be called by a scheduled job or manually by an administrator
 */
export async function GET() {
  try {
    await connectToDatabase();
    
    // Call the static method we defined in the Booking model
    const updatedCount = await (Booking as unknown as IBookingModel).updateExpiredBookings();
    
    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} expired bookings from pending to cancelled`,
      updatedCount 
    });
  } catch (error) {
    console.error('Error updating expired bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expired bookings' },
      { status: 500 }
    );
  }
}