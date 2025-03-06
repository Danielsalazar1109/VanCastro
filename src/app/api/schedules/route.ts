import { NextRequest, NextResponse } from 'next/server';
import { getAvailableTimeSlots } from '@/lib/calendly/calendly';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'startDate and endDate parameters are required' },
        { status: 400 }
      );
    }
    
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }
    
    // Get available time slots from Calendly
    const availableSlots = await getAvailableTimeSlots(startDate, endDate);
    
    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available time slots' },
      { status: 500 }
    );
  }
}
