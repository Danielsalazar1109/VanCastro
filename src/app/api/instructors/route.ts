import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import Schedule from '@/models/Schedule';
import Booking from '@/models/Booking';

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
      availability 
    } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password || !locations || !classTypes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate locations
    if (locations && locations.length > 0) {
      const validLocations = ['Surrey', 'Burnaby', 'North Vancouver'];
      const invalidLocations = locations.filter((loc: string) => !validLocations.includes(loc));
      
      if (invalidLocations.length > 0) {
        return NextResponse.json(
          { error: 'One or more selected locations are invalid' },
          { status: 400 }
        );
      }
    }
    
    // Validate class types
    if (classTypes && classTypes.length > 0) {
      const validClassTypes = ['class 4', 'class 5', 'class 7'];
      const invalidClassTypes = classTypes.filter((type: string) => !validClassTypes.includes(type));
      
      if (invalidClassTypes.length > 0) {
        return NextResponse.json(
          { error: 'One or more selected class types are invalid' },
          { status: 400 }
        );
      }
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
    const instructor = await Instructor.create({
      user: user._id,
      locations,
      classTypes,
      availability: availability || []
    });
    
    // Populate user data
    await instructor.populate('user');
    
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
    const location = searchParams.get('location');
    const classType = searchParams.get('classType');
    const instructorId = searchParams.get('instructorId');
    
    // Build query based on parameters
    const query: any = {};
    
    if (instructorId) {
      query._id = instructorId;
    }
    
    if (location) {
      query.locations = location;
    }
    
    if (classType) {
      query.classTypes = classType;
    }
    
    // Get instructors based on query
    const instructors = await Instructor.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ 'user.firstName': 1, 'user.lastName': 1 });
    
    return NextResponse.json({ instructors });
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
      availability 
    } = body;
    
    // Validate required fields
    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
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
    
    // Validate locations if provided
    if (locations && locations.length > 0) {
      const validLocations = ['Surrey', 'Burnaby', 'North Vancouver'];
      const invalidLocations = locations.filter((loc: string) => !validLocations.includes(loc));
      
      if (invalidLocations.length > 0) {
        return NextResponse.json(
          { error: 'One or more selected locations are invalid' },
          { status: 400 }
        );
      }
      
      instructor.locations = locations;
    }
    
    // Validate class types if provided
    if (classTypes && classTypes.length > 0) {
      const validClassTypes = ['class 4', 'class 5', 'class 7'];
      const invalidClassTypes = classTypes.filter((type: string) => !validClassTypes.includes(type));
      
      if (invalidClassTypes.length > 0) {
        return NextResponse.json(
          { error: 'One or more selected class types are invalid' },
          { status: 400 }
        );
      }
      
      instructor.classTypes = classTypes;
    }
    
    // Update availability if provided
    if (availability) instructor.availability = availability;
    
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
    const instructor = await Instructor.findById(instructorId);
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