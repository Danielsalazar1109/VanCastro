"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, LogOut, Clock, MapPin, User, Info, Menu, X, Phone } from "lucide-react";

// Modal component for viewing booking details
interface BookingModalProps {
  booking: {
    id: string;
    title: string;
    extendedProps: {
      location: string;
      classType: string;
      duration: number;
      student: string;
      contact: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

const BookingModal = ({ booking, isOpen, onClose, onCancel, onReschedule }: BookingModalProps) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Booking Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Student</p>
              <p className="text-gray-900">{booking.extendedProps.student}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Location</p>
              <p className="text-gray-900">{booking.extendedProps.location}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Class Type</p>
              <p className="text-gray-900">{booking.extendedProps.classType}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Duration</p>
              <p className="text-gray-900">{booking.extendedProps.duration} mins</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Contact</p>
              <p className="text-gray-900">{booking.extendedProps.contact}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            onClick={() => onReschedule(booking.id)}
            className="px-4 py-2 border border-orange-300 bg-orange-50 rounded-lg text-orange-700 hover:bg-orange-100"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(booking.id)}
            className="px-4 py-2 border border-red-300 bg-red-50 rounded-lg text-red-700 hover:bg-red-100"
          >
            Cancel
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [slotMinTime, setSlotMinTime] = useState<string>("08:00:00");
  const [slotMaxTime, setSlotMaxTime] = useState<string>("17:00:00");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
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

  useEffect(() => {
    if (bookings.length > 0) {
      const approvedBookings = bookings.filter(booking => booking.status === 'approved');
      
      const events = approvedBookings.map(booking => {
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
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const userData = await userResponse.json();
      
      if (!userData.users || userData.users.length === 0) {
        setError("User not found");
        setLoading(false);
        return;
      }
      
      const userId = userData.users[0]._id;
      
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
        const instructorAvailability = data.instructors[0].availability || [];
        
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
        
        if (fullAvailability.length > 0) {
          let minStartTime = "23:59:00";
          let maxEndTime = "00:00:00";
          
          fullAvailability.forEach(slot => {
            if (slot.isAvailable) {
              const startTimeWithSeconds = slot.startTime.includes(':') && slot.startTime.split(':').length === 2 
                ? `${slot.startTime}:00` 
                : slot.startTime;
              
              const endTimeWithSeconds = slot.endTime.includes(':') && slot.endTime.split(':').length === 2 
                ? `${slot.endTime}:00` 
                : slot.endTime;
              
              if (startTimeWithSeconds < minStartTime) {
                minStartTime = startTimeWithSeconds;
              }
              
              if (endTimeWithSeconds > maxEndTime) {
                maxEndTime = endTimeWithSeconds;
              }
            }
          });
          
          if (minStartTime !== "23:59:00") {
            setSlotMinTime(minStartTime);
          }
          
          if (maxEndTime !== "00:00:00") {
            setSlotMaxTime(maxEndTime);
          }
        }
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

  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Find the booking details
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get instructor name
      const instructorName = session?.user?.name || 'Your Instructor';

      // Send cancellation request
      const response = await fetch(`/api/booking?bookingId=${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          sendEmail: true,
          instructorName,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Close modal and refresh bookings
      setIsModalOpen(false);
      fetchBookings();
      
      // Show success message
      alert('Booking cancelled successfully. The student has been notified.');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setError(error.message || "Failed to cancel booking");
    }
  }

  // State for reschedule modal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [newBookingDate, setNewBookingDate] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('');
  
  const handleRescheduleBooking = async (bookingId: string) => {
    try {
      // Find the booking details
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Set up the reschedule modal
      setRescheduleBookingId(bookingId);
      
      // Initialize with current booking date and time
      const dateObj = new Date(booking.date);
      const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      setNewBookingDate(formattedDate);
      setNewStartTime(booking.startTime);
      
      // Close booking details modal and open reschedule modal
      setIsModalOpen(false);
      setIsRescheduleModalOpen(true);
    } catch (error: any) {
      console.error('Error preparing to reschedule booking:', error);
      setError(error.message || "Failed to prepare reschedule");
    }
  }
  
  const submitReschedule = async () => {
    if (!rescheduleBookingId || !newBookingDate || !newStartTime) {
      alert('Please select a date and time');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get instructor name
      const instructorName = session?.user?.name || 'Your Instructor';
      
      // Send reschedule request
      const response = await fetch('/api/booking/reschedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: rescheduleBookingId,
          newDate: newBookingDate,
          newStartTime,
          instructorName,
          sendEmail: true
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reschedule booking');
      }
      
      // Close modal and refresh bookings
      setIsRescheduleModalOpen(false);
      fetchBookings();
      setLoading(false);
      
      // Show success message
      alert('Booking rescheduled successfully. The student has been notified.');
    } catch (error: any) {
      setLoading(false);
      console.error('Error rescheduling booking:', error);
      alert(error.message || "Failed to reschedule booking");
    }
  }
  
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-indigo-600 animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-10">
      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome {session?.user?.name} 👋</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-indigo-600"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <div className="p-4 space-y-4">
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
            
            {[
              { id: 'bookings', icon: Clock, label: 'Bookings' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' },
              { id: 'availability', icon: User, label: 'Availability' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-3 
                  ${activeTab === tab.id 
                    ? 'bg-indigo-100 text-indigo-600 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100'}
                  rounded-full transition-all duration-300
                `}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden md:flex text-4xl font-bold mb-6">
        Welcome {session?.user?.name} 👋
      </div>
      
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Calendar className="w-10 h-10" />
          <h1 className="text-3xl font-bold tracking-tight hidden md:block">Instructor Dashboard</h1>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="hidden md:flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row max-w-9xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col border-b border-slate-200 bg-slate-50">
          {[
            { id: 'bookings', icon: Clock, label: 'Bookings' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'availability', icon: User, label: 'Availability' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`
                flex items-center space-x-2 px-4 py-3 
                ${activeTab === tab.id 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'}
                transition-all duration-300
              `}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full p-4 md:p-6">
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <Clock className="mr-3 text-indigo-500" />
                Approved Bookings
              </h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">No approved bookings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {bookings.map((booking) => {
                    const getLocationColor = (location: string) => {
                      const locationColors = {
                        'Surrey': 'bg-blue-100 border-blue-500 text-blue-800',
                        'Burnaby': 'bg-red-100 border-red-500 text-red-800',
                        'North Vancouver': 'bg-yellow-100 border-yellow-500 text-yellow-800'
                      };
                      return locationColors[location as keyof typeof locationColors] || 'bg-green-100 border-green-500 text-green-800';
                    };

                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString);
                      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                      return localDate.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    };

                    return (
                      <div 
                        key={booking._id} 
                        className={`
                          ${getLocationColor(booking.location)}
                          border-l-4 
                          rounded-lg 
                          shadow-md 
                          p-5 
                          transform 
                          transition-all 
                          hover:scale-105 
                          hover:shadow-xl 
                          cursor-pointer
                        `}
                        onClick={() => setActiveTab('calendar')}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-5 h-5 text-current" />
                            <span className="font-bold">{booking.location}</span>
                          </div>
                          <div className="text-sm font-semibold bg-white/50 px-2 py-1 rounded">
                            {formatDate(booking.date)}
                          </div>
                        </div>

                        <div className="mb-3">
                          <h3 className="text-xl font-bold mb-1">
                            {booking.user.firstName} {booking.user.lastName}
                          </h3>
                          <p className="text-current/70">{booking.classType} - {booking.duration} mins</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-current" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="w-5 h-5 text-current" />
                            <a 
                              href={`tel:${booking.user.phone}`} 
                              className="hover:underline"
                            >
                              {booking.user.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-white to-yellow-300 p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xl text-black">Surrey</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xl text-black">Burnaby</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xl text-black">North Vancouver</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="calendar-container" style={{ height: '650px' }}>
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: isMobile ? 'timeGridDay' : 'timeGridWeek,timeGridDay'
                    }}
                    slotMinTime={slotMinTime}
                    slotMaxTime={slotMaxTime}
                    allDaySlot={false}
                    events={calendarEvents}
                    eventTimeFormat={{
                      hour: '2-digit',
                      minute: '2-digit',
                      meridiem: false,
                      hour12: false
                    }}
                    eventClassNames={(arg) => {
                      const locationColors = {
                        'Surrey': 'bg-blue-500 border-blue-600 text-white',
                        'Burnaby': 'bg-red-500 border-red-600 text-white',
                        'North Vancouver': 'bg-yellow-500 border-yellow-600 text-black'
                      };
                      
                      const location = arg.event.extendedProps.location;
                      return [
                        locationColors[location as keyof typeof locationColors] || 'bg-green-500 border-green-600',
                        'rounded-lg',
                        'shadow-md',
                        'p-1',
                        'border-l-4',
                        'text-xs',
                        'font-medium'
                      ];
                    }}
                    eventContent={(eventInfo) => (
                      <div className="p-1">
                        <div className="font-bold">{eventInfo.timeText}</div>
                        <div className="truncate">{eventInfo.event.title}</div>
                      </div>
                    )}
                    eventClick={(info) => {
                      setSelectedBooking(info.event);
                      setIsModalOpen(true);
                    }}
                    buttonText={{
                      today: 'Today',
                      week: 'Week',
                      day: 'Day'
                    }}
                    height="auto"
                    contentHeight="auto"
                    aspectRatio={1.35}
                    dayHeaderClassNames={['text-indigo-600', 'font-semibold', 'py-2']}
                    slotLabelClassNames={['text-xs', 'text-slate-500']}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-4 mb-4">
                  <User className="w-10 h-10" />
                  <h2 className="text-3xl font-bold tracking-tight">Manage Your Availability</h2>
                </div>
                <p className="text-white/80 max-w-2xl">
                  Configure your weekly schedule with precision. Toggle availability for each day and set specific working hours. 
                  This helps students book lessons that fit perfectly into your calendar.
                </p>
              </div>

              <div className="grid gap-6">
                {/* Availability Grid */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-slate-100 p-4 border-b">
                    <h3 className="text-xl font-semibold text-slate-700">Weekly Availability</h3>
                  </div>
                  <div className="p-4 flex flex-row">
                    {availability.map((day, index) => (
                      <div 
                        key={day.day} 
                        className={`
                          flex items-center justify-between p-3 
                          ${day.isAvailable 
                            ? 'bg-green-50 hover:bg-green-100' 
                            : 'bg-slate-50 hover:bg-slate-100'}
                          rounded-lg mb-2 transition-all duration-300
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            ${day.isAvailable 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-300 text-slate-500'}
                          `}>
                            {day.day.charAt(0)}
                          </span>
                          <span className={`
                            font-medium 
                            ${day.isAvailable ? 'text-green-800' : 'text-slate-500'}
                          `}>
                            {day.day}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={day.isAvailable}
                              onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                              className="hidden peer"
                            />
                            <div className={`
                              w-14 h-7 rounded-full relative transition-all duration-300 
                              ${day.isAvailable 
                                ? 'bg-green-500' 
                                : 'bg-slate-300'}
                              after:content-[''] after:absolute after:top-1 
                              after:left-1 after:bg-white after:rounded-full 
                              after:h-5 after:w-5 
                              ${day.isAvailable 
                                ? 'after:translate-x-full' 
                                : 'after:translate-x-0'}
                              after:transition-all after:duration-300
                            `}
                            ></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Configuration */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-slate-100 p-4 border-b">
                    <h3 className="text-xl font-semibold text-slate-700">Working Hours</h3>
                  </div>
                  <div className="p-4 space-y-4 grid grid-cols-3 gap-4">
                    {availability.filter(day => day.isAvailable).map((day, index) => (
                      <div 
                        key={day.day} 
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-slate-700">{day.day}</span>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm text-slate-600">
                              {day.startTime} - {day.endTime}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={day.startTime}
                              onChange={(e) => handleAvailabilityChange(
                                availability.findIndex(a => a.day === day.day), 
                                'startTime', 
                                e.target.value
                              )}
                              disabled={!day.isAvailable}
                              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">End Time</label>
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) => handleAvailabilityChange(
                                availability.findIndex(a => a.day === day.day), 
                                'endTime', 
                                e.target.value
                              )}
                              disabled={!day.isAvailable}
                              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {availability.filter(day => !day.isAvailable).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                        <Info className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-blue-800 text-sm">
                          Days marked as unavailable will not show up for bookings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={saveAvailability}
                  disabled={loading}
                  className={`
                    px-8 py-3 rounded-full font-bold transition-all duration-300
                    ${loading 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-lg'}
                  `}
                >
                  {loading ? "Saving..." : "Save Availability"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* Booking Modal */}
    <BookingModal
      booking={selectedBooking}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onCancel={handleCancelBooking}
      onReschedule={handleRescheduleBooking}
    />
    
    {/* Reschedule Modal */}
    {isRescheduleModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Reschedule Booking</h3>
            <button 
              onClick={() => setIsRescheduleModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Date
              </label>
              <input
                type="date"
                value={newBookingDate}
                onChange={(e) => setNewBookingDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Start Time
              </label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setIsRescheduleModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            
            <button
              onClick={submitReschedule}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300"
            >
              {loading ? "Processing..." : "Reschedule Booking"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}