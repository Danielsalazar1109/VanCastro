import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/db/mongodb';
import { sendInvoiceEmail } from '@/lib/utils/emailService';

export async function POST(request: NextRequest) {
  try {
    // Check authentication without explicit config
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
    await connectToDatabase();
    const { default: User } = await import('@/models/User');
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
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
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication without explicit config
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin status
    await connectToDatabase();
    const { default: User } = await import('@/models/User');
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingId, status } = body;

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