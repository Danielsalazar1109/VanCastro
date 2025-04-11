import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { seedDatabase } from '@/lib/db/seed';
import User from '@/models/User';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

/**
 * API route to seed the database with initial data.
 * This route is protected and can only be called by administrators.
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Verify admin status
    const user = await User.findOne({ email: session.user.email });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Run the seed script
    await seedDatabase();
    
    return NextResponse.json(
      { message: 'Database seeded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error seeding database:', error);
    
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}