/**
 * Calculate buffer time between lessons based on locations
 * 
 * Buffer time rules:
 * - 15 minutes if next class is in the same location
 * - 30 minutes from Vancouver to Surrey
 * - 45 minutes from North Vancouver to Burnaby or Surrey
 * 
 * @param currentLocation The location of the current lesson
 * @param nextLocation The location of the next lesson
 * @returns Buffer time in minutes
 */
export function calculateBufferTime(
  currentLocation: string,
  nextLocation: string
): number {
  // If locations are the same, buffer time is 15 minutes
  if (currentLocation === nextLocation) {
    return 15;
  }

  // From Vancouver to Surrey
  if (
    (currentLocation === 'Vancouver' && nextLocation === 'Surrey') ||
    (currentLocation === 'Surrey' && nextLocation === 'Vancouver')
  ) {
    return 30;
  }

  // From North Vancouver to Burnaby or Surrey
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

  for (const booking of existingBookings) {
    // Convert existing booking times to minutes
    const [existingStartHours, existingStartMinutes] = booking.startTime.split(':').map(Number);
    const [existingEndHours, existingEndMinutes] = booking.endTime.split(':').map(Number);
    
    const existingStartTotalMinutes = existingStartHours * 60 + existingStartMinutes;
    const existingEndTotalMinutes = existingEndHours * 60 + existingEndMinutes;
    
    // Calculate buffer times
    const bufferBefore = calculateBufferTime(booking.location, newLocation);
    const bufferAfter = calculateBufferTime(newLocation, booking.location);
    
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