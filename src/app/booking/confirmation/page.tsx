'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    // In a real implementation, you would fetch the booking details from your API
    // using the session ID from Stripe
    const fetchBookingDetails = async () => {
      try {
        // This is a mock implementation
        // In reality, you would call your API to get the booking details
        // const response = await fetch(`/api/booking/confirmation?sessionId=${sessionId}`);
        // const data = await response.json();
        
        // For demo purposes, we'll just simulate a successful response
        setTimeout(() => {
          setBookingDetails({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            date: '2023-09-15',
            timeSlot: '10:00 AM',
            service: 'Beginner Lessons',
            confirmationNumber: 'DRV-' + Math.floor(100000 + Math.random() * 900000),
          });
          setLoading(false);
        }, 1500);
      } catch (err) {
        setError('Failed to fetch booking details');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId]);

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
          <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your driving lesson has been successfully booked and payment has been processed.
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
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            A confirmation email has been sent to {bookingDetails.email} with all the details.
          </p>
          <Link href="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
