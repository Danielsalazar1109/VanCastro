import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Schedule from '@/models/Schedule';
import Instructor from '@/models/Instructor';
import Booking from '@/models/Booking';
import { hasTimeConflict, addBufferTime, calculateBufferTime } from '@/lib/utils/bufferTime';

/**
 * Generate time slots based on instructor availability, class duration, location, and existing bookings
 * 
 * @param availability The instructor's availability for a specific day
 * @param duration The duration of each class in minutes
 * @param location The location where the class will take place
 * @param existingBookings Array of existing bookings to consider when generating slots
 * @returns Array of time slots with startTime and endTime
 */
function generateTimeSlots(
  availability: { startTime: string; endTime: string; isAvailable: boolean },
  duration: number = 60,
  location: string = 'Surrey',
  existingBookings: Array<{
    startTime: string;
    endTime: string;
    location: string;
  }> = []
) {
  if (!availability || !availability.isAvailable) {
    return [];
  }

  const slots = [];
  const SLOT_INTERVAL = 15 ; // Fixed 30-minute intervals between slot start times

  // Convert start and end times to minutes since midnight
  const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
  const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
  
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  // Sort existing bookings by start time
  const sortedBookings = [...existingBookings].sort((a, b) => {
    const [aHours, aMinutes] = a.startTime.split(':').map(Number);
    const [bHours, bMinutes] = b.startTime.split(':').map(Number);
    
    const aTotalMinutes = aHours * 60 + aMinutes;
    const bTotalMinutes = bHours * 60 + bMinutes;
    
    return aTotalMinutes - bTotalMinutes;
  });
  
  // Generate slots at fixed 30-minute intervals
  // Round up to the nearest 30-minute interval if needed
  let currentTimeInMinutes = startTimeInMinutes;
  if (currentTimeInMinutes % SLOT_INTERVAL !== 0) {
    currentTimeInMinutes = Math.ceil(currentTimeInMinutes / SLOT_INTERVAL) * SLOT_INTERVAL;
  }
  
  // Create blocked time ranges based on existing bookings including buffer times
  const blockedTimeRanges = [];
  
  for (const booking of sortedBookings) {
    // Convert booking times to minutes
    const [bookingStartHours, bookingStartMinutes] = booking.startTime.split(':').map(Number);
    const [bookingEndHours, bookingEndMinutes] = booking.endTime.split(':').map(Number);
    
    const bookingStartTotalMinutes = bookingStartHours * 60 + bookingStartMinutes;
    const bookingEndTotalMinutes = bookingEndHours * 60 + bookingEndMinutes;
    
    // Calculate buffer times before and after bookings
    const bufferBefore = calculateBufferTime(location, booking.location);
    const bufferAfter = calculateBufferTime(booking.location, location);
    
    // Add blocked time range including buffer times
    blockedTimeRanges.push({
      start: bookingStartTotalMinutes - bufferBefore,
      end: bookingEndTotalMinutes + bufferAfter
    });
  }
  
  // Merge overlapping blocked time ranges
  const mergedBlockedRanges = [];
  if (blockedTimeRanges.length > 0) {
    blockedTimeRanges.sort((a, b) => a.start - b.start);
    
    let currentRange = blockedTimeRanges[0];
    
    for (let i = 1; i < blockedTimeRanges.length; i++) {
      const nextRange = blockedTimeRanges[i];
      
      if (nextRange.start <= currentRange.end) {
        // Ranges overlap, merge them
        currentRange.end = Math.max(currentRange.end, nextRange.end);
      } else {
        // No overlap, add the current range to merged list and move to next
        mergedBlockedRanges.push(currentRange);
        currentRange = nextRange;
      }
    }
    
    // Add the last range
    mergedBlockedRanges.push(currentRange);
  }
  
  // Generate slots, skipping blocked times
  while (currentTimeInMinutes + duration <= endTimeInMinutes) {
    // Convert current time back to HH:MM format
    const currentHours = Math.floor(currentTimeInMinutes / 60);
    const currentMinutes = currentTimeInMinutes % 60;
    const startTime = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    // Calculate end time
    const slotEndTimeInMinutes = currentTimeInMinutes + duration;
    const endHours = Math.floor(slotEndTimeInMinutes / 60);
    const endMinutes = slotEndTimeInMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    // Check if this slot overlaps with any blocked time range
    let isBlocked = false;
    for (const range of mergedBlockedRanges) {
      // Check for any kind of overlap
      if (
        (currentTimeInMinutes >= range.start && currentTimeInMinutes < range.end) || // Slot starts during blocked time
        (slotEndTimeInMinutes > range.start && slotEndTimeInMinutes <= range.end) || // Slot ends during blocked time
        (currentTimeInMinutes <= range.start && slotEndTimeInMinutes >= range.end)    // Slot spans the entire blocked time
      ) {
        isBlocked = true;
        break;
      }
    }
    
    // Add slot if it's not blocked
    if (!isBlocked) {
      slots.push({
        startTime,
        endTime,
        isBooked: isBlocked
      });  
    }
    
    // Move to next slot at fixed 30-minute interval
    currentTimeInMinutes += SLOT_INTERVAL;
  }
  
  return slots;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { instructorId, date, duration, location = 'Surrey' } = body;
    
    // Validate required fields
    if (!instructorId || !date) {
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
    
    // Get day of week from date
    const dateObj = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    
    // Find instructor's availability for this day
    const dayAvailability = instructor.availability.find((a: { day: string; startTime: string; endTime: string; isAvailable: boolean }) => a.day === dayOfWeek);
    
    if (!dayAvailability || !dayAvailability.isAvailable) {
      return NextResponse.json(
        { error: `Instructor is not available on ${dayOfWeek}` },
        { status: 400 }
      );
    }
    
    // Format the date to start of day for querying
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Fetch existing bookings for this instructor and date
    const existingBookings = await Booking.find({
      instructor: instructorId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'cancelled' }
    });
    
    // Format bookings for conflict checking
    const bookingsForConflictCheck = existingBookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.location
    }));
    
    // Generate time slots based on instructor's availability, considering existing bookings
    const slots = generateTimeSlots(
      dayAvailability, 
      duration || 60, 
      location,
      bookingsForConflictCheck
    );
    
    if (slots.length === 0) {
      return NextResponse.json(
        { error: 'No available time slots could be generated for this day' },
        { status: 400 }
      );
    }
    
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
      const startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
      query.date.$gte = startDateObj;
    }
    
    if (endDate) {
      query.date = query.date || {};
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      query.date.$lte = endDateObj;
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