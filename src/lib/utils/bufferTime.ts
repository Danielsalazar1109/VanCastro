/**
 * Calculate buffer time between lessons based on locations
 * 
 * Buffer time rules:
 * - 15 minutes if next class is in the same location
 * - 30 minutes between Burnaby and Vancouver
 * - 45 minutes between North Vancouver and either Burnaby or Vancouver
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
/**
 * Helper function to determine the city type from a location address
 * 
 * @param location The location address
 * @returns The city type ('Vancouver', 'Burnaby', or 'North Vancouver')
 */
function getCityFromLocation(location: string): string {
  if (location.includes('North Vancouver')) {
    return 'North Vancouver';
  } else if (location.includes('Burnaby')) {
    return 'Burnaby';
  } else if (location.includes('Vancouver')) {
    return 'Vancouver';
  }
  
  // Default to the original location if no match
  return location;
}

export function calculateBufferTime(
  currentLocation: string,
  nextLocation: string,
  previousLocation?: string
): number {
  // Get city types from location addresses
  const currentCity = getCityFromLocation(currentLocation);
  const nextCity = getCityFromLocation(nextLocation);
  
  // If no previous location is provided, calculate buffer based only on current and next
  if (!previousLocation) {
    // If locations are the same, buffer time is 15 minutes
    if (currentCity === nextCity) {
      return 15;
    }

    // Between Burnaby and Vancouver
    if (
      (currentCity === 'Burnaby' && nextCity === 'Vancouver') ||
      (currentCity === 'Vancouver' && nextCity === 'Burnaby')
    ) {
      return 30;
    }

    // Between North Vancouver and Burnaby or Vancouver
    if (
      (currentCity === 'North Vancouver' && 
       (nextCity === 'Burnaby' || nextCity === 'Vancouver')) ||
      ((currentCity === 'Burnaby' || currentCity === 'Vancouver') && 
       nextCity === 'North Vancouver')
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
  // Get city types from location addresses
  const fromCity = getCityFromLocation(fromLocation);
  const toCity = getCityFromLocation(toLocation);
  
  // If locations are the same, buffer time is 15 minutes
  if (fromCity === toCity) {
    return 15;
  }

  // Between Burnaby and Vancouver
  if (
    (fromCity === 'Burnaby' && toCity === 'Vancouver') ||
    (fromCity === 'Vancouver' && toCity === 'Burnaby')
  ) {
    return 30;
  }

  // Between North Vancouver and Burnaby or Vancouver
  if (
    (fromCity === 'North Vancouver' && 
     (toCity === 'Burnaby' || toCity === 'Vancouver')) ||
    ((fromCity === 'Burnaby' || fromCity === 'Vancouver') && 
     toCity === 'North Vancouver')
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