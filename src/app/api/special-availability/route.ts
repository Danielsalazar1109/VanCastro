import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import SpecialAvailability from '@/models/SpecialAvailability';
import { getServerSession } from 'next-auth';

// Helper function to check if user is admin
async function isAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  
  try {
    const { default: User } = await import('@/models/User');
    const user = await User.findOne({ email });
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// GET: Fetch all special availability settings
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage special availability settings.' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const checkDate = searchParams.get('checkDate');
    
    let query: any = {};
    
    // If checkDate is provided, filter by date range
    if (checkDate) {
      const date = new Date(checkDate);
      query = {
        startDate: { $lte: date },
        endDate: { $gte: date }
      };
    }
    
    // Get all special availability settings matching the query
    const specialAvailability = await SpecialAvailability.find(query).sort({ day: 1 });
    
    return NextResponse.json({ specialAvailability });
  } catch (error) {
    console.error('Error fetching special availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special availability settings' },
      { status: 500 }
    );
  }
}

// POST: Create or update special availability settings
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage special availability settings.' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { day, startTime, endTime, isAvailable, startDate, endDate } = body;
    
    // Validate required fields
    if (!day || !startTime || !endTime || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the day is valid
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!validDays.includes(day)) {
      return NextResponse.json(
        { error: 'Invalid day. Must be one of: ' + validDays.join(', ') },
        { status: 400 }
      );
    }
    
    // Create or update special availability setting
    const updatedAvailability = await SpecialAvailability.findOneAndUpdate(
      {
        day,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      {
        day,
        startTime,
        endTime,
        isAvailable,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ specialAvailability: updatedAvailability });
  } catch (error) {
    console.error('Error updating special availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to update special availability settings' },
      { status: 500 }
    );
  }
}

// PUT: Update multiple special availability settings at once
export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage special availability settings.' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { availabilitySettings } = body;
    
    // Validate request body
    if (!availabilitySettings || !Array.isArray(availabilitySettings)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected an array of availability settings.' },
        { status: 400 }
      );
    }
    
    // Validate each availability setting
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const setting of availabilitySettings) {
      const { day, startTime, endTime, isAvailable, startDate, endDate } = setting;
      
      if (!day || !startTime || !endTime || !startDate || !endDate) {
        return NextResponse.json(
          { error: 'Missing required fields in one or more availability settings' },
          { status: 400 }
        );
      }
      
      if (!validDays.includes(day)) {
        return NextResponse.json(
          { error: `Invalid day: ${day}. Must be one of: ${validDays.join(', ')}` },
          { status: 400 }
        );
      }
    }
    
    // Update each availability setting
    const updatedSettings = [];
    for (const setting of availabilitySettings) {
      const { day, startTime, endTime, isAvailable, startDate, endDate } = setting;
      
      const updatedSetting = await SpecialAvailability.findOneAndUpdate(
        {
          day,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        {
          day,
          startTime,
          endTime,
          isAvailable,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        },
        { new: true, upsert: true }
      );
      
      updatedSettings.push(updatedSetting);
    }
    
    return NextResponse.json({ specialAvailability: updatedSettings });
  } catch (error) {
    console.error('Error updating special availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to update special availability settings' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a special availability setting
export async function DELETE(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage special availability settings.' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }
    
    // Delete the special availability setting
    const deletedAvailability = await SpecialAvailability.findByIdAndDelete(id);
    
    if (!deletedAvailability) {
      return NextResponse.json(
        { error: 'Special availability setting not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting special availability setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete special availability setting' },
      { status: 500 }
    );
  }
}