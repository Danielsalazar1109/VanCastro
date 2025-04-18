import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, email, phone } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      role: 'user'
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
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
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const includeBookings = searchParams.get('bookings') === 'true';
    
    // Build query based on parameters
    const query: any = {};
    
    if (userId) {
      query._id = userId;
    }
    
    if (email) {
      query.email = email;
    }
    
    if (role) {
      query.role = role;
    }
    
    // Get users based on query
    let users = await User.find(query)
      .sort({ firstName: 1, lastName: 1 });

      if (includeBookings && userId) {
        users = await User.find(query)
        .populate({
          path: 'bookings',
          populate: {
            path: 'instructor',
            model: 'Instructor'
          }
        })
      }
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
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
    const { userId, firstName, lastName, email, phone, role } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
    
    // Update user fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    
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
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    const { userId, document } = body;
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
    
    // Update document field
    user.document = document;
    await user.save();
    
    return NextResponse.json({ 
      message: 'Document updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user document:', error);
    return NextResponse.json(
      { error: 'Failed to update user document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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
    
    // Check if user has any bookings
    const bookings = await Booking.find({ user: userId });
    if (bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing bookings' },
        { status: 400 }
      );
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}