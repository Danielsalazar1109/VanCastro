import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

/**
 * This API route handles redirecting authenticated users based on their role.
 * It's used by the middleware to redirect users who are already logged in
 * when they try to access public pages like login or register.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession();
    console.log('Session in session-redirect API:', session);

    // If there's no session, redirect to login
    if (!session?.user) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has a phone number
    if (!session.user.phone || session.user.phone === "") {
      console.log("User doesn't have a phone number, redirecting to complete profile page");
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }

    // Redirect based on user role
    const userRole = session.user.role;
    console.log('User role in session-redirect API:', userRole);

    if (userRole === 'admin') {
      console.log('Redirecting admin to admin dashboard');
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (userRole === 'instructor') {
      console.log('Redirecting instructor to instructor dashboard');
      return NextResponse.redirect(new URL('/instructor', request.url));
    } else {
      console.log('Redirecting user to student dashboard');
      return NextResponse.redirect(new URL('/student', request.url));
    }
  } catch (error) {
    console.error('Error in session-redirect API:', error);
    // In case of error, redirect to the login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
}