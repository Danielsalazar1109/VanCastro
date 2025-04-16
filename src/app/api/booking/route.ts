import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import Schedule from '@/models/Schedule';
import Price from '@/models/Price';
import GlobalAvailability from '@/models/GlobalAvailability';
import SpecialAvailability from '@/models/SpecialAvailability';
import { hasTimeConflict, addBufferTime } from '@/lib/utils/bufferTime';
import { sendBookingPendingEmail, sendBookingConfirmationEmail, sendBookingRejectedEmail } from '@/lib/utils/emailService';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
      const { 
      userId, 
      instructorId, 
      location, 
      classType, 
      packageType, 
      duration, 
      date, 
      startTime,
      price,
      termsAccepted,
      termsAcceptedAt
    } = body;
    // Validate required fields
    if (!userId || !instructorId || !location || !classType || !packageType || !duration || !date || !startTime || !termsAccepted) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has a pending booking
    const existingPendingBooking = await Booking.findOne({
      user: userId,
      status: 'pending'
    });
    
    if (existingPendingBooking) {
      return NextResponse.json(
        { error: 'You already have a pending booking. Please complete or cancel it before creating a new one.' },
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
    
    // Cast instructor to IInstructor type to access virtual properties
    const instructorDoc = instructor as unknown as { 
      classTypes: string[]; 
      locations: Promise<string[]>;
      availability: Array<{ 
        day: string; 
        startTime: string; 
        endTime: string; 
        isAvailable: boolean; 
      }>;
    };
    
    // Check if instructor teaches this class type
    if (!instructorDoc.classTypes.includes(classType)) {
      return NextResponse.json(
        { error: 'Instructor does not teach this class type' },
        { status: 400 }
      );
    }
    
    // Check if instructor is available at this location
    // Since locations is an async virtual property, we need to await it
    const instructorLocations = await instructorDoc.locations;
    
    // Check if instructorLocations is an array and includes the requested location
    if (!instructorLocations || !Array.isArray(instructorLocations) || !instructorLocations.includes(location)) {
      return NextResponse.json(
        { error: 'Instructor is not available at this location' },
        { status: 400 }
      );
    }
    
    // Calculate end time based on duration
    const endTime = addBufferTime(startTime, duration);
    
    // Get the booking date - set time to noon to ensure consistent day interpretation
    const bookingDate = new Date(date + 'T12:00:00');
    
    // Get day of week for the booking date
    // Use local timezone to match what the date picker returns
    const dayIndex = bookingDate.getDay();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
    
    console.log(`Booking date: ${date}`);
    console.log(`Booking date with noon time: ${bookingDate.toISOString()}`);
    console.log(`Day index from getDay(): ${dayIndex}`);
    console.log(`Day of week: ${dayOfWeek}`);
    
    // Check if there are any special availability settings for this date
    const specialAvailability = await SpecialAvailability.find({
      startDate: { $lte: bookingDate },
      endDate: { $gte: bookingDate },
      day: dayOfWeek
    });
    
    console.log(`Special availability for ${date} (${dayOfWeek}):`, specialAvailability);
    
    // If there are special availability settings, they override global settings
    if (specialAvailability.length > 0) {
      // Check if any of the special availability settings for this day are available
      const isAvailable = specialAvailability.some(setting => setting.isAvailable);
      
      if (!isAvailable) {
        return NextResponse.json({
          error: `This date (${new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}) has special availability settings and is marked as unavailable.`
        }, { status: 400 });
      }
      
      console.log(`Special availability found for ${date} (${dayOfWeek}). isAvailable: ${isAvailable}`);
    } else {
      // If no special availability settings, check global availability
      console.log(`No special availability found for ${date} (${dayOfWeek}). Checking global availability.`);
      
      // Check global availability settings
      const globalAvailability = await GlobalAvailability.findOne({ day: dayOfWeek });
      
      // If global availability exists for this day, check if it's available
      if (globalAvailability) {
        console.log(`Global availability for ${dayOfWeek}: isAvailable=${globalAvailability.isAvailable}`);
        
        if (!globalAvailability.isAvailable) {
          return NextResponse.json(
            { error: `Bookings are not allowed on ${dayOfWeek} as per admin settings` },
            { status: 400 }
          );
        }
        
        // Check if the requested time is within global availability hours
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const [globalStartHour, globalStartMinute] = globalAvailability.startTime.split(':').map(Number);
        const [globalEndHour, globalEndMinute] = globalAvailability.endTime.split(':').map(Number);
        
        const requestedStartInMinutes = startHour * 60 + startMinute;
        const requestedEndInMinutes = endHour * 60 + endMinute;
        const globalStartInMinutes = globalStartHour * 60 + globalStartMinute;
        const globalEndInMinutes = globalEndHour * 60 + globalEndMinute;
        
        if (requestedStartInMinutes < globalStartInMinutes || requestedEndInMinutes > globalEndInMinutes) {
          return NextResponse.json(
            { error: 'Requested time is outside allowed booking hours as per admin settings' },
            { status: 400 }
          );
        }
      } else {
        // If no global availability record exists for this day, log a warning
        console.warn(`No global availability settings found for ${dayOfWeek}. Creating default settings.`);
      
        // If this is Sunday and we're creating a default record as unavailable, reject the booking
        if (dayOfWeek === 'Sunday') {
          return NextResponse.json(
            { error: `Bookings are not allowed on ${dayOfWeek} as per default admin settings` },
            { status: 400 }
          );
        }
      }
    }
    
    
    // Check for time conflicts with the instructor's schedule
    const existingInstructorBookings = await Booking.find({
      instructor: instructorId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    });
    
    const instructorBookingsForConflictCheck = existingInstructorBookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime,
      location: booking.location
    }));
    
    if (hasTimeConflict(startTime, endTime, location, instructorBookingsForConflictCheck)) {
      return NextResponse.json(
        { error: 'Time slot is not available due to scheduling conflicts with the instructor' },
        { status: 400 }
      );
    }
    
    // Check if the user already has a booking at the same time with any instructor
    const existingUserBookings = await Booking.find({
      user: userId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      status: { $ne: 'cancelled' }
    });
    
    // Check if any of the user's existing bookings conflict with the requested time
    const userHasConflict = existingUserBookings.some(booking => {
      const bookingStartTime = booking.startTime;
      const bookingEndTime = booking.endTime;
      
      // Convert times to minutes for easier comparison
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const [bookingStartHour, bookingStartMinute] = bookingStartTime.split(':').map(Number);
      const [bookingEndHour, bookingEndMinute] = bookingEndTime.split(':').map(Number);
      
      const newStartInMinutes = startHour * 60 + startMinute;
      const newEndInMinutes = endHour * 60 + endMinute;
      const existingStartInMinutes = bookingStartHour * 60 + bookingStartMinute;
      const existingEndInMinutes = bookingEndHour * 60 + bookingEndMinute;
      
      // Check if there's an overlap
      return (
        (newStartInMinutes >= existingStartInMinutes && newStartInMinutes < existingEndInMinutes) ||
        (newEndInMinutes > existingStartInMinutes && newEndInMinutes <= existingEndInMinutes) ||
        (newStartInMinutes <= existingStartInMinutes && newEndInMinutes >= existingEndInMinutes)
      );
    });
    
    if (userHasConflict) {
      return NextResponse.json(
        { error: 'You already have a booking at this time. Please select a different time slot.' },
        { status: 400 }
      );
    }
    
    // Check if this booking would complete a package
    // Count existing bookings by this user for this class type
    const userExistingBookings = await Booking.find({
      user: userId,
      classType,
      duration,
      status: { $ne: 'cancelled' }
    }).sort({ date: 1, startTime: 1 });
    
    const existingBookingsCount = userExistingBookings.length;
    
    console.log(`User ${userId} has ${existingBookingsCount} existing bookings for ${classType} (${duration} min)`);
    
    // Determine if this booking completes a package
    let isPackageComplete = false;
    let packageSize = 1;
    
    if (classType === 'class 5' && duration === 90) {
      packageSize = 3;
      if (existingBookingsCount === 2) {
        // This is the 3rd booking for Class 5 (90 min), complete the package
        isPackageComplete = true;
        console.log('Completing Class 5 package (3 lessons)');
      } else if (existingBookingsCount >= 3 && ((existingBookingsCount + 1) % 3) === 0) {
        // Only apply discount to every 3rd booking (3rd, 6th, 9th, etc.)
        isPackageComplete = true;
        console.log(`Completing another Class 5 package (booking #${existingBookingsCount + 1})`);
      }
    } else if (classType === 'class 7' && duration === 60) {
      packageSize = 10;
      if (existingBookingsCount === 9) {
        // This is the 10th booking for Class 7 (60 min), complete the package
        isPackageComplete = true;
        console.log('Completing Class 7 package (10 lessons)');
      } else if (existingBookingsCount >= 9 && ((existingBookingsCount + 1) % 10) === 0) {
        // Only apply discount to every 10th booking (10th, 20th, 30th, etc.)
        isPackageComplete = true;
        console.log(`Completing another Class 7 package (booking #${existingBookingsCount + 1})`);
      }
    }
    
    
    // Create a new booking with pending status
    const bookingData: Partial<IBooking> = {
      user: userId,
      instructor: instructorId,
      location,
      classType,
      package: packageType, // Always "1 lesson" as set in the form
      duration,
      date: new Date(date),
      startTime,
      endTime,
      status: 'pending',
      paymentStatus: 'requested', // Initial payment status, will be updated by admin
      termsAccepted: termsAccepted,
      termsAcceptedAt: new Date() // Always set to current date to ensure it's saved
    };

    // If termsAcceptedAt was provided in the request, use that instead
    if (termsAcceptedAt) {
      try {
        bookingData.termsAcceptedAt = new Date(termsAcceptedAt);
        console.log('Using provided termsAcceptedAt:', bookingData.termsAcceptedAt);
      } catch (error) {
        console.error('Error parsing termsAcceptedAt date:', error);
        // Keep the default current date if parsing fails
      }
    }
    
    // Set the price based on whether this is the last booking in a package
    if (isPackageComplete) {
      // Look up the package price from the Price model
      let packagePrice;
      
      try {
        // Try to get the package price from the Price model
        const packageType = classType === 'class 5' ? '3 lessons' : '10 lessons';
        const priceRecord = await Price.findOne({
          classType,
          duration,
          package: packageType
        });
        
        if (priceRecord && priceRecord.price) {
          packagePrice = priceRecord.price;
          console.log(`Found package price in database: $${packagePrice} for ${classType} (${duration} min, ${packageType})`);
        } else {
          // Fall back to default values if no price record is found
          if (classType === 'class 5' && duration === 90) {
            // Class 5 (90 min) package price: $262.50
            packagePrice = 262.50;
          } else if (classType === 'class 7' && duration === 60) {
            // Class 7 (60 min) package price: $892.50
            packagePrice = 892.50;
          }
          console.log(`Using default package price: $${packagePrice} for ${classType} (${duration} min, ${packageSize} lessons)`);
        }
      } catch (error) {
        console.error('Error fetching package price:', error);
        // Fall back to default values if there's an error
        if (classType === 'class 5' && duration === 90) {
          packagePrice = 262.50;
        } else if (classType === 'class 7' && duration === 60) {
          packagePrice = 892.50;
        }
      }
      
      if (packagePrice) {
        // Calculate the individual lesson price from the package
        const individualPrice = price;
        bookingData.price = individualPrice;
        
        // Add a note about the package discount
        bookingData.notes = `Last booking in a ${packageSize}-lesson package. Package discount applied.`;
      } else if (price !== undefined && !isNaN(Number(price))) {
        bookingData.price = Number(price);
      }
    } else if (price !== undefined && !isNaN(Number(price))) {
      // Use the provided price if not part of a package
      bookingData.price = Number(price);
    }
    
    const booking = await Booking.create(bookingData);
    
    // If this booking completes a package, update the previous bookings to note they're part of a package
    // but don't change their prices
    if (isPackageComplete) {
      // Get the previous bookings in this package
      const previousBookings = await Booking.find({
        user: userId,
        classType,
        duration,
        status: { $ne: 'cancelled' }
      }).sort({ date: 1, startTime: 1 }).limit(packageSize - 1);
      
      console.log(`Found ${previousBookings.length} previous bookings to update with package note`);
      
      // Update each previous booking with the package note only
      for (const prevBooking of previousBookings) {
        prevBooking.notes = `Part of a ${packageSize}-lesson package. Regular price applied.`;
        await prevBooking.save();
      }
    }
    
    // Get user and instructor details for email
    const userDetails = await User.findById(userId);
    const instructorDetailsRaw = await Instructor.findById(instructorId).populate('user');
    
    // Cast instructorDetails to include the populated user field
    const instructorDetails = instructorDetailsRaw as unknown as {
      user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
    
    // Send email notification to student
    if (userDetails?.email) {
      try {
        // Get instructor name
        const instructorName = instructorDetails?.user?.firstName 
          ? `${instructorDetails.user.firstName} ${instructorDetails.user.lastName}`
          : 'Your Instructor';
          
        await sendBookingPendingEmail(
          {
            ...booking.toObject(),
            user: userDetails,
            instructor: instructorDetailsRaw
          },
          instructorName
        );
        console.log('Booking pending email sent to student:', userDetails.email);
      } catch (emailError) {
        console.error('Error sending new booking email:', emailError);
        // Continue with booking creation even if email fails
      }
    }
    
    // Return the booking ID
    return NextResponse.json({ 
      bookingId: booking._id,
      emailSent: !!instructorDetails?.user?.email
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const instructorId = searchParams.get('instructorId');
    const status = searchParams.get('status');
    
    // Build query based on parameters
    const query: any = {};
    
    if (userId) {
      query.user = userId;
    }
    
    if (instructorId) {
      query.instructor = instructorId;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get bookings based on query
    const bookings = await Booking.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'firstName lastName email phone'
        }
      })
      .sort({ date: 1, startTime: 1 });
    
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { bookingId, status, price, reason } = body;
    
    // Validate required fields
    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
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
    
    const previousStatus = booking.status;
    
    // Update booking status and price if provided
    booking.status = status;
    
    // Only set price if it's provided and is a number
    if (price !== undefined && !isNaN(Number(price))) {
      booking.price = Number(price);
    }
    
    await booking.save();
    
    // If the booking is being approved, send a confirmation email
    if (status === 'approved' && previousStatus !== 'approved' && booking.user.email) {
      try {
        // Get instructor name
        const instructorName = booking.instructor?.user?.firstName 
          ? `${booking.instructor.user.firstName} ${booking.instructor.user.lastName}`
          : 'Your Instructor';
          
        await sendBookingConfirmationEmail(
          booking,
          instructorName
        );
        console.log('Booking confirmation email sent to student:', booking.user.email);
      } catch (emailError) {
        console.error('Error sending booking confirmation email:', emailError);
        // Continue with booking update even if email fails
      }
    }
    // If the booking is being rejected (status changed to 'cancelled'), send a rejection email
    else if (status === 'cancelled' && previousStatus !== 'cancelled' && booking.user.email) {
      try {
        // Get instructor name
        const instructorName = booking.instructor?.user?.firstName 
          ? `${booking.instructor.user.firstName} ${booking.instructor.user.lastName}`
          : 'Your Instructor';
          
        await sendBookingRejectedEmail(
          booking,
          instructorName,
          reason
        );
        console.log('Booking rejection email sent to student:', booking.user.email);
      } catch (emailError) {
        console.error('Error sending booking rejection email:', emailError);
        // Continue with booking update even if email fails
      }
    }
    
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

import { sendBookingCancellationEmail } from '@/lib/utils/emailService';
import { getServerSession } from 'next-auth';

// NextAuth configuration
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET
};

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if the user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    // Parse request body for additional data
    const body = await request.json();
    const { sendEmail = false, instructorName = 'Your Instructor' } = body;
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }
    
    // Check if booking exists and populate user and instructor details
    const booking = await Booking.findById(bookingId)
      .populate('user', 'firstName lastName email phone')
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
    
    // Send email notification if requested
    if (sendEmail && booking.user.email) {
      try {
        await sendBookingCancellationEmail(booking, instructorName);
        console.log('Cancellation email sent to:', booking.user.email);
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
        // Continue with deletion even if email fails
      }
    }
    
    // Delete booking
    await Booking.findByIdAndDelete(bookingId);
    
    return NextResponse.json({ 
      message: 'Booking deleted successfully',
      emailSent: sendEmail
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );    
  }
}