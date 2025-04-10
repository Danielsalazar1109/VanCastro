import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
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

// POST: Fix global availability indexes
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if user is authenticated and has admin role
    const session = await getServerSession();
    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can fix global availability indexes.' },
        { status: 403 }
      );
    }
    
    // Get the GlobalAvailability model
    const { default: GlobalAvailability } = await import('@/models/GlobalAvailability');
    
    // Get the MongoDB collection directly
    const collection = GlobalAvailability.collection;
    
    // Drop the existing index on the "day" field
    try {
      await collection.dropIndex('day_1');
      console.log('Successfully dropped index day_1');
    } catch (error) {
      console.log('Index day_1 might not exist, continuing...');
    }
    
    // Create a new non-unique index on the "day" field
    await collection.createIndex({ day: 1 }, { unique: false });
    console.log('Successfully created non-unique index on day field');
    
    // Create a compound index on day, startDate, and endDate
    await collection.createIndex(
      { day: 1, startDate: 1, endDate: 1 },
      { 
        unique: true,
        partialFilterExpression: {
          $and: [
            { startDate: { $type: "date" } },
            { endDate: { $type: "date" } }
          ]
        }
      }
    );
    console.log('Successfully created compound index on day, startDate, and endDate fields');
    
    return NextResponse.json({ 
      success: true,
      message: 'Global availability indexes fixed successfully. You can now save global availability settings with date ranges.'
    });
  } catch (error) {
    console.error('Error fixing global availability indexes:', error);
    return NextResponse.json(
      { error: 'Failed to fix global availability indexes' },
      { status: 500 }
    );
  }
}