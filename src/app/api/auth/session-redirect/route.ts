import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/db/mongodb';
import User from '@/models/User';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
    console.log('NODE_ENV:', process.env.NODE_ENV);
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
    
    // Try to find the user by email or by googleId if available
    let dbUser = null;
    
    if (userEmail) {
      dbUser = await User.findOne({ email: userEmail });
      console.log('User found by email:', dbUser ? 'Yes' : 'No');
    }
    
    // If user not found and we have a Google ID in the session, try to find by Google ID
    if (!dbUser && session.user.id) {
      dbUser = await User.findOne({ googleId: session.user.id });
      console.log('User found by Google ID:', dbUser ? 'Yes' : 'No');
    }
    console.log('Database user:', dbUser ? JSON.stringify({
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      phone: dbUser.phone
    }, null, 2) : 'User not found');

    if (!dbUser) {
      console.log('User not found in database, checking if this is a Google auth');
      
      // Check if this is a Google auth by looking for specific query parameters
      const isGoogleAuth = request.url.includes('callback/google') || 
                          searchParams.get('provider') === 'google' ||
                          request.headers.get('referer')?.includes('accounts.google.com');
      
      console.log('Is Google auth:', isGoogleAuth);
      console.log('Referer:', request.headers.get('referer'));
      
      if (isGoogleAuth && userEmail) {
        console.log('Google auth detected, creating new user');
        
        // Create a new user with the Google email
        dbUser = new User({
          firstName: session.user.name?.split(' ')[0] || '',
          lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
          email: userEmail,
          phone: '',
          role: 'user',
          googleId: session.user.id || '',
        });
        
        await dbUser.save();
        console.log('New user created:', dbUser._id.toString());
      } else {
        console.log('Not a Google auth or no email, redirecting to login page');
        return NextResponse.redirect(new URL('/login', request.url));
      }
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
    // Ensure we're using the correct base URL for redirects in production
    // Use NEXTAUTH_URL from environment variables to avoid hardcoding
    const baseUrl = process.env.NODE_ENV === "production" 
      ? (process.env.NEXTAUTH_URL || request.nextUrl.origin)
      : request.nextUrl.origin;
    
    console.log('Using base URL for redirects:', baseUrl);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    
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
    return NextResponse.redirect(new URL('/login', request.url));
  }
}