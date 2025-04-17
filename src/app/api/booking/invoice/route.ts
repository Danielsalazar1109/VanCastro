import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/db/mongodb';
import { sendInvoiceEmail } from '@/lib/utils/emailService';


export async function POST(request: NextRequest) {
  try {
    console.log('Invoice API: Starting POST request');
    
    // Try to get the session without passing any options (recommended for App Router)
    let session;
    try {
      session = await getServerSession();
      console.log('Invoice API: Session result:', session ? 'Session found' : 'No session');
    } catch (sessionError) {
      console.error('Invoice API: Error getting session:', sessionError);
      session = null;
    }
    
    // Get the authorization header as a fallback
    const authHeader = request.headers.get('authorization');
    console.log('Invoice API: Authorization header present:', !!authHeader);
    
    // Connect to database first to prepare for authentication
    await connectToDatabase();
    const { default: User } = await import('@/models/User');
    
    // Check if we have a valid session
    if (!session?.user?.email) {
      console.log('Invoice API: No valid session, checking form data for admin email');
      
      // If no session, check if the request includes admin credentials in form data
      const formData = await request.formData();
      const adminEmail = formData.get('adminEmail') as string;
      
      // Clone formData for later use since we've consumed it
      const formDataClone = new FormData();
      // Use Array.from to avoid TypeScript iteration issues
      Array.from(formData.entries()).forEach(([key, value]) => {
        formDataClone.append(key, value);
      });
      
      if (adminEmail) {
        console.log('Invoice API: Admin email provided in form data:', adminEmail);
        // Check if this is a valid admin email
        const adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
        
        if (!adminUser) {
          console.log('Invoice API: Invalid admin email or not an admin');
          return NextResponse.json(
            { error: 'Unauthorized - Invalid admin credentials' },
            { status: 401 }
          );
        }
        
        console.log('Invoice API: Valid admin email, proceeding with request');
        // Continue with the valid admin user
        const user = adminUser;
        
        // Process the rest of the request with the cloned form data
        return await processInvoiceRequest(formDataClone, user);
      }
      
      console.log('Invoice API: No admin email provided, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized - No valid session or admin credentials' },
        { status: 401 }
      );
    }
    
    // If we have a valid session, verify admin status
    console.log('Invoice API: Valid session, checking admin status');
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      console.log('Invoice API: User is not an admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Process the request with the original request
    console.log('Invoice API: User is admin, proceeding with request');
    const formData = await request.formData();
    return await processInvoiceRequest(formData, user);
  } catch (error: any) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to process the invoice request
async function processInvoiceRequest(formData: FormData, user: any) {

  try {
    const bookingId = formData.get('bookingId') as string;
    const invoiceFile = formData.get('invoiceFile') as File;
    const invoiceNumber = formData.get('invoiceNumber') as string;
    const notes = formData.get('notes') as string;

    if (!bookingId || !invoiceFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details
    const { default: Booking } = await import('@/models/Booking');
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email')
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await invoiceFile.arrayBuffer());
    const fileName = invoiceFile.name;

    // Send email with attachment
    const emailResult = await sendInvoiceEmail(
      booking,
      fileBuffer,
      fileName,
      invoiceNumber,
      notes
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send invoice email', details: emailResult.error },
        { status: 500 }
      );
    }

    // Update booking payment status to "invoice sent"
    booking.paymentStatus = 'invoice sent';
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      emailId: emailResult.messageId
    });
  } catch (error: any) {
    console.error('Error processing invoice request:', error);
    return NextResponse.json(
      { error: 'Failed to process invoice request', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Invoice API: Starting PUT request');
    
    // Try to get the session without passing any options (recommended for App Router)
    let session;
    try {
      session = await getServerSession();
      console.log('Invoice API: Session result:', session ? 'Session found' : 'No session');
    } catch (sessionError) {
      console.error('Invoice API: Error getting session:', sessionError);
      session = null;
    }
    
    // Get the authorization header as a fallback
    const authHeader = request.headers.get('authorization');
    console.log('Invoice API: Authorization header present:', !!authHeader);
    
    // Connect to database first to prepare for authentication
    await connectToDatabase();
    const { default: User } = await import('@/models/User');
    
    // Check if we have a valid session
    if (!session?.user?.email) {
      console.log('Invoice API: No valid session, checking request body for admin email');
      
      // If no session, check if the request includes admin credentials in body
      const body = await request.json();
      const { adminEmail, bookingId, status } = body;
      
      if (adminEmail) {
        console.log('Invoice API: Admin email provided in body:', adminEmail);
        // Check if this is a valid admin email
        const adminUser = await User.findOne({ email: adminEmail, role: 'admin' });
        
        if (!adminUser) {
          console.log('Invoice API: Invalid admin email or not an admin');
          return NextResponse.json(
            { error: 'Unauthorized - Invalid admin credentials' },
            { status: 401 }
          );
        }
        
        console.log('Invoice API: Valid admin email, proceeding with request');
        // Continue with the valid admin user
        return await processStatusUpdate(bookingId, status);
      }
      
      console.log('Invoice API: No admin email provided, returning 401');
      return NextResponse.json(
        { error: 'Unauthorized - No valid session or admin credentials' },
        { status: 401 }
      );
    }
    
    // If we have a valid session, verify admin status
    console.log('Invoice API: Valid session, checking admin status');
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      console.log('Invoice API: User is not an admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Process the request
    console.log('Invoice API: User is admin, proceeding with request');
    const body = await request.json();
    const { bookingId, status } = body;
    return await processStatusUpdate(bookingId, status);

  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to process the status update
async function processStatusUpdate(bookingId: string, status: string) {
  try {

    if (!bookingId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid request. Booking ID and valid status (approved/rejected) required' },
        { status: 400 }
      );
    }

    // Get booking details
    const { default: Booking } = await import('@/models/Booking');
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking payment status
    booking.paymentStatus = status;
    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      booking: {
        id: booking._id,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status', details: error.message },
      { status: 500 }
    );
  }
}