import { NextRequest, NextResponse } from 'next/server';

// Store active connections by instructorId
const instructorConnections: Record<string, Set<ReadableStreamDefaultController<any>>> = {};

// This function handles the SSE connection
export async function GET(request: NextRequest) {
  // Check if the request accepts text/event-stream
  const acceptHeader = request.headers.get('accept');
  if (acceptHeader !== 'text/event-stream') {
    return new NextResponse('This endpoint requires Accept: text/event-stream', { status: 406 });
  }

  // Get instructorId from query params
  const url = new URL(request.url);
  const instructorId = url.searchParams.get('instructorId');
  
  if (!instructorId) {
    return new NextResponse('Missing instructorId parameter', { status: 400 });
  }

  // Create a new ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Store the controller for this instructor
      if (!instructorConnections[instructorId]) {
        instructorConnections[instructorId] = new Set();
      }
      instructorConnections[instructorId].add(controller);
      
      console.log(`Instructor ${instructorId} connected to SSE`);
      
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'CONNECTED', instructorId })}\n\n`;
      controller.enqueue(connectMessage);
    },
    cancel() {
      // Remove all connections for this instructor when any client disconnects
      // This is a simplification - in a production app, you'd want to track individual connections
      if (instructorConnections[instructorId]) {
        delete instructorConnections[instructorId];
        console.log(`Instructor ${instructorId} disconnected from SSE`);
      }
    }
  });

  // Return the SSE response
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

// Function to broadcast booking approval to instructors
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