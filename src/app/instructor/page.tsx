"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface Booking {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  location: string;
  classType: string;
  package: string;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export default function InstructorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    startTime: "09:00",
    endTime: "10:00"
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("bookings");
  
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.email) {
      fetchInstructorId(session.user.email);
    }
  }, [status, session, router]);
  
  useEffect(() => {
    if (instructorId) {
      fetchBookings();
      fetchSchedule();
    }
  }, [instructorId, selectedDate]);
  
  const fetchInstructorId = async (email: string) => {
    try {
      // First get the user ID
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const userData = await userResponse.json();
      
      if (!userData.users || userData.users.length === 0) {
        setError("User not found");
        setLoading(false);
        return;
      }
      
      const userId = userData.users[0]._id;
      
      // Then get the instructor ID
      const instructorResponse = await fetch(`/api/instructors`);
      const instructorData = await instructorResponse.json();
      
      const instructor = instructorData.instructors.find(
        (i: any) => i.user._id === userId
      );
      
      if (instructor) {
        setInstructorId(instructor._id);
      } else {
        setError("You are not registered as an instructor");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor ID:', error);
      setError("Failed to load instructor data");
      setLoading(false);
    }
  };
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/booking?instructorId=${instructorId}&status=approved`);
      const data = await response.json();
      
      setBookings(data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError("Failed to load bookings");
      setLoading(false);
    }
  };
  
  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/schedules?instructorId=${instructorId}&startDate=${dateStr}&endDate=${dateStr}`
      );
      const data = await response.json();
      
      if (data.schedules && data.schedules.length > 0) {
        setScheduleId(data.schedules[0]._id);
        setTimeSlots(data.schedules[0].slots || []);
      } else {
        setScheduleId(null);
        setTimeSlots([]);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError("Failed to load schedule");
    }
  };
  
  const handleAddTimeSlot = async () => {
    try {
      const updatedSlots = [...timeSlots, newSlot];
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId,
          date: dateStr,
          slots: updatedSlots,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      // Reset form and refresh schedule
      setNewSlot({
        startTime: "09:00",
        endTime: "10:00"
      });
      
      fetchSchedule();
    } catch (error) {
      console.error('Error adding time slot:', error);
      setError("Failed to add time slot");
    }
  };
  
  const handleRemoveTimeSlot = async (index: number) => {
    try {
      const updatedSlots = timeSlots.filter((_, i) => i !== index);
      
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId,
          date: dateStr,
          slots: updatedSlots,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      fetchSchedule();
    } catch (error) {
      console.error('Error removing time slot:', error);
      setError("Failed to remove time slot");
    }
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Error</h2>
          <p className="mb-6 text-center text-red-500">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-white py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Instructor Dashboard</h1>
        
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('bookings')}
            >
              Approved Bookings
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'availability'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('availability')}
            >
              Manage Availability
            </button>
          </div>
        </div>
        
        {activeTab === 'bookings' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Approved Bookings</h2>
            
            {bookings.length === 0 ? (
              <p>No approved bookings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Date</th>
                      <th className="py-2 px-4 border-b">Time</th>
                      <th className="py-2 px-4 border-b">Location</th>
                      <th className="py-2 px-4 border-b">Class</th>
                      <th className="py-2 px-4 border-b">Duration</th>
                      <th className="py-2 px-4 border-b">Student</th>
                      <th className="py-2 px-4 border-b">Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="py-2 px-4 border-b">
                          {new Date(booking.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td className="py-2 px-4 border-b">{booking.location}</td>
                        <td className="py-2 px-4 border-b">{booking.classType}</td>
                        <td className="py-2 px-4 border-b">{booking.duration} mins</td>
                        <td className="py-2 px-4 border-b">
                          {booking.user.firstName} {booking.user.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.user.phone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'availability' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Select Date</h2>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                minDate={new Date()}
                className="border rounded-lg p-2"
              />
              
              <div className="mt-6">
                <h3 className="font-bold mb-2">
                  Selected Date: {selectedDate.toLocaleDateString()}
                </h3>
                
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Add Time Slot</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-sm mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, startTime: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">End Time</label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, endTime: e.target.value })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddTimeSlot}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
                  >
                    Add Slot
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Available Time Slots</h2>
              
              {timeSlots.length === 0 ? (
                <p>No time slots available for this date.</p>
              ) : (
                <div className="space-y-2">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg flex justify-between items-center ${
                        slot.isBooked ? 'bg-gray-100' : 'bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {slot.isBooked && (
                          <span className="ml-2 text-sm text-red-500">
                            (Booked)
                          </span>
                        )}
                      </div>
                      {!slot.isBooked && (
                        <button
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}