import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Instructor, { IInstructor } from '@/models/Instructor';
import Schedule from '@/models/Schedule';
import Booking from '@/models/Booking';
import Location from '@/models/Location';
import { Document } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      locations, 
      classTypes,
      availability,
      absences,
      image
    } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Check if user is already an instructor
      const existingInstructor = await Instructor.findOne({ user: user._id });
      if (existingInstructor) {
        return NextResponse.json(
          { error: 'Instructor with this email already exists' },
          { status: 409 }
        );
      }
      
      // Update user role to instructor
      user.role = 'instructor';
      await user.save();
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create new user with instructor role
      user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword,
        role: 'instructor'
      });
    }
    
    // Create instructor
    const instructorData = await Instructor.create({
      user: user._id,
      availability: availability || [],
      absences: absences || [],
      teachingLocations: locations || [],
      image
    });
    
    // Cast to the correct type
    const instructor = instructorData as unknown as IInstructor & Document;
    
    // Populate user data
    await instructor.populate({ path: 'user' });
    
    return NextResponse.json({ instructor });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return NextResponse.json(
      { error: 'Failed to create instructor' },
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
    const location = searchParams.get('location');
    const checkDate = searchParams.get('checkDate');
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50'); // Default to 50 items per page
    const skip = (page - 1) * limit;
    
    // Build query based on parameters
    const query: any = {};
    
    if (instructorId) {
      query._id = instructorId;
    }
    
    // Get total count for pagination info (before location filtering)
    const totalCount = await Instructor.countDocuments(query);
    
    // Get instructors based on query with pagination
    let instructors = await Instructor.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ 'user.firstName': 1, 'user.lastName': 1 })
      .skip(skip)
      .limit(limit);
    
  // Filter instructors by location if specified
  if (location) {
    // Filter instructors by teachingLocations
    instructors = instructors.filter((instructor: any) => {
      return instructor.teachingLocations && 
             instructor.teachingLocations.length > 0 && 
             instructor.teachingLocations.includes(location);
    });
  } else {
    // Even if no location is specified, filter out instructors with empty teachingLocations
    instructors = instructors.filter((instructor: any) => {
      return instructor.teachingLocations && instructor.teachingLocations.length > 0;
    });
  }
    
    // Filter out instructors who are absent on the specified date
    if (checkDate) {
      const date = new Date(checkDate);
      
      // Filter out instructors who have absences that include the check date
      instructors = instructors.filter((instructor: any) => {
        if (!instructor.absences || instructor.absences.length === 0) {
          return true; // Keep instructors with no absences
        }
        
        // Check if any absence period includes the check date
        return !instructor.absences.some((absence: any) => {
          const startDate = new Date(absence.startDate);
          const endDate = new Date(absence.endDate);
          return date >= startDate && date <= endDate;
        });
      });
    }
    
    // Calculate filtered count after in-memory filtering
    const filteredCount = instructors.length;
    
    // Calculate total pages based on the filtered count
    // This is an estimate since we're doing in-memory filtering
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({ 
      instructors,
      pagination: {
        totalCount,
        filteredCount,
        totalPages,
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructors' },
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
    const { 
      instructorId, 
      firstName, 
      lastName, 
      email, 
      phone, 
      locations, 
      classTypes,
      availability,
      absences,
      image
    } = body;
    
    // Validate required fields
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }
    
    // Check if instructor exists
    const instructor = await Instructor.findById(instructorId) as IInstructor & Document;
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }
    
    // Update availability if provided
    if (availability) instructor.availability = availability;
    
    // Update absences if provided
    if (absences) instructor.absences = absences;
    
    // Update image if provided
    if (image !== undefined) instructor.image = image;
    
    // Update teachingLocations if provided
    if (locations) instructor.teachingLocations = locations;
    
    await instructor.save();
    
    // Update user fields if provided
    if (firstName || lastName || email || phone) {
      const user = await User.findById(instructor.user);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User associated with instructor not found' },
          { status: 404 }
        );
      }
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      
      // If email is changing, check if it's already in use
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json(
            { error: 'Email is already in use' },
            { status: 409 }
          );
        }
        user.email = email;
      }
      
      await user.save();
    }
    
    // Get updated instructor with user data
    const updatedInstructor = await Instructor.findById(instructorId)
      .populate('user', 'firstName lastName email phone');
    
    return NextResponse.json({ instructor: updatedInstructor });
  } catch (error) {
    console.error('Error updating instructor:', error);
    return NextResponse.json(
      { error: 'Failed to update instructor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const instructorId = searchParams.get('instructorId');
    
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      );
    }
    
    // Check if instructor exists
    const instructor = await Instructor.findById(instructorId) as unknown as IInstructor & Document;
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor not found' },
        { status: 404 }
      );
    }
    
    // Check if there are any bookings for this instructor
    const bookings = await Booking.find({
      instructor: instructorId,
      status: { $nin: ['cancelled', 'completed'] }
    });
    
    if (bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete instructor with active bookings' },
        { status: 400 }
      );
    }
    
    // Delete instructor's schedules
    await Schedule.deleteMany({ instructor: instructorId });
    
    // Delete instructor
    await Instructor.findByIdAndDelete(instructorId);
    
    // Update user role if no other instructor profile exists
    const user = await User.findById(instructor.user);
    if (user) {
      user.role = 'user';
      await user.save();
    }
    
    return NextResponse.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return NextResponse.json(
      { error: 'Failed to delete instructor' },
      { status: 500 }
    );
  }
}