'use client'
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import DocumentUpload from "@/components/forms/DocumentUpload";
import { useState, useEffect } from "react";
import { Clock, LogOut, MapPin, UserCheck, Calendar, Trash } from "lucide-react";

// Definition of Booking type
interface Booking {
  _id: string;
  classType: string;
  package: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price?: number;
  instructor?: {
    user?: {
      firstName: string;
      lastName: string;
    }
  };
  createdAt?: string;
}

// Countdown component to handle real-time updates
const CountdownTimer = ({ createdAt }: { createdAt: string }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("00:00:00");

  useEffect(() => {
    // Function to calculate and update remaining time
    const updateRemainingTime = () => {
      const createdDate = new Date(createdAt);
      const expirationDate = new Date(createdDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
      const now = new Date();
      
      const difference = expirationDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeRemaining("Expired");
        return;
      }
      
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // Initial update
    updateRemainingTime();

    // Set up interval to update every second
    const timer = setInterval(updateRemainingTime, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <span className="text-4xl text-red-500 font-bold">
      Time Remaining: {timeRemaining}
    </span>
  );
};

export default function Tracking() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // State to track if there are any pending bookings
  const [hasPendingBookings, setHasPendingBookings] = useState<boolean>(false);
  const [lastBookingStatuses, setLastBookingStatuses] = useState<{[key: string]: string}>({});

  // Handle deleting a booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }
    
    setIsDeleting(bookingId);
    
    try {
      const response = await fetch(`/api/booking?bookingId=${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sendEmail: false
        }),
      });
      
      if (response.ok) {
        // Remove the booking from the state
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete booking");
      }
    } catch (err) {
      setError("An error occurred while deleting the booking");
    } finally {
      setIsDeleting(null);
    }
  };

  // Function to fetch bookings
  const fetchBookings = async (showLoading = true) => {
    if (status === "authenticated" && session?.user) {
      if (showLoading) setIsLoading(true);
      try {
        const response = await fetch(`/api/users?userId=${session.user.id}&bookings=true`);
        const data = await response.json();
        
        if (response.ok) {
          const userBookings = data.users[0]?.bookings || [];
          
          // Check if we need to fetch from the bookings API
          if (userBookings.length === 0) {
            try {
              const bookingsResponse = await fetch(`/api/booking?userId=${session.user.id}`);
              const bookingsData = await bookingsResponse.json();
              
              if (bookingsResponse.ok && bookingsData.bookings) {
                processBookings(bookingsData.bookings);
              }
            } catch (err) {
              console.error("Error fetching from bookings API:", err);
            }
          } else {
            processBookings(userBookings);
          }
        } else {
          if (showLoading) setError(data.error || "Failed to fetch bookings");
        }
      } catch (err) {
        if (showLoading) setError("An error occurred while fetching bookings");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    }
  };

  // Process bookings and check for status changes
  const processBookings = (newBookings: Booking[]) => {
    // Check if there are any pending bookings
    const pendingExists = newBookings.some(booking => booking.status === 'pending');
    setHasPendingBookings(pendingExists);
    
    // Check for status changes, especially from pending to approved
    const newStatusMap: {[key: string]: string} = {};
    let statusChanged = false;
    
    newBookings.forEach(booking => {
      newStatusMap[booking._id] = booking.status;
      
      // Check if this booking's status has changed
      if (lastBookingStatuses[booking._id] && 
          lastBookingStatuses[booking._id] !== booking.status &&
          lastBookingStatuses[booking._id] === 'pending' && 
          booking.status === 'approved') {
        statusChanged = true;
      }
    });
    
    // Update the status map
    setLastBookingStatuses(newStatusMap);
    
    // Update bookings state
    setBookings(newBookings);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchBookings(true);
  }, [status, session]);
  
  // Set up polling for bookings updates, focusing on status changes
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Set up polling every 3 seconds
      const pollingInterval = setInterval(() => {
        fetchBookings(false);
      }, 3000);
      
      // Clean up interval on component unmount
      return () => clearInterval(pollingInterval);
    }
  }, [status, session]);

  // Unauthenticated view
  if (status === "unauthenticated") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-yellow-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-yellow-600 mb-4">Welcome Back</h2>
            <p className="text-gray-600 mb-6">
              Login to access your driving lesson tracking
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 text-center inline-block"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 text-center inline-block"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  } 
  
  // Authenticated view
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Driving Lessons</h1>
              <p className="text-gray-600">Welcome, {session.user.name}</p>
            </div>
            {/* Logout button moved to navbar */}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-xl text-gray-500">Loading lessons...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <img 
                src="/api/placeholder/400/300" 
                alt="No bookings" 
                className="mx-auto mb-6 rounded-xl"
              />
              <p className="text-gray-600 mb-4">No driving lessons booked yet</p>
              <Link 
                href="/booking" 
                className="inline-block px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Book a Lesson
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          {booking.classType || 'Driving Lesson'}
                        </h2>
                        <p className="text-gray-600">{booking.package || 'Standard Package'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        
                      {booking.status === 'cancelled' && (
                      <button
                       onClick={(e) => {
                      e.preventDefault();
                      handleDeleteBooking(booking._id);
                    }}
                     disabled={isDeleting === booking._id}
                     className={`px-3 py-1 ${isDeleting === booking._id ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white text-md font-bold rounded-full transition-all duration-300`}
                     aria-label="Delete booking"
  >
    {isDeleting === booking._id ? 'Deleting...' : (
      <>
        <Trash className="inline mr-1" size={20} />
        Delete
      </>
    )}
  </button>
)}
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-gray-500" size={20} />
                        <span className="text-gray-700">
                          {new Date(booking.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="text-gray-500" size={20} />
                        <span className="text-gray-700">
                          {booking.startTime} - {booking.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="text-gray-500" size={20} />
                        <span className="text-gray-700">
                          {booking.location || 'Location Not Specified'}
                        </span>
                      </div>
                      {booking.instructor && booking.instructor.user && (
                        <div className="flex items-center gap-3">
                          <UserCheck className="text-gray-500" size={20} />
                          <span className="text-gray-700">
                            {booking.instructor.user.firstName} {booking.instructor.user.lastName}
                          </span>
                        </div>
                      )}
                      {booking.price && (
                        <div className="flex items-center gap-3">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="text-gray-500" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                          </svg>
                          <span className="text-green-600 font-semibold">
                            ${booking.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {booking.status === 'pending' && booking.createdAt && (
                      <div className="mt-4">
                        <CountdownTimer createdAt={booking.createdAt} />
                      </div>
                    )}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Cancellation Policy:</strong> You can cancel your booking by <Link href="/contact"  className="text-blue-500 hover:underline" target="_blank">contacting us</Link> for free if done more than 24 hours before the scheduled lesson. Cancellations made less than 24 hours before the lesson will incur a $30 CAD cancellation fee.
                </p>
              </div>
            </div>
          </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback for any other status
  return null;
}