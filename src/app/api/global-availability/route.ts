import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import GlobalAvailability from '@/models/GlobalAvailability';
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

// GET: Fetch all global availability settings
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get the current date
    const currentDate = new Date();
    
    // Get all global availability settings
    // First, get settings with no date range
    const noDateRangeSettings = await GlobalAvailability.find({
      $or: [
        { startDate: { $exists: false } },
        { endDate: { $exists: false } }
      ]
    }).sort({ day: 1 });
    
    // Then, get settings with date ranges that include the current date
    const dateRangeSettings = await GlobalAvailability.find({
      startDate: { $exists: true, $lte: currentDate },
      endDate: { $exists: true, $gte: currentDate }
    }).sort({ day: 1 });
    
    // Combine the results, prioritizing date range settings
    const dayToSettingMap = new Map();
    
    // First add no date range settings
    noDateRangeSettings.forEach(setting => {
      dayToSettingMap.set(setting.day, setting);
    });
    
    // Then override with date range settings if they exist
    dateRangeSettings.forEach(setting => {
      dayToSettingMap.set(setting.day, setting);
    });
    
    // Convert map to array
    const globalAvailability = Array.from(dayToSettingMap.values());
    
    return NextResponse.json({ globalAvailability });
  } catch (error) {
    console.error('Error fetching global availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global availability settings' },
      { status: 500 }
    );
  }
}

// POST: Create or update global availability settings
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage global availability settings.' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { day, startTime, endTime, isAvailable, startDate, endDate } = body;
    
    // Validate required fields
    if (!day || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the day is valid - ensure days are in correct order
    // Sunday should be first to match JavaScript's Date.getDay() which returns 0 for Sunday
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (!validDays.includes(day)) {
      return NextResponse.json(
        { error: 'Invalid day. Must be one of: ' + validDays.join(', ') },
        { status: 400 }
      );
    }
    
    console.log(`Creating/updating global availability for day: ${day}, isAvailable: ${isAvailable}, startDate: ${startDate}, endDate: ${endDate}`);
    
    // Prepare the update object
    const updateData: any = { day, startTime, endTime, isAvailable };
    
    // Add date range if provided
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    
    // Create or update global availability setting
    // If we have a date range, we need to find by day AND date range
    const query: any = { day };
    if (startDate) query.startDate = new Date(startDate);
    if (endDate) query.endDate = new Date(endDate);
    
    const updatedAvailability = await GlobalAvailability.findOneAndUpdate(
      query,
      updateData,
      { new: true, upsert: true }
    );
    
    return NextResponse.json({ globalAvailability: updatedAvailability });
  } catch (error) {
    console.error('Error updating global availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to update global availability settings' },
      { status: 500 }
    );
  }
}

// PUT: Update multiple global availability settings at once
export async function PUT(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can manage global availability settings.' },
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
    
    // Validate each availability setting - ensure days are in correct order
    // Sunday should be first to match JavaScript's Date.getDay() which returns 0 for Sunday
    const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (const setting of availabilitySettings) {
      const { day, startTime, endTime, isAvailable, startDate, endDate } = setting;
      
      if (!day || !startTime || !endTime) {
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
      
      console.log(`Validating global availability for day: ${day}, isAvailable: ${isAvailable}, startDate: ${startDate}, endDate: ${endDate}`);
    }
    
    // Update each availability setting
    const updatedSettings = [];
    for (const setting of availabilitySettings) {
      const { day, startTime, endTime, isAvailable, startDate, endDate } = setting;
      
      console.log(`Updating global availability for ${day}: ${startTime} - ${endTime}, isAvailable: ${isAvailable}, startDate: ${startDate}, endDate: ${endDate}`);
      
      // Prepare the update object
      const updateData: any = { day, startTime, endTime, isAvailable };
      
      // Add date range if provided
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      
      // If we have a date range, we need to find by day AND date range or create a new record
      // This allows multiple records for the same day with different date ranges
      let query: any = { day };
      
      // If we have date ranges, include them in the query
      if (startDate && endDate) {
        // First try to find an exact match with the same date range
        const existingWithDateRange = await GlobalAvailability.findOne({
          day,
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        });
        
        if (existingWithDateRange) {
          // If we found an exact match, update it
          query = { 
            _id: existingWithDateRange._id 
          };
        } else {
          // If no exact match, create a new record
          // We'll use the day and a unique ID that doesn't exist to force an upsert
          query = { 
            day,
            _id: undefined // This ensures we create a new record
          };
        }
      }
      
      const updatedSetting = await GlobalAvailability.findOneAndUpdate(
        query,
        updateData,
        { new: true, upsert: true }
      );
      
      console.log(`Updated global availability for ${day}:`, updatedSetting);
      
      updatedSettings.push(updatedSetting);
    }
    
    return NextResponse.json({ globalAvailability: updatedSettings });
  } catch (error) {
    console.error('Error updating global availability settings:', error);
    return NextResponse.json(
      { error: 'Failed to update global availability settings' },
      { status: 500 }
    );
  }
}