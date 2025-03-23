"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar } from "lucide-react";

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
  const [availability, setAvailability] = useState<Array<{
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("bookings");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  
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
      fetchInstructorAvailability();
    }
  }, [instructorId]);

  // Convert bookings to calendar events
  useEffect(() => {
    if (bookings.length > 0) {
      // Filter to ensure only approved bookings are included
      const approvedBookings = bookings.filter(booking => booking.status === 'approved');
      console.log('Approved bookings for calendar:', approvedBookings);

      
      const events = approvedBookings.map(booking => {
        // Corregir el formato de fecha
        // Extraer solo la parte de la fecha (YYYY-MM-DD) del string completo
        const dateOnly = booking.date.split('T')[0];
        
        return {
          id: booking._id,
          title: `${booking.user.firstName} ${booking.user.lastName} - ${booking.location}`,
          start: `${dateOnly}T${booking.startTime}`,
          end: `${dateOnly}T${booking.endTime}`,
          extendedProps: {
            location: booking.location,
            classType: booking.classType,
            duration: booking.duration,
            student: `${booking.user.firstName} ${booking.user.lastName}`,
            contact: booking.user.phone
          },
          backgroundColor: getColorForLocation(booking.location),
          borderColor: getColorForLocation(booking.location)
        };
      });
      
      setCalendarEvents(events);
    }
  }, [bookings]);
  
  // Log calendar events after state update
  useEffect(() => {
    console.log('Events for calendar:', calendarEvents);
  }, [calendarEvents]);
  
  // Helper function to get color based on location
  const getColorForLocation = (location: string) => {
    switch(location) {
      case 'Surrey':
        return '#4285F4'; // Blue
      case 'Burnaby':
        return '#EA4335'; // Red
      case 'North Vancouver':
        return '#FBBC05'; // Yellow
      default:
        return '#34A853'; // Green
    }
  };
  
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
  
  const fetchInstructorAvailability = async () => {
    try {
      const response = await fetch(`/api/instructors?instructorId=${instructorId}`);
      const data = await response.json();
      
      if (data.instructors && data.instructors.length > 0) {
        // Initialize availability with default values if not set
        const instructorAvailability = data.instructors[0].availability || [];
        
        // Ensure we have an entry for each day of the week
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const fullAvailability = daysOfWeek.map(day => {
          const existingDay = instructorAvailability.find((a: any) => a.day === day);
          return existingDay || {
            day,
            startTime: '09:00',
            endTime: '17:00',
            isAvailable: false
          };
        });
        
        setAvailability(fullAvailability);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructor availability:', error);
      setError("Failed to load instructor data");
      setLoading(false);
    }
  };
  
  const handleAvailabilityChange = (index: number, field: string, value: any) => {
    const updatedAvailability = [...availability];
    updatedAvailability[index] = {
      ...updatedAvailability[index],
      [field]: value
    };
    setAvailability(updatedAvailability);
  };
  
  const saveAvailability = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/instructors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId,
          availability
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update availability');
      }
      
      setLoading(false);
      alert('Availability updated successfully');
    } catch (error: any) {
      console.error('Error updating availability:', error);
      setError(error.message || "Failed to update availability");
      setLoading(false);
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
                activeTab === 'calendar'
                  ? 'border-b-2 border-yellow-400 font-bold'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('calendar')}
            >
              Calendar View
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
        {activeTab === 'calendar' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Weekly Schedule</h2>
            
            <div className="mb-6">
              <div className="mb-2 flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm">Surrey</span>
                <div className="w-4 h-4 rounded-full bg-red-500 mx-2 ml-4"></div>
                <span className="text-sm">Burnaby</span>
                <div className="w-4 h-4 rounded-full bg-yellow-500 mx-2 ml-4"></div>
                <span className="text-sm">North Vancouver</span>
              </div>
              
              <div className="calendar-container" style={{ height: '650px' }}>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'timeGridWeek,timeGridDay'
                  }}
                  slotMinTime="08:00:00"
                  slotMaxTime="17:00:00"
                  allDaySlot={false}
                  events={calendarEvents}
                  eventTimeFormat={{
                    hour: '2-digit',
                    minute: '2-digit',
                    meridiem: false,
                    hour12: false
                  }}
                  eventContent={(eventInfo) => (
                    <div className="p-1 text-xs">
                      <div className="font-bold">{eventInfo.timeText}</div>
                      <div className="truncate">{eventInfo.event.title}</div>
                    </div>
                  )}
                  eventClick={(info) => {
                    alert(`
                      Student: ${info.event.extendedProps.student}
                      Location: ${info.event.extendedProps.location}
                      Class Type: ${info.event.extendedProps.classType}
                      Duration: ${info.event.extendedProps.duration} mins
                      Contact: ${info.event.extendedProps.contact}
                    `);
                  }}
                />
              </div>
            </div>
          </div>
        )}
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
                      <tr 
                        key={booking._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setActiveTab('calendar')}
                      >
                       <td className="py-2 px-4 border-b">
                      {(() => {
                       const date = new Date(booking.date);
                       // Ajustar la zona horaria local
                       const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                       return localDate.toLocaleDateString();
                       })()}
v                      </td>
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
          <div>
            <h2 className="text-xl font-bold mb-4">Set Your Weekly Availability</h2>
            <p className="mb-4 text-gray-600">
              Set your working hours for each day of the week. Students will be able to book lessons during these hours.
              Time slots will be automatically generated based on lesson duration and buffer time.
            </p>
            
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Day</th>
                      <th className="py-2 px-4 border-b">Available</th>
                      <th className="py-2 px-4 border-b">Start Time</th>
                      <th className="py-2 px-4 border-b">End Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.map((day, index) => (
                      <tr key={day.day}>
                        <td className="py-2 px-4 border-b">{day.day}</td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="checkbox"
                            checked={day.isAvailable}
                            onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                            className="h-5 w-5"
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                            disabled={!day.isAvailable}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                        <td className="py-2 px-4 border-b">
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                            disabled={!day.isAvailable}
                            className="p-2 border rounded w-full"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <button
              onClick={saveAvailability}
              disabled={loading}
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-lg"
            >
              {loading ? "Saving..." : "Save Availability"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}