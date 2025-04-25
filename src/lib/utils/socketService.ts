// Store active connections by instructorId
const instructorConnections: Record<string, Set<ReadableStreamDefaultController<any>>> = {};

/**
 * Function to broadcast booking approval to instructors
 * @param instructorId The ID of the instructor to notify
 * @param bookingId The ID of the approved booking
 * @returns Boolean indicating whether the message was sent
 */
export function broadcastBookingApproval(instructorId: string, bookingId: string) {
  const controllers = instructorConnections[instructorId];
  
  if (controllers && controllers.size > 0) {
    const messageObj = {
      type: 'BOOKING_APPROVED',
      instructorId,
      bookingId,
      timestamp: new Date().toISOString()
    };
    
    const messageStr = `data: ${JSON.stringify(messageObj)}\n\n`;
    
    // Send the message to all connections for this instructor
    controllers.forEach((controller) => {
      try {
        controller.enqueue(messageStr);
      } catch (error) {
        console.error('Error sending SSE message:', error);
      }
    });
    
    console.log(`Broadcast booking approval to instructor ${instructorId}`);
    return true;
  }
  
  return false;
}

/**
 * Add a new SSE connection for an instructor
 * @param instructorId The ID of the instructor
 * @param controller The ReadableStreamDefaultController for the connection
 */
export function addInstructorConnection(instructorId: string, controller: ReadableStreamDefaultController<any>) {
  if (!instructorConnections[instructorId]) {
    instructorConnections[instructorId] = new Set();
  }
  instructorConnections[instructorId].add(controller);
  console.log(`Instructor ${instructorId} connected to SSE`);
}

/**
 * Remove all SSE connections for an instructor
 * @param instructorId The ID of the instructor
 */
export function removeInstructorConnection(instructorId: string) {
  if (instructorConnections[instructorId]) {
    delete instructorConnections[instructorId];
    console.log(`Instructor ${instructorId} disconnected from SSE`);
  }
}