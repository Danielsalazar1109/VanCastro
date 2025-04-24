import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  try {
    console.log("Session redirect endpoint called");
    
    // Get the session from the server
    const session = await getServerSession();
    console.log("Session in redirect endpoint:", session);

    // If no session, redirect to login
    if (!session || !session.user) {
      console.log("No session found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user has a phone number
    if (!session.user.phone || session.user.phone === "") {
      console.log("User doesn't have a phone number, redirecting to complete profile page");
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }

    // Redirect based on user role
    const role = session.user.role;
    console.log(`User role is ${role}, redirecting accordingly`);

    if (role === "user") {
      return NextResponse.redirect(new URL("/student", request.url));
    } else if (role === "instructor") {
      return NextResponse.redirect(new URL("/instructor", request.url));
    } else if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      // Fallback to home page if role is not recognized
      console.log("User role not recognized, redirecting to home page");
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch (error) {
    console.error("Error in session redirect:", error);
    // In case of error, redirect to login page
    return NextResponse.redirect(new URL("/login", request.url));
  }
}