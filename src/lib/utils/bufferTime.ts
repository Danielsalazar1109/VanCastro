/**
 * Calculate buffer time between lessons based on locations
 * 
 * Buffer time rules:
 * - 15 minutes if next class is in the same location
 * - 30 minutes between Burnaby and Surrey
 * - 45 minutes between North Vancouver and either Burnaby or Surrey
 * 
 * When both previous and next locations are provided, the function will:
 * - Consider the buffer time needed for both transitions
 * - Return the appropriate buffer time based on the locations
 * 
 * @param currentLocation The location of the current lesson
 * @param nextLocation The location of the next lesson
 * @param previousLocation The location of the previous lesson (optional)
 * @returns Buffer time in minutes
 */
export function calculateBufferTime(
  currentLocation: string,
  nextLocation: string,
  previousLocation?: string
): number {
  // If no previous location is provided, calculate buffer based only on current and next
  if (!previousLocation) {
    // If locations are the same, buffer time is 15 minutes
    if (currentLocation === nextLocation) {
      return 15;
    }

    // Between Burnaby and Surrey
    if (
      (currentLocation === 'Burnaby' && nextLocation === 'Surrey') ||
      (currentLocation === 'Surrey' && nextLocation === 'Burnaby')
    ) {
      return 30;
    }

    // Between North Vancouver and Burnaby or Surrey
    if (
      (currentLocation === 'North Vancouver' && 
       (nextLocation === 'Burnaby' || nextLocation === 'Surrey')) ||
      ((currentLocation === 'Burnaby' || currentLocation === 'Surrey') && 
       nextLocation === 'North Vancouver')
    ) {
      return 45;
    }

    // Default buffer time for other combinations
    return 30;
  }
  
  // If previous location is provided, consider both transitions
  
  // Calculate buffer time from previous to current location
  const bufferFromPrevious = calculateBufferTimeForLocations(previousLocation, currentLocation);
  
  // Calculate buffer time from current to next location
  const bufferToNext = calculateBufferTimeForLocations(currentLocation, nextLocation);
  
  // Return the maximum buffer time to ensure enough time for both transitions
  return Math.max(bufferFromPrevious, bufferToNext);
}

/**
 * Helper function to calculate buffer time between two specific locations
 * 
 * @param fromLocation The starting location
 * @param toLocation The destination location
 * @returns Buffer time in minutes
 */
function calculateBufferTimeForLocations(
  fromLocation: string,
  toLocation: string
): number {
  // If locations are the same, buffer time is 15 minutes
  if (fromLocation === toLocation) {
    return 15;
  }

  // Between Burnaby and Surrey
  if (
    (fromLocation === 'Burnaby' && toLocation === 'Surrey') ||
    (fromLocation === 'Surrey' && toLocation === 'Burnaby')
  ) {
    return 30;
  }

  // Between North Vancouver and Burnaby or Surrey
  if (
    (fromLocation === 'North Vancouver' && 
     (toLocation === 'Burnaby' || toLocation === 'Surrey')) ||
    ((fromLocation === 'Burnaby' || fromLocation === 'Surrey') && 
     toLocation === 'North Vancouver')
  ) {
    return 45;
  }

  // Default buffer time for other combinations
  return 30;
}

/**
 * Add buffer time to a time string
 * 
 * @param timeString Time in format "HH:MM"
 * @param bufferMinutes Buffer time in minutes
 * @returns New time string with buffer added
 */
export function addBufferTime(timeString: string, bufferMinutes: number): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to total minutes
  let totalMinutes = hours * 60 + minutes + bufferMinutes;
  
  // Convert back to hours and minutes
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  
  // Format as HH:MM
  return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
}

/**
 * Check if a new booking conflicts with existing bookings considering buffer time
 * 
 * @param newBookingStart Start time of the new booking
 * @param newBookingEnd End time of the new booking
 * @param newLocation Location of the new booking
 * @param existingBookings Array of existing bookings with start, end times and locations
 * @returns Boolean indicating if there's a conflict
 */
export function hasTimeConflict(
  newBookingStart: string,
  newBookingEnd: string,
  newLocation: string,
  existingBookings: Array<{
    startTime: string;
    endTime: string;
    location: string;
  }>
): boolean {
  // Convert new booking times to minutes for easier comparison
  const [newStartHours, newStartMinutes] = newBookingStart.split(':').map(Number);
  const [newEndHours, newEndMinutes] = newBookingEnd.split(':').map(Number);
  
  const newStartTotalMinutes = newStartHours * 60 + newStartMinutes;
  const newEndTotalMinutes = newEndHours * 60 + newEndMinutes;

  // Sort bookings by start time to determine previous and next bookings
  const sortedBookings = [...existingBookings].sort((a, b) => {
    const [aHours, aMinutes] = a.startTime.split(':').map(Number);
    const [bHours, bMinutes] = b.startTime.split(':').map(Number);
    
    const aTotalMinutes = aHours * 60 + aMinutes;
    const bTotalMinutes = bHours * 60 + bMinutes;
    
    return aTotalMinutes - bTotalMinutes;
  });

  for (let i = 0; i < sortedBookings.length; i++) {
    const booking = sortedBookings[i];
    
    // Convert existing booking times to minutes
    const [existingStartHours, existingStartMinutes] = booking.startTime.split(':').map(Number);
    const [existingEndHours, existingEndMinutes] = booking.endTime.split(':').map(Number);
    
    const existingStartTotalMinutes = existingStartHours * 60 + existingStartMinutes;
    const existingEndTotalMinutes = existingEndHours * 60 + existingEndMinutes;
    
    // Determine previous and next booking locations
    const previousBooking = i > 0 ? sortedBookings[i - 1] : undefined;
    const nextBooking = i < sortedBookings.length - 1 ? sortedBookings[i + 1] : undefined;
    
    // Calculate buffer times considering previous and next bookings
    const bufferBefore = calculateBufferTime(
      booking.location, 
      newLocation, 
      previousBooking?.location
    );
    
    const bufferAfter = calculateBufferTime(
      newLocation, 
      booking.location, 
      nextBooking?.location
    );
    
    // Check if new booking starts during existing booking (including buffer)
    // or if new booking ends during existing booking (including buffer)
    // or if new booking completely contains existing booking
    if (
      // New booking starts during existing booking (including buffer before)
      (newStartTotalMinutes >= existingStartTotalMinutes - bufferBefore && 
       newStartTotalMinutes < existingEndTotalMinutes) ||
      
      // New booking ends during existing booking (including buffer after)
      (newEndTotalMinutes > existingStartTotalMinutes && 
       newEndTotalMinutes <= existingEndTotalMinutes + bufferAfter) ||
      
      // New booking completely contains existing booking
      (newStartTotalMinutes <= existingStartTotalMinutes && 
       newEndTotalMinutes >= existingEndTotalMinutes)
    ) {
      return true; // Conflict found
    }
  }
  
  return false; // No conflicts
}