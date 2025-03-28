'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      setError('Booking ID is missing. Please try again.');
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        // Since the API doesn't support direct bookingId queries, we'll fetch and filter
        const response = await fetch('/api/booking');
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        
        if (!data.bookings || data.bookings.length === 0) {
          throw new Error('No bookings found');
        }
        
        // Find the booking with the matching ID
        const booking = data.bookings.find((b: any) => b._id === bookingId);
        
        if (!booking) {
          throw new Error('Booking not found');
        }
        
        // Format the booking details
          setBookingDetails({
            firstName: booking.user.firstName,
            lastName: booking.user.lastName,
            email: booking.user.email,
            date: new Date(booking.date).toLocaleDateString(),
            timeSlot: booking.startTime,
            service: booking.classType,
            confirmationNumber: 'DRV-' + booking._id.substring(0, 6).toUpperCase(),
            price: booking.price,
            package: booking.package,
            duration: booking.duration
          });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch booking details');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-4">Processing Your Booking</h1>
          <p className="text-gray-600 mb-8">Please wait while we confirm your booking...</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link href="/booking" className="btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-yellow-600 mb-2">Booking Submitted!</h1>
          <p className="text-gray-600">
            Your driving lesson has been successfully booked and is now pending approval.
            You can track the status of your booking in the tracking page.
          </p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-medium">
                {bookingDetails.firstName} {bookingDetails.lastName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p className="font-medium">{bookingDetails.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Date</p>
              <p className="font-medium">{bookingDetails.date}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Time</p>
              <p className="font-medium">{bookingDetails.timeSlot}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Service</p>
              <p className="font-medium">{bookingDetails.service}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Confirmation Number</p>
              <p className="font-medium">{bookingDetails.confirmationNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Package</p>
              <p className="font-medium">{bookingDetails.package}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Duration</p>
              <p className="font-medium">{bookingDetails.duration} minutes</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Price</p>
              <p className="font-medium text-green-600">${bookingDetails.price?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            A confirmation email has been sent to {bookingDetails.email} with all the details.
          </p>
          <Link href="/tracking" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg transition-all duration-300">
            Track Your Booking
          </Link>
          <Link href="/" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg ml-4 transition-all duration-300">
            Return to Home
          </Link>
          <Link href="/booking" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg ml-4 transition-all duration-300">
            Book Another Lesson
          </Link>
        </div>
      </div>
    </div>
  );
}
