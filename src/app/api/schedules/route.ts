import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Schedule from '@/models/Schedule';
import Instructor from '@/models/Instructor';
import Booking from '@/models/Booking';
import { hasTimeConflict } from '@/lib/utils/bufferTime';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { instructorId, date, slots } = body;
    
    // Validate required fields
    if (!instructorId || !date || !slots || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
    
    // Validate slots
    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        return NextResponse.json(
          { error: 'Each slot must have startTime and endTime' },
          { status: 400 }
        );
      }
    }
    
    // Check for overlapping slots
    for (let i = 0; i < slots.length; i++) {
      const currentSlot = slots[i];
      const otherSlots = slots.filter((_, index) => index !== i);
      
      const slotsForConflictCheck = otherSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime
      }));
      
      // Simple time overlap check without considering location
      const hasOverlap = slotsForConflictCheck.some(slot => 
        (slot.startTime < currentSlot.endTime && slot.endTime > currentSlot.startTime)
      );
      
      if (hasOverlap) {
        return NextResponse.json(
          { error: 'Schedule contains overlapping slots' },
          { status: 400 }
        );
      }
    }
    
    // Format the date to start of day
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Check if schedule already exists for this instructor and date
    let schedule = await Schedule.findOne({
      instructor: instructorId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (schedule) {
      // Update existing schedule
      schedule.slots = slots;
      await schedule.save();
    } else {
      // Create new schedule
      schedule = await Schedule.create({
        instructor: instructorId,
        date: scheduleDate,
        slots
      });
    }
    
    return NextResponse.json({ schedule });
  } catch (error) {
    console.error('Error creating/updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create/update schedule' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query based on parameters
    const query: any = {};
    
    if (instructorId) {
      query.instructor = instructorId;
    }
    
    if (startDate) {
      query.date = query.date || {};
      query.date.$gte = new Date(startDate);
    }
    
    if (endDate) {
      query.date = query.date || {};
      query.date.$lte = new Date(endDate);
    }
    
    // Get schedules based on query
    const schedules = await Schedule.find(query)
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'firstName lastName'
        }
      })
      .sort({ date: 1 });
    
    // Get bookings for these schedules to mark booked slots
    const bookings = await Booking.find({
      instructor: instructorId,
      date: query.date,
      status: { $ne: 'cancelled' }
    });
    
    // Mark booked slots
    const schedulesWithBookings = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      
      // Find bookings for this date
      const dateBookings = bookings.filter(booking => 
        booking.date.toDateString() === new Date(scheduleObj.date).toDateString()
      );
      
      // Mark slots as booked if they overlap with bookings
      scheduleObj.slots = scheduleObj.slots.map((slot: { startTime: string; endTime: string; isBooked?: boolean }) => {
        const isBooked = dateBookings.some(booking =>
          (booking.startTime <= slot.startTime && booking.endTime > slot.startTime) ||
          (booking.startTime >= slot.startTime && booking.startTime < slot.endTime)
        );
        
        return {
          ...slot,
          isBooked
        };
      });
      
      return scheduleObj;
    });
    
    return NextResponse.json({ schedules: schedulesWithBookings });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    
    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }
    
    // Check if schedule exists
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }
    
    // Check if there are any bookings for this schedule
    const bookings = await Booking.find({
      instructor: schedule.instructor,
      date: {
        $gte: new Date(schedule.date.setHours(0, 0, 0, 0)),
        $lt: new Date(schedule.date.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    });
    
    if (bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete schedule with existing bookings' },
        { status: 400 }
      );
    }
    
    // Delete schedule
    await Schedule.findByIdAndDelete(scheduleId);
    
    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}