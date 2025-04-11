import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Schedule from '@/models/Schedule';
import Instructor, { IInstructor } from '@/models/Instructor';
import Booking from '@/models/Booking';
import GlobalAvailability from '@/models/GlobalAvailability';
import SpecialAvailability from '@/models/SpecialAvailability';
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
  availability: { startTime: string; endTime: string; isAvailable: boolean; day?: string },
  duration: number = 60,
  location: string = 'Surrey',
  existingBookings: Array<{
    startTime: string;
    endTime: string;
    location: string;
  }> = []
) {
  console.log(`\n==== GENERATE TIME SLOTS ====`);
  console.log(`Availability object:`, JSON.stringify(availability));
  
  if (!availability || !availability.isAvailable) {
    console.log(`Availability is null or not available, returning empty slots`);
    return [];
  }

  const slots = [];
  const DEFAULT_SLOT_INTERVAL = 30; // Default 30-minute intervals (00 and 30)

  // Convert start and end times to minutes since midnight
  const [startHours, startMinutes] = availability.startTime.split(':').map(Number);
  const [endHours, endMinutes] = availability.endTime.split(':').map(Number);
  
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  console.log(`Raw start time: ${availability.startTime} (${startTimeInMinutes} minutes)`);
  console.log(`Raw end time: ${availability.endTime} (${endTimeInMinutes} minutes)`);
  
  // Sort existing bookings by start time
  const sortedBookings = [...existingBookings].sort((a, b) => {
    const [aHours, aMinutes] = a.startTime.split(':').map(Number);
    const [bHours, bMinutes] = b.startTime.split(':').map(Number);
    
    const aTotalMinutes = aHours * 60 + aMinutes;
    const bTotalMinutes = bHours * 60 + bMinutes;
    
    return aTotalMinutes - bTotalMinutes;
  });
  
  // Use exact start time from availability settings
  let currentTimeInMinutes = startTimeInMinutes;
  
  console.log(`Generating time slots with availability: ${availability.startTime} - ${availability.endTime}`);
  console.log(`Start time in minutes: ${startTimeInMinutes}, End time in minutes: ${endTimeInMinutes}`);
  
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
  
  // First, generate all possible valid slots (checking every 30 minutes)
  const allPossibleSlots = [];
  
  // Start from the exact start time from availability settings
  let slotTimeInMinutes = startTimeInMinutes;
  
  // Disable rounding to ensure we use the exact start time from availability settings
  // Round up to the nearest 30-minute interval for better UX
  // But only if it doesn't push us past the start time by more than 15 minutes
  // if (slotTimeInMinutes % 30 !== 0) {
  //   const roundedTime = Math.ceil(slotTimeInMinutes / 30) * 30;
  //   if (roundedTime - slotTimeInMinutes <= 15) {
  //     slotTimeInMinutes = roundedTime;
  //   }
  // }
  
  console.log(`Starting slot generation at: ${Math.floor(slotTimeInMinutes / 60)}:${(slotTimeInMinutes % 60).toString().padStart(2, '0')}`);
  
  // Generate all possible slots that don't overlap with blocked time ranges
  // Make sure we don't exceed the end time from availability settings
  while (slotTimeInMinutes + duration <= endTimeInMinutes) {
    // Calculate slot end time
    const slotEndTimeInMinutes = slotTimeInMinutes + duration;
    
    // Check if this slot overlaps with any blocked time range
    let isBlocked = false;
    for (const range of mergedBlockedRanges) {
      // Check for any kind of overlap
      if (
        (slotTimeInMinutes >= range.start && slotTimeInMinutes < range.end) || // Slot starts during blocked time
        (slotEndTimeInMinutes > range.start && slotEndTimeInMinutes <= range.end) || // Slot ends during blocked time
        (slotTimeInMinutes <= range.start && slotEndTimeInMinutes >= range.end)    // Slot spans the entire blocked time
      ) {
        isBlocked = true;
        break;
      }
    }
    
    // Add slot if it's not blocked
    if (!isBlocked) {
      // Convert to HH:MM format
      const hours = Math.floor(slotTimeInMinutes / 60);
      const minutes = slotTimeInMinutes % 60;
      const startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      const endHours = Math.floor(slotEndTimeInMinutes / 60);
      const endMinutes = slotEndTimeInMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      allPossibleSlots.push({
        startTime,
        endTime,
        timeInMinutes: slotTimeInMinutes,
        isStandardTime: minutes === 0 || minutes === 30
      });
    }
    
    // Move to next 15-minute interval
    slotTimeInMinutes += 15;
  }
  
  // Now determine which non-standard slots (15 or 45) should be included
  // We'll only include the first and last slots between two bookings
  const specialTimeSlots = new Set<number>();
  
  // Sort the blocked ranges by start time
  mergedBlockedRanges.sort((a, b) => a.start - b.start);
  
  // For each pair of adjacent blocked ranges, find the first and last valid slots between them
  if (mergedBlockedRanges.length >= 2) {
    for (let i = 0; i < mergedBlockedRanges.length - 1; i++) {
      const currentRange = mergedBlockedRanges[i];
      const nextRange = mergedBlockedRanges[i + 1];
      
      // Find the first valid slot after the current range
      let firstSlotAfterCurrent: number | null = null;
      let lastSlotBeforeNext: number | null = null;
      
      // Sort slots by time
      const sortedSlots = [...allPossibleSlots].sort((a, b) => a.timeInMinutes - b.timeInMinutes);
      
      // Find the first valid slot after the current range
      for (const slot of sortedSlots) {
        const slotTime = slot.timeInMinutes;
        const minutes = slotTime % 60;
        
        // Skip standard time slots (00 or 30)
        if (minutes === 0 || minutes === 30) continue;
        
        // Check if this slot is right after the current range and before the next range
        if (slotTime >= currentRange.end && slotTime + duration <= nextRange.start) {
          if (firstSlotAfterCurrent === null) {
            firstSlotAfterCurrent = slotTime;
          }
          
          // Update the last slot before the next range
          lastSlotBeforeNext = slotTime;
        }
      }
      
      // Add the first and last slots to the special slots set
      if (firstSlotAfterCurrent !== null) {
        specialTimeSlots.add(firstSlotAfterCurrent);
      }
      
      if (lastSlotBeforeNext !== null && lastSlotBeforeNext !== firstSlotAfterCurrent) {
        specialTimeSlots.add(lastSlotBeforeNext);
      }
    }
  }
  
  // Also include slots that are directly adjacent to a single booking
  // (when there's only one booking or at the edges of the schedule)
  for (const slot of allPossibleSlots) {
    const slotTime = slot.timeInMinutes;
    const minutes = slotTime % 60;
    
    // Skip standard time slots (00 or 30)
    if (minutes === 0 || minutes === 30) continue;
    
    // Check if this slot is directly adjacent to the start of a blocked range
    for (const range of mergedBlockedRanges) {
      if (slotTime + duration === range.start) {
        specialTimeSlots.add(slotTime);
        break;
      }
    }
    
    // Check if this slot is directly adjacent to the end of a blocked range
    for (const range of mergedBlockedRanges) {
      if (slotTime === range.end) {
        specialTimeSlots.add(slotTime);
        break;
      }
    }
  }
  
  // Filter the all possible slots to include only standard slots and special slots
  for (const slot of allPossibleSlots) {
    const minutes = slot.timeInMinutes % 60;
    const isStandardSlot = minutes === 0 || minutes === 30;
    const isSpecialSlot = specialTimeSlots.has(slot.timeInMinutes);
    
    if (isStandardSlot || isSpecialSlot) {
      slots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false
      });
    }
  }
  
  return slots;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { instructorId, date, duration, location = 'Surrey', userId } = body;
    
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
    
    // Get day of week from date - set time to noon to ensure consistent day interpretation
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    
    console.log(`Schedule date: ${date}`);
    console.log(`Schedule date with noon time: ${dateObj.toISOString()}`);
    console.log(`Day index from getDay(): ${dateObj.getDay()}`);
    console.log(`Day of week: ${dayOfWeek}`);
    
    // Check special availability settings first for this specific date
    const specialAvailability = await SpecialAvailability.findOne({
      day: dayOfWeek,
      startDate: { $lte: dateObj },
      endDate: { $gte: dateObj }
    });
    
    console.log(`Checking for special availability for ${dayOfWeek} on ${dateObj.toISOString()}`);
    
    let dayAvailability;
    
    if (specialAvailability) {
      console.log(`Found special availability for ${dayOfWeek} on ${dateObj.toISOString()}:`, specialAvailability);
      
      // Use special availability settings
      dayAvailability = {
        day: dayOfWeek,
        startTime: specialAvailability.startTime,
        endTime: specialAvailability.endTime,
        isAvailable: specialAvailability.isAvailable
      };
      
      console.log(`Using special availability: ${dayAvailability.startTime} - ${dayAvailability.endTime}, isAvailable: ${dayAvailability.isAvailable}`);
      
      // If special availability says this day is not available, return error
      if (!dayAvailability.isAvailable) {
        console.log(`Special availability for ${dayOfWeek} on ${date} is not available, rejecting booking`);
        return NextResponse.json(
          { error: `Bookings are not allowed on ${dayOfWeek}, ${date} as per special schedule settings` },
          { status: 400 }
        );
      }
    } else {
      // Fall back to global availability settings
      const globalAvailability = await GlobalAvailability.findOne({ day: dayOfWeek });
      console.log(`No special availability found, retrieved global availability for ${dayOfWeek}:`, globalAvailability);
      
      // If global availability doesn't exist or is not available for this day, return error
      if (!globalAvailability || !globalAvailability.isAvailable) {
        console.log(`Global availability for ${dayOfWeek} is not available, rejecting booking`);
        return NextResponse.json(
          { error: `Bookings are not allowed on ${dayOfWeek} as per admin settings` },
          { status: 400 }
        );
      }
      
      console.log(`Global availability for ${dayOfWeek}: ${globalAvailability.startTime} - ${globalAvailability.endTime}, isAvailable: ${globalAvailability.isAvailable}`);
      
      // Use global availability
      dayAvailability = {
        day: dayOfWeek,
        startTime: globalAvailability.startTime,
        endTime: globalAvailability.endTime,
        isAvailable: true
      };
      
      console.log(`Using global availability: ${dayAvailability.startTime} - ${dayAvailability.endTime}`);
    }
    
    // Format the date to start of day for querying
    const scheduleDate = new Date(date);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Fetch existing bookings for this instructor and date
    const existingInstructorBookings = await Booking.find({
      instructor: instructorId,
      date: {
        $gte: scheduleDate,
        $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000)
      },
      status: { $ne: 'cancelled' }
    });
    
    // Format instructor bookings for conflict checking
    const instructorBookingsForConflictCheck = existingInstructorBookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.location
    }));
    
    // Combine all bookings for conflict checking
    let bookingsForConflictCheck = [...instructorBookingsForConflictCheck];
    
    // If userId is provided, fetch user's existing bookings for the same date
    if (userId) {
      const existingUserBookings = await Booking.find({
        user: userId,
        date: {
          $gte: scheduleDate,
          $lt: new Date(scheduleDate.getTime() + 24 * 60 * 60 * 1000)
        },
        status: { $ne: 'cancelled' }
      });
      
      // Add user bookings to conflict check
      const userBookingsForConflictCheck = existingUserBookings.map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location
      }));
      
      bookingsForConflictCheck = [...bookingsForConflictCheck, ...userBookingsForConflictCheck];
    }
    
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
    const userId = searchParams.get('userId');
    
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
    
    // Get instructor bookings for these schedules to mark booked slots
    const instructorBookings = await Booking.find({
      instructor: instructorId,
      date: query.date,
      status: { $ne: 'cancelled' }
    });
    
    // Get user bookings if userId is provided
    let userBookings: any[] = [];
    if (userId) {
      userBookings = await Booking.find({
        user: userId,
        date: query.date,
        status: { $ne: 'cancelled' }
      });
    }
    
    // Mark booked slots
    const schedulesWithBookings = schedules.map(schedule => {
      const scheduleObj = schedule.toObject();
      
      // Find instructor bookings for this date
      const dateInstructorBookings = instructorBookings.filter(booking => 
        booking.date.toDateString() === new Date(scheduleObj.date).toDateString()
      );
      
      // Find user bookings for this date
      const dateUserBookings = userBookings.filter(booking => 
        booking.date.toDateString() === new Date(scheduleObj.date).toDateString()
      );
      
      // Mark slots as booked if they overlap with instructor bookings or user bookings
      scheduleObj.slots = scheduleObj.slots.map((slot: { startTime: string; endTime: string; isBooked?: boolean }) => {
        // Check if slot overlaps with instructor bookings
        const isInstructorBooked = dateInstructorBookings.some(booking =>
          (booking.startTime <= slot.startTime && booking.endTime > slot.startTime) ||
          (booking.startTime >= slot.startTime && booking.startTime < slot.endTime)
        );
        
        // Check if slot overlaps with user bookings
        const isUserBooked = dateUserBookings.some(booking =>
          (booking.startTime <= slot.startTime && booking.endTime > slot.startTime) ||
          (booking.startTime >= slot.startTime && booking.startTime < slot.endTime)
        );
        
        return {
          ...slot,
          isBooked: isInstructorBooked || isUserBooked
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