"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, LogOut, Clock, MapPin, User, Info, Menu, X, Phone} from "lucide-react";
import LoadingComponent from "@/components/layout/Loading";
import { IBooking } from "@/models/Booking";

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
            <User className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Student</p>
              <p className="text-gray-900">{booking.extendedProps.student}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Location</p>
              <p className="text-gray-900">{booking.extendedProps.location}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Class Type</p>
              <p className="text-gray-900">{booking.extendedProps.classType}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Duration</p>
              <p className="text-gray-900">{booking.extendedProps.duration} mins</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Contact</p>
              <p className="text-gray-900">{booking.extendedProps.contact}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
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
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [locations, setLocations] = useState<string[]>([]);
  const [dateRangeOffset, setDateRangeOffset] = useState<number>(0); // Track pagination offset
  
  // Generate dates for the day selector with pagination
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    // Generate 7 days with offset for pagination
    // When offset is 0, it shows 3 days before today, today, and 3 days after today
    // When offset is 1, it shows the next 7 days, and so on
    for (let i = -3 + (dateRangeOffset * 7); i <= 3 + (dateRangeOffset * 7); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setDateRangeOffset(prev => prev - 1);
  };
  
  // Navigate to next week
  const goToNextWeek = () => {
    setDateRangeOffset(prev => prev + 1);
  };
  
  // Reset to current week
  const resetToCurrentWeek = () => {
    setDateRangeOffset(0);
  };

  // Format date for display in day selector
  const formatDateForSelector = (date: Date) => {
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date.toISOString().split('T')[0]
    };
  };
  
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
  
  // Function to fetch locations from the database
  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations?activeOnly=true');
      const data = await response.json();
      
      if (data.locations) {
        setLocations(data.locations.map((loc: any) => loc.name));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.email) {
      fetchInstructorId(session.user.email);
      fetchLocations(); // Fetch locations when component mounts
    }
  }, [status, session, router]);
  
  useEffect(() => {
    if (instructorId) {
      fetchBookings();
      fetchInstructorAvailability();
    }
  }, [instructorId]);

  // Filter bookings by today's date when component mounts
  useEffect(() => {
    if (instructorId && selectedDate) {
      filterBookingsByDate(selectedDate);
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
    // Extract city name from location (assuming format is "City, Address")
    const cityMatch = location.match(/^([^,]+)/);
    const city = cityMatch ? cityMatch[1].trim() : '';
    
    // Assign colors based on city name
    if (city === 'Vancouver') {
      return '#4285F4'; // Blue for Vancouver
    } else if (city === 'Burnaby') {
      return '#EA4335'; // Red for Burnaby
    } else if (city === 'North Vancouver') {
      return '#FBBC05'; // Yellow for North Vancouver
    } else {
      return '#34A853'; // Green (default) for other cities
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
            startTime: '00:00',
            endTime: '23:59',
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

  // Function to filter bookings by selected date
  const filterBookingsByDate = async (date: string) => {
    try {
      setLoading(true);
      setSelectedDate(date);
      
      // Fetch all bookings for the instructor
      const response = await fetch(`/api/booking?instructorId=${instructorId}&status=approved`);
      const data = await response.json();
      
      if (date === 'all') {
        // Show all bookings
        setBookings(data.bookings || []);
      } else {
        // Filter bookings to only include those for the selected date
        const filteredBookings = data.bookings.filter((booking: IBooking) => {
          // Handle dates like "2025-03-24T00:00:00.000+00:00"
          const bookingDate = new Date(booking.date).toISOString().split('T')[0]; // Extract just the YYYY-MM-DD part
          return bookingDate === date;
        });
        
        // Update state with filtered bookings
        setBookings(filteredBookings || []);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error filtering bookings by date:', error);
      setError("Failed to load bookings");
      setLoading(false);
    }
  };

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
  
  // Only show full-page loading for initial authentication check
  if (status === 'loading') {
    return <LoadingComponent gifUrl="https://media.tenor.com/75ffA59OV-sAAAAM/broke-down-red-car.gif" />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full transition-colors"
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
          className="text-yellow-600"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50">
          <div className="p-4 space-y-4">
            {/* Logout button moved to navbar */}
            
            {[
              { id: 'bookings', icon: Clock, label: 'Bookings' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-3 
                  ${activeTab === tab.id 
                    ? 'bg-yellow-100 text-yellow-600 font-semibold'
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
      
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black p-6 flex justify-between items-center rounded-t-3xl shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-white p-3 rounded-full">
            <Calendar className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight hidden md:block">Instructor Dashboard</h1>
            <p className="text-white/70 hidden md:block">Manage your schedule and bookings</p>
          </div>
        </div>
        {/* Logout button moved to navbar */}
      </div>

      <div className="flex flex-col md:flex-row max-w-9xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden border-t-0">
        {/* Desktop Navigation */}
        <div className="hidden md:flex flex-col border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white">
            {[
              { id: 'bookings', icon: Clock, label: 'Bookings' },
              { id: 'calendar', icon: Calendar, label: 'Calendar' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`
                  flex items-center space-x-2 px-6 py-4 
                  ${activeTab === tab.id 
                    ? 'text-yellow-600 border-l-4 border-yellow-500 bg-yellow-50 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-100 border-l-4 border-transparent'}
                  transition-all duration-300
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-yellow-500' : ''}`} />
                <span>{tab.label}</span>
              </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full p-4 md:p-6">
          {activeTab === 'bookings' && (
            <div className="space-y-4">
            <div>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-4">
                  <Clock className="mr-3 text-yellow-500" />
                  Approved Bookings
                </h2>
                
                {/* Day selector with pagination arrows */}
                <div className="flex items-center justify-center py-2">
                  {/* Previous week arrow */}
                  <button 
                    onClick={goToPreviousWeek}
                    className="p-2 mx-1 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    aria-label="Previous week"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Day selector circles */}
                  <div className="flex space-x-2">
                    {generateDates().map((date, index) => {
                      const { day, date: dateNum, fullDate } = formatDateForSelector(date);
                      const isSelected = fullDate === selectedDate;
                      const isToday = new Date().toISOString().split('T')[0] === fullDate;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => filterBookingsByDate(fullDate)}
                          className={`
                            flex flex-col items-center justify-center
                            w-16 h-16 rounded-full transition-all duration-200
                            ${isSelected 
                              ? 'bg-yellow-500 text-black shadow-lg transform scale-110' 
                              : isToday
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50'}
                          `}
                        >
                          <span className="text-xs font-medium">{day}</span>
                          <span className={`text-lg ${isSelected ? 'font-bold' : 'font-semibold'}`}>{dateNum}</span>
                          <span className="text-xs">{formatDateForSelector(date).month}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next week arrow */}
                  <button 
                    onClick={goToNextWeek}
                    className="p-2 mx-1 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                    aria-label="Next week"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
              
              {/* Show skeleton loader when loading bookings */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div 
                      key={index}
                      className="border-l-4 border-gray-200 rounded-2xl shadow-md p-5 relative overflow-hidden animate-pulse"
                    >
                      <div className="absolute -right-4 -top-4 bg-gray-100 w-16 h-16 rounded-full"></div>
                      <div className="absolute -right-2 -bottom-2 bg-gray-100 w-12 h-12 rounded-full"></div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>

                      <div className="mb-3">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">No approved bookings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn">
                  {bookings.map((booking) => {
                    const getLocationColor = (location: string) => {
                      // Extract city name from location (assuming format is "City, Address")
                      const cityMatch = location.match(/^([^,]+)/);
                      const city = cityMatch ? cityMatch[1].trim() : '';
                      
                      // Assign colors based on city name
                      if (city === 'Vancouver') {
                        return 'bg-blue-100 border-blue-500 text-blue-800';
                      } else if (city === 'Burnaby') {
                        return 'bg-red-100 border-red-500 text-red-800';
                      } else if (city === 'North Vancouver') {
                        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
                      } else {
                        return 'bg-green-100 border-green-500 text-green-800'; // Default
                      }
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
                          rounded-2xl 
                          shadow-md 
                          p-5 
                          transform 
                          transition-all 
                          hover:scale-105 
                          hover:shadow-xl 
                          cursor-pointer
                          relative
                          overflow-hidden
                        `}
                        onClick={() => setActiveTab('calendar')}
                      >
                        <div className="absolute -right-4 -top-4 bg-white/20 w-16 h-16 rounded-full"></div>
                        <div className="absolute -right-2 -bottom-2 bg-white/10 w-12 h-12 rounded-full"></div>
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
                            <Phone className="w-5 h-5 text-current" />
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
                  {/* Extract unique cities from locations and generate legend dynamically */}
                  {Array.from(new Set(locations.map(loc => {
                    const cityMatch = loc.match(/^([^,]+)/);
                    return cityMatch ? cityMatch[1].trim() : '';
                  }))).filter(Boolean).map((city, index) => {
                    // Assign colors based on city name
                    let color = '';
                    if (city === 'Vancouver') color = 'bg-blue-500';
                    else if (city === 'Burnaby') color = 'bg-red-500';
                    else if (city === 'North Vancouver') color = 'bg-yellow-500';
                    else color = 'bg-green-500'; // Default
                    
                    return (
                      <div key={index} className="flex items-center space-x-1">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-xl text-black">{city}</span>
                      </div>
                    );
                  })}
                  
                  {/* Fallback if no locations are available */}
                  {locations.length === 0 && (
                    <>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xl text-black">Vancouver</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xl text-black">Burnaby</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-xl text-black">North Vancouver</span>
                      </div>
                    </>
                  )}
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
                      const location = arg.event.extendedProps.location;
                      
                      // Extract city name from location (assuming format is "City, Address")
                      const cityMatch = location.match(/^([^,]+)/);
                      const city = cityMatch ? cityMatch[1].trim() : '';
                      
                      // Assign colors based on city name
                      let baseClasses = [
                        'rounded-lg',
                        'shadow-md',
                        'p-1',
                        'border-l-4',
                        'text-xs',
                        'font-medium'
                      ];
                      
                      if (city === 'Vancouver') {
                        return [...baseClasses, 'bg-blue-500', 'border-blue-600', 'text-white'];
                      } else if (city === 'Burnaby') {
                        return [...baseClasses, 'bg-red-500', 'border-red-600', 'text-white'];
                      } else if (city === 'North Vancouver') {
                        return [...baseClasses, 'bg-yellow-500', 'border-yellow-600', 'text-black'];
                      } else {
                        return [...baseClasses, 'bg-green-500', 'border-green-600', 'text-white'];
                      }
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
                    dayHeaderClassNames={['text-yellow-600', 'font-semibold', 'py-2']}
                    slotLabelClassNames={['text-xs', 'text-slate-500']}
                  />
                </div>
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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