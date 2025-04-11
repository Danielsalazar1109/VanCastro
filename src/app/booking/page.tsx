"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PlansGrid from "@/components/plans/PlansGrid";
import NewBookingForm from "@/components/forms/NewBookingForm";
import PhoneNumberForm from "@/components/forms/PhoneNumberForm";
import LoadingComponent from "@/components/layout/Loading";

export default function BookingPage() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  
  useEffect(() => {
    const packageParam = searchParams.get('package');
    if (packageParam) {
      setSelectedPackage(packageParam);
    }
    
    // If user is authenticated, fetch their MongoDB user ID and details
    if (status === 'authenticated' && session?.user?.email) {
      fetchUserDetails(session.user.email);
    } else {
      setLoading(false);
    }
  }, [searchParams, session, status]);
  
  const fetchUserDetails = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        setUserId(user._id);
        setUserDetails(user);
        
        // Check if user has pending bookings
        if (user._id) {
          checkPendingBookings(user._id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setLoading(false);
    }
  };
  
  const checkPendingBookings = async (userId: string) => {
    try {
      const response = await fetch(`/api/booking?userId=${userId}&status=pending`);
      const data = await response.json();
      
      if (data.bookings && data.bookings.length > 0) {
        setHasPendingBooking(true);
      } else {
        setHasPendingBooking(false);
      }
    } catch (error) {
      console.error('Error checking pending bookings:', error);
    }
  };
  
  const handlePhoneNumberAdded = () => {
    // Refresh user details after phone number is added
    if (session?.user?.email) {
      fetchUserDetails(session.user.email);
    }
  };
  
  const handleSelectPackage = (link: string) => {
    setSelectedPackage(link);
  };
  
  // If still loading
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <LoadingComponent showText={true} />
      </div>
    );
  }
  
  // If user is not authenticated, show login prompt
  if (status === 'unauthenticated') {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Login Required</h2>
          <p className="mb-6 text-center">
            You need to be logged in to book a driving lesson.
          </p>
          <div className="flex flex-col gap-4">
            <Link 
              href="/login" 
              className="w-full py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg text-center"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-black font-bold rounded-lg text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If authenticated but no phone number, show phone number form
  if (status === 'authenticated' && userId && userDetails && (!userDetails.phone || userDetails.phone === '')) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center bg-white py-10">
        <div className="my-12 w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-8">Complete Your Profile</h2>
          <div className="mb-6 max-w-md text-center">
            <p className="text-gray-700">
              Before you can book a driving lesson, we need your phone number to contact you about your bookings.
            </p>
          </div>
          <PhoneNumberForm userId={userId} onPhoneNumberAdded={handlePhoneNumberAdded} />
        </div>
      </div>
    );
  }
  
  // If user has a pending booking, show error message
  if (hasPendingBooking) {
   return (
  <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border-l-4 border-red-500">
      <h2 className="text-2xl font-bold mb-4 text-center text-red-600">Pending Reservation</h2>
      <div className="mb-6 p-4 bg-red-50 rounded-lg">
        <p className="mb-4 text-gray-800">
          You have a pending reservation that requires payment confirmation.
        </p>
        <p className="mb-4 text-gray-800">
          Please contact administration to confirm your payment before scheduling new classes.
        </p>
        <p className="text-sm text-gray-600">
          You can contact administration by phone or email to resolve this matter.
        </p>
      </div>
      <div className="flex justify-center">
        <Link 
          href="/tracking" 
          className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg text-center"
        >
          Track your booking status
        </Link>
      </div>
    </div>
  </div>
);
  }
  
  // If all checks pass, show the booking form
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white py-10">
      <NewBookingForm userId={userId || ''} />
    </div>
  )
}