import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';

/**
 * This API route handles redirection after authentication based on user role.
 * It's used specifically for Google authentication where the redirect callback
 * in NextAuth doesn't have access to the session data.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Session redirect called');
    console.log('Request URL:', request.url);
    console.log('Base URL:', request.nextUrl.origin);
    
    // Get the session from the server
    const session = await getServerSession();
    console.log('Session:', JSON.stringify(session, null, 2));

    // Get the callback URL from the query string (if any)
    const searchParams = request.nextUrl.searchParams;
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    console.log('Callback URL:', callbackUrl);

    // If no session is found, redirect to the login page
    if (!session || !session.user) {
      console.log('No session found, redirecting to login page');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Connect to the database and get user details
    await connectToDatabase();
    const userEmail = session.user.email;
    console.log('Looking up user with email:', userEmail);
    
    const dbUser = await User.findOne({ email: userEmail });
    console.log('Database user:', dbUser ? JSON.stringify({
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone
    }, null, 2) : 'User not found');

    if (!dbUser) {
      console.log('User not found in database, redirecting to login page');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Use the role and phone from the database
    const userRole = dbUser.role;
    const userPhone = dbUser.phone;
    
    console.log('User role from DB:', userRole);
    console.log('User phone from DB:', userPhone);

    // Check if the user has a phone number
    if (!userPhone || userPhone === '') {
      console.log('User has no phone number, redirecting to complete-profile page');
      return NextResponse.redirect(
        new URL(`/complete-profile?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.url)
      );
    }

    // Redirect based on user role
    if (userRole === 'admin') {
      console.log('User is admin, redirecting to admin page');
      const redirectUrl = new URL('/admin', request.url);
      console.log('Admin redirect URL:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    } else if (userRole === 'instructor') {
      console.log('User is instructor, redirecting to instructor page');
      return NextResponse.redirect(new URL('/instructor', request.url));
    } else if (userRole === 'user') {
      console.log('User is regular user, redirecting to student page');
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Default fallback
    console.log('No specific role found, redirecting to callback URL:', callbackUrl);
    console.log('Redirect URL:', new URL(callbackUrl, request.url).toString());
    return NextResponse.redirect(new URL(callbackUrl, request.url));
  } catch (error) {
    console.error('Error in session-redirect:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    // In case of error, redirect to the login page
    return NextResponse.redirect(new URL('/', request.url));
  }
}