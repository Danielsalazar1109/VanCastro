'use client'
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

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

  // Fetch bookings effect
  useEffect(() => {
    async function fetchBookings() {
      if (status === "authenticated" && session?.user) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/users?userId=${session.user.id}&bookings=true`);
          const data = await response.json();
          
          if (response.ok) {
            const userBookings = data.users[0]?.bookings || [];
            setBookings(userBookings);
            
            if (userBookings.length === 0) {
              try {
                const bookingsResponse = await fetch(`/api/booking?userId=${session.user.id}`);
                const bookingsData = await bookingsResponse.json();
                
                if (bookingsResponse.ok && bookingsData.bookings) {
                  setBookings(bookingsData.bookings);
                }
              } catch (err) {
                console.error("Error fetching from bookings API:", err);
              }
            }
          } else {
            setError(data.error || "Failed to fetch bookings");
          }
        } catch (err) {
          setError("An error occurred while fetching bookings");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchBookings();
  }, [status, session]);

  // Unauthenticated view
  if (status === "unauthenticated") {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Login Required</h2>
          <p className="mb-6 text-center">
            You need to be logged in to track a driving lesson.
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
  
  // Authenticated view
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Bookings</h1>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg"
            >
              Cerrar sesión
            </button>
          </div>
          <h1>{session.user.name}</h1>
          
          {isLoading ? (
            <div className="text-center">Loading bookings...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-600">No bookings found.</p>
              <Link 
                href="/booking" 
                className="mt-4 inline-block py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
              >
                Book a Lesson
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {booking.classType || 'Unnamed Class'} - {booking.package || 'No Package'}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    Location: {booking.location || 'No location specified'}
                  </p>
                  {booking.instructor && booking.instructor.user && (
                    <p className="text-gray-600 mb-2">
                      Instructor: {booking.instructor.user.firstName} {booking.instructor.user.lastName}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">
                        Date: {new Date(booking.date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Time: {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                    {booking.status === 'pending' && booking.createdAt && (
                        <CountdownTimer createdAt={booking.createdAt} />
                      )}
                    <span 
                      className={`px-3 py-1 rounded-full text-sm ${
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