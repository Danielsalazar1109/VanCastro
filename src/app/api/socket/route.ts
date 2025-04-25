import { NextRequest, NextResponse } from 'next/server';
import { addInstructorConnection, removeInstructorConnection, broadcastBookingApproval } from '@/lib/utils/socketService';

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
      // Store the controller for this instructor using the utility function
      addInstructorConnection(instructorId, controller);
      
      // Send initial connection message
      const connectMessage = `data: ${JSON.stringify({ type: 'CONNECTED', instructorId })}\n\n`;
      controller.enqueue(connectMessage);
    },
    cancel() {
      // Remove all connections for this instructor when any client disconnects
      removeInstructorConnection(instructorId);
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

// POST handler for the notify endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instructorId, bookingId } = body;
    
    if (!instructorId || !bookingId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    const sent = broadcastBookingApproval(instructorId, bookingId);
    
    if (sent) {
      return NextResponse.json(
        { success: true, message: 'Notification sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'No active connections for this instructor' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in socket notify endpoint:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}