"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, LogOut, Clock, MapPin, User, Info, Menu, X, Phone, Heart, Star, Shield } from "lucide-react";
import LoadingComponent from "@/components/layout/Loading";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface Availability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Instructor {
  _id: string;
  user: User;
  locations: string[];
  classTypes: string[];
  availability?: Availability[];
}

interface Booking {
  _id: string;
  user: User;
  instructor: Instructor;
  location: string;
  classType: string;
  package: string;
  duration: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

// Modal components for viewing/deleting bookings and updating prices
interface BookingModalProps {
  booking: {
    id: string;
    title: string;
    extendedProps: {
      location: string;
      classType: string;
      duration: number;
      student: string;
      instructor: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (bookingId: string) => void;
  onReschedule: (bookingId: string) => void;
}

interface PriceUpdateModalProps {
  price: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onPriceChange: (field: string, value: any) => void;
}

const PriceUpdateModal = ({ price, isOpen, onClose, onUpdate, onPriceChange }: PriceUpdateModalProps) => {
  if (!isOpen || !price) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-pink-600">Update Price</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={onUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Class Type</label>
            <select
              value={price.classType}
              onChange={(e) => onPriceChange('classType', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="class 7">Class 7</option>
              <option value="class 5">Class 5</option>
              <option value="class 4">Class 4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Duration (minutes)</label>
            <select
              value={price.duration}
              onChange={(e) => onPriceChange('duration', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes (Road Test)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Package</label>
            <select
              value={price.package}
              onChange={(e) => onPriceChange('package', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            >
              <option value="1 lesson">1 Lesson</option>
              <option value="3 lessons">3 Lessons</option>
              <option value="10 lessons">10 Lessons</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={price.price}
              onChange={(e) => onPriceChange('price', parseFloat(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
              required
            />
          </div>
          
          <div className="mt-6 flex space-x-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:from-pink-600 hover:to-purple-600 transition-colors shadow-md"
            >
              Update Price
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingModal = ({ booking, isOpen, onClose, onDelete, onReschedule }: BookingModalProps) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-pink-600">Booking Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-pink-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Student</p>
              <p className="text-gray-900">{booking.extendedProps.student}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Instructor</p>
              <p className="text-gray-900">{booking.extendedProps.instructor}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Location</p>
              <p className="text-gray-900">{booking.extendedProps.location}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Class Type</p>
              <p className="text-gray-900">{booking.extendedProps.classType}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">Duration</p>
              <p className="text-gray-900">{booking.extendedProps.duration} mins</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onDelete(booking.id);
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 transition-colors shadow-md"
          >
            Cancel Booking
          </button>
          <button
            onClick={() => {
              onReschedule(booking.id);
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full hover:from-pink-600 hover:to-red-600 transition-colors shadow-md"
          >
            Reschedule Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// New TimeRemaining component to handle individual countdown timers
interface TimeRemainingProps {
  createdAt: string | undefined;
}

const TimeRemaining = ({ createdAt }: TimeRemainingProps) => {
  const [timeRemaining, setTimeRemaining] = useState<{ text: string; className: string }>({ 
    text: "Loading...", 
    className: "" 
  });
  
  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeRemaining = () => {
      if (!createdAt) return { text: "Unknown", className: "" };
      
      const now = new Date();
      const created = new Date(createdAt);
      const expiresAt = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24 hours after creation
      const timeLeft = expiresAt.getTime() - now.getTime();
      
      // If already expired
      if (timeLeft <= 0) {
        return { text: "Expired", className: "text-red-600 font-bold" };
      }
      
      // Calculate hours, minutes and seconds
      const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      // Format the time remaining
      const formattedTime = `${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`;
      
      // Determine styling based on time left
      let className = "";
      if (hoursLeft < 3) {
        className = "text-red-600 font-bold"; // Less than 3 hours
      } else if (hoursLeft < 6) {
        className = "text-orange-500 font-semibold"; // Less than 6 hours
      } else if (hoursLeft < 12) {
        className = "text-yellow-600"; // Less than 12 hours
      }
      
      return { text: formattedTime, className };
    };
    
    // Calculate initial time remaining
    setTimeRemaining(calculateTimeRemaining());
    
    // Set up interval to update the time remaining every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [createdAt]);
  
  return <span className={timeRemaining.className}>{timeRemaining.text}</span>;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateBookings, setSelectedDateBookings] = useState<Booking[]>([]);
  const [instructorColors, setInstructorColors] = useState<{[key: string]: string}>({});
  const [updatingExpired, setUpdatingExpired] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [newPrice, setNewPrice] = useState({
    classType: 'class 7',
    duration: 60,
    package: '1 lesson',
    price: 0
  });
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  
  // Hardcoded locations and class types
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  const classTypes = ["class 4", "class 5", "class 7"];
  
  const [newInstructor, setNewInstructor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    locations: [] as string[],
    classTypes: [] as string[],
  });
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  // State for reschedule modal
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [newBookingDate, setNewBookingDate] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{startTime: string; endTime: string; isBooked: boolean}[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState<boolean>(false);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('');
  const [availableInstructors, setAvailableInstructors] = useState<Instructor[]>([]);
  const [loadingInstructors, setLoadingInstructors] = useState<boolean>(false);
  const [originalBooking, setOriginalBooking] = useState<Booking | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  type TabType = 'bookings' | 'calendar' | 'instructors' | 'users' | 'prices';
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [seedStatus, setSeedStatus] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [slotMinTime, setSlotMinTime] = useState<string>("08:00");
  const [slotMaxTime, setSlotMaxTime] = useState<string>("17:00");
  
  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Generate a color for each instructor
  useEffect(() => {
    if (instructors.length > 0) {
      const colors: {[key: string]: string} = {};
      const baseColors = [
        '#4285F4', '#EA4335', '#FBBC05', 
        '#34A853', '#8E24AA', '#D81B60',
        '#039BE5', '#7CB342', '#FB8C00'
      ];
      
      instructors.forEach((instructor, index) => {
        colors[instructor._id] = baseColors[index % baseColors.length];
      });
      
      setInstructorColors(colors);
    }
  }, [instructors]);
  
  // Convert bookings to calendar events
  useEffect(() => {
    if (allBookings.length > 0 && instructors.length > 0) {
      const events = allBookings.map(booking => {
        const instructorColor = instructorColors[booking.instructor._id] || '#808080';
        
        // Formato correcto de fechas y horas
        const bookingDate = booking.date.split('T')[0]; // Asegúrate de que solo usamos la parte de la fecha
        
        return {
          id: booking._id,
          title: `${booking.user.firstName} ${booking.user.lastName} (${booking.location})`,
          start: `${bookingDate}T${booking.startTime}`,
          end: `${bookingDate}T${booking.endTime}`,
          extendedProps: {
            location: booking.location,
            classType: booking.classType,
            duration: booking.duration,
            student: `${booking.user.firstName} ${booking.user.lastName}`,
            instructor: `${booking.instructor.user.firstName} ${booking.instructor.user.lastName}`
          },
          backgroundColor: instructorColor,
          borderColor: instructorColor
        };
      });
      
      setCalendarEvents(events);
    }
  }, [allBookings, instructors, instructorColors]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus(session.user.email);
    }
  }, [status, session, router]);
  
  // State to track if there are new pending bookings
  const [hasNewPendingBookings, setHasNewPendingBookings] = useState<boolean>(false);
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
  
  // Set up polling for pending bookings regardless of active tab
  useEffect(() => {
    if (isAdmin) {
      // Initial fetch with loading indicator
      fetchPendingBookings(true);
      
      // Set up polling every 2 seconds for ultra-responsive updates
      const pollingInterval = setInterval(() => {
        // Background fetch without loading indicator
        fetchPendingBookings(false);
      }, 2000); // 2 seconds
      
      // Clean up interval on component unmount
      return () => clearInterval(pollingInterval);
    }
  }, [isAdmin]);
  
  // Handle other tabs data loading
  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'calendar') {
        fetchAllBookings();
        fetchInstructors();
      } else if (activeTab === 'instructors') {
        fetchInstructors();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'prices') {
        fetchPrices();
      }
    }
  }, [isAdmin, activeTab]);
  
  const fetchPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prices');
      const data = await response.json();
      
      setPrices(data.prices || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setError("Failed to load prices");
      setLoading(false);
    }
  };
  
  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrice),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add price');
      }
      
      // Reset form and refresh prices
      setNewPrice({
        classType: 'class 7',
        duration: 60,
        package: '1 lesson',
        price: 0
      });
      
      fetchPrices();
    } catch (error) {
      console.error('Error adding price:', error);
      setError("Failed to add price");
    }
  };
  
  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPrice) return;
    
    try {
      const response = await fetch(`/api/prices?priceId=${editingPrice._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classType: editingPrice.classType,
          duration: editingPrice.duration,
          package: editingPrice.package,
          price: editingPrice.price
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update price');
      }
      
      // Reset editing state and refresh prices
      setEditingPrice(null);
      setIsPriceModalOpen(false);
      fetchPrices();
    } catch (error) {
      console.error('Error updating price:', error);
      setError("Failed to update price");
    }
  };
  
  const handlePriceChange = (field: string, value: any) => {
    setEditingPrice({
      ...editingPrice,
      [field]: value
    });
  };
  
  const handleDeletePrice = async (priceId: string) => {
    try {
      const response = await fetch(`/api/prices?priceId=${priceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete price');
      }
      
      // Refresh prices
      fetchPrices();
    } catch (error) {
      console.error('Error deleting price:', error);
      setError("Failed to delete price");
    }
  };
  
  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        if (user.role === 'admin') {
          setIsAdmin(true);
        } else {
          setError("You do not have admin privileges");
        }
      } else {
        setError("User not found");
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setError("Failed to verify admin status");
      setLoading(false);
    }
  };
  
  const fetchPendingBookings = async (showLoading = true) => {
    try {
      // Only show loading state for initial load, not for background polling
      if (showLoading) setLoading(true);
      
      const response = await fetch('/api/booking?status=pending');
      const data = await response.json();
      
      // Smart update - only update state if there are changes
      // This prevents unnecessary re-renders
      const newBookings = data.bookings || [];
      
      // Check if the bookings have changed by comparing IDs and timestamps
      const hasChanges = newBookings.length !== pendingBookings.length || 
        newBookings.some((newBooking: Booking, index: number) => {
          const oldBooking = pendingBookings[index];
          return !oldBooking || 
                 newBooking._id !== oldBooking._id || 
                 newBooking.updatedAt !== oldBooking.updatedAt;
        });
      
      // Only update state if there are changes
      if (hasChanges) {
        // Check if there are new pending bookings (more than before)
        if (newBookings.length > pendingBookingsCount) {
          setHasNewPendingBookings(true);
          
          // If not on bookings tab, show notification
          if (activeTab !== 'bookings') {
            // Play notification sound if supported
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (e) {
              console.log('Audio not supported');
            }
          }
        }
        
        setPendingBookings(newBookings);
        setPendingBookingsCount(newBookings.length);
      }
      
      if (showLoading) setLoading(false);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      if (showLoading) {
        setError("Failed to load pending bookings");
        setLoading(false);
      }
    }
  };
  
  const handleUpdateExpiredBookings = async () => {
    try {
      setUpdatingExpired(true);
      setUpdateMessage("");
      
      const response = await fetch('/api/booking/update-expired');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to update expired bookings');
      }
      
      setUpdateMessage(data.message || `Updated ${data.updatedCount} expired bookings`);
      
      // Refresh bookings list
      fetchPendingBookings();
    } catch (error) {
      console.error('Error updating expired bookings:', error);
      setUpdateMessage("Failed to update expired bookings");
    } finally {
      setUpdatingExpired(false);
    }
  };
  
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructors');
      const data = await response.json();
      
      const fetchedInstructors = data.instructors || [];
      setInstructors(fetchedInstructors);
      
      // Calculate min start time and max end time from instructor availability
      if (fetchedInstructors.length > 0) {
        let minStartTime = "23:59";
        let maxEndTime = "00:00";
        
        fetchedInstructors.forEach((instructor: Instructor) => {
          if (instructor.availability && instructor.availability.length > 0) {
            instructor.availability.forEach((slot: Availability) => {
              if (slot.isAvailable) {
                // Compare and update minimum start time
                if (slot.startTime < minStartTime) {
                  minStartTime = slot.startTime;
                }
                
                // Compare and update maximum end time
                if (slot.endTime > maxEndTime) {
                  maxEndTime = slot.endTime;
                }
              }
            });
          }
        });
        
        // Only update if we found valid times
        if (minStartTime !== "23:59") {
          setSlotMinTime(minStartTime);
        }
        
        if (maxEndTime !== "00:00") {
          setSlotMaxTime(maxEndTime);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setError("Failed to load instructors");
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError("Failed to load users");
      setLoading(false);
    }
  };
  
  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'approved',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve booking');
      }
      
      // Refresh bookings
      fetchPendingBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      setError("Failed to approve booking");
    }
  };
  
  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'cancelled',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reject booking');
      }
      
      // Refresh bookings
      fetchPendingBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      setError("Failed to reject booking");
    }
  };

  const fetchAvailableInstructors = async (classType: string, location: string) => {
    try {
      setLoadingInstructors(true);
      
      // Fetch instructors who can teach this class type and are available at this location
      const response = await fetch(
        `/api/instructors?classType=${classType}&location=${location}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }
      
      const data = await response.json();
      setAvailableInstructors(data.instructors || []);
    } catch (error: any) {
      console.error("Error fetching available instructors:", error);
      setError("Failed to load available instructors. Please try again.");
    } finally {
      setLoadingInstructors(false);
    }
  };

  const fetchAvailableTimeSlots = async (instructorId: string, newDate: string, duration: number, location: string) => {
    try {
      setLoadingTimeSlots(true);
      
      // Generate/update the schedule with current parameters
      const createResponse = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instructorId,
          date: newDate,
          duration,
          location
        }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || "Failed to generate schedule");
      }
      
      // Fetch the generated schedule
      const fetchResponse = await fetch(
        `/api/schedules?instructorId=${instructorId}&startDate=${newDate}&endDate=${newDate}`
      );
      
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch generated schedule");
      }
      
      const data = await fetchResponse.json();
      
      // Extract available time slots
      if (data.schedules && data.schedules.length > 0) {
        const schedule = data.schedules[0];
        const availableSlots = schedule.slots.filter(
          (slot: {startTime: string; endTime: string; isBooked: boolean}) => !slot.isBooked
        );
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
    } catch (error: any) {
      console.error("Error fetching available time slots:", error);
      setError("Failed to load available time slots. Please try again.");
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handleRescheduleBooking = async (bookingId: string) => {
    try {
      // Find the booking details
      const booking = allBookings.find(b => b._id === bookingId) || 
                     pendingBookings.find(b => b._id === bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Store the original booking for reference
      setOriginalBooking(booking);

      // Set up the reschedule modal
      setRescheduleBookingId(bookingId);
      
      // Initialize with current booking date and time
      const dateObj = new Date(booking.date);
      const formattedDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      setNewBookingDate(formattedDate);
      setNewStartTime(booking.startTime);
      
      // Set the initial instructor
      setSelectedInstructorId(booking.instructor._id);
      
      // Fetch available instructors for this class type and location
      await fetchAvailableInstructors(booking.classType, booking.location);
      
      // Fetch available time slots for the selected date and instructor
      await fetchAvailableTimeSlots(
        booking.instructor._id, 
        formattedDate, 
        booking.duration, 
        booking.location
      );
      
      // Close booking details modal and open reschedule modal
      setIsModalOpen(false);
      setIsRescheduleModalOpen(true);
    } catch (error: any) {
      console.error('Error preparing to reschedule booking:', error);
      setError(error.message || "Failed to prepare reschedule");
    }
  }
  
  const submitReschedule = async () => {
    if (!rescheduleBookingId || !newBookingDate || !newStartTime || !selectedInstructorId || !originalBooking) {
      alert('Please select a date, time, and instructor');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get admin name
      const adminName = session?.user?.name || 'Admin';
      
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
          newInstructorId: selectedInstructorId,
          instructorName: adminName,
          sendEmail: true
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reschedule booking');
      }
      
      // Close modal and refresh bookings
      setIsRescheduleModalOpen(false);
      fetchAllBookings();
      fetchPendingBookings();
      setLoading(false);
      
      // Show success message
      alert('Booking rescheduled successfully. The student has been notified.');
    } catch (error: any) {
      setLoading(false);
      console.error('Error rescheduling booking:', error);
      alert(error.message || "Failed to reschedule booking");
    }
  }
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      // Find the booking details
      const booking = allBookings.find(b => b._id === bookingId) || 
                     pendingBookings.find(b => b._id === bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get admin name
      const adminName = session?.user?.name || 'Admin';

      // Send cancellation request
      const response = await fetch(`/api/booking?bookingId=${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          sendEmail: true,
          instructorName: adminName,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Close modal and refresh bookings
      setIsModalOpen(false);
      fetchAllBookings();
      fetchPendingBookings();
      
      // Show success message
      alert('Booking cancelled successfully. The student has been notified.');
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      setError(error.message || "Failed to cancel booking");
    }
  };
  
  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newInstructor.firstName,
          lastName: newInstructor.lastName,
          email: newInstructor.email,
          password: newInstructor.password,
          phone: newInstructor.phone,
          locations: newInstructor.locations,
          classTypes: newInstructor.classTypes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create instructor');
      }
      
      // Reset form and refresh instructors
      setNewInstructor({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        locations: [],
        classTypes: [],
      });
      
      fetchInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      setError("Failed to create instructor");
    }
  };
  
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/booking?status=approved');
      const data = await response.json();
      
      setAllBookings(data.bookings || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      setError("Failed to load bookings");
      setLoading(false);
    }
  };
  
  const handleDeleteInstructor = async (instructorId: string) => {
    try {
      const response = await fetch(`/api/instructors?instructorId=${instructorId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete instructor');
      }
      
      // Refresh instructors
      fetchInstructors();
    } catch (error) {
      console.error('Error deleting instructor:', error);
      setError("Failed to delete instructor");
    }
  }
  
  const handleLocationChange = (locationId: string) => {
    if (newInstructor.locations.includes(locationId)) {
      setNewInstructor({
        ...newInstructor,
        locations: newInstructor.locations.filter(id => id !== locationId),
      });
    } else {
      setNewInstructor({
        ...newInstructor,
        locations: [...newInstructor.locations, locationId],
      });
    }
  };
  
  const handleClassTypeChange = (classTypeId: string) => {
    if (newInstructor.classTypes.includes(classTypeId)) {
      setNewInstructor({
        ...newInstructor,
        classTypes: newInstructor.classTypes.filter(id => id !== classTypeId),
      });
    } else {
      setNewInstructor({
        ...newInstructor,
        classTypes: [...newInstructor.classTypes, classTypeId],
      });
    }
  };
  
  if (status === 'loading' || loading) {
    return <LoadingComponent gifUrl="https://media.tenor.com/75ffA59OV-sAAAAM/broke-down-red-car.gif" />;
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
  
  if (!isAdmin) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-white py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">Access Denied</h2>
          <p className="mb-6 text-center">
            You do not have permission to access this page.
          </p>
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
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 flex justify-between items-center rounded-t-3xl shadow-lg mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Shield className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-white/70">Manage bookings, instructors and users</p>
            </div>
          </div>
          {/* Logout button moved to navbar */}
        </div>
        
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <div className="flex border-b">
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'bookings'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300 relative`}
              onClick={() => {
                setActiveTab('bookings');
                setHasNewPendingBookings(false);
              }}
            >
              <Clock className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-pink-500' : ''}`} />
              <span>Pending Bookings</span>
              {hasNewPendingBookings && activeTab !== 'bookings' && (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'calendar'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'text-pink-500' : ''}`} />
              <span>Calendar View</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'instructors'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('instructors')}
            >
              <User className={`w-5 h-5 ${activeTab === 'instructors' ? 'text-pink-500' : ''}`} />
              <span>Manage Instructors</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('users')}
            >
              <User className={`w-5 h-5 ${activeTab === 'users' ? 'text-pink-500' : ''}`} />
              <span>View Users</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'prices'
                  ? 'text-pink-600 border-b-2 border-pink-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('prices')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`w-5 h-5 ${activeTab === 'prices' ? 'text-pink-500' : ''}`}
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
              <span>Manage Prices</span>
            </button>
          </div>
          
          <div className="p-6">
        
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Clock className="mr-3 text-pink-500" />
                    Pending Bookings
                  </h2>
                  <button
                    onClick={handleUpdateExpiredBookings}
                    disabled={updatingExpired}
                    className={`px-6 py-3 rounded-full text-white font-medium shadow-md ${
                      updatingExpired 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                    } transition-all duration-300`}
                  >
                    {updatingExpired ? 'Updating...' : 'Cancel Expired Bookings'}
                  </button>
                </div>
            
                {updateMessage && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800 shadow-sm">
                    {updateMessage}
                  </div>
                )}
            
                {pendingBookings.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">No pending bookings found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl shadow-lg">
                    <table className="min-w-full bg-white border">
                      <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Date</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Time</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Location</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Class</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Duration</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Student</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Instructor</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Payment</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Time Remaining</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Actions</th>
                        </tr>
                      </thead>
                  <tbody>
                    {pendingBookings.map((booking) => (
                      <tr 
                        key={booking._id}
                        className="transition-all duration-300 animate-fadeIn"
                      >
                        <td className="py-2 px-4 border-b">
                        {new Date(booking.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}
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
                          {booking.instructor?.user?.firstName} {booking.instructor?.user?.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b">
                          {/* Replace the static calculation with the dynamic component */}
                          <TimeRemaining createdAt={booking.createdAt} />
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveBooking(booking._id)}
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 shadow-sm transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking._id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 shadow-sm transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
            {activeTab === 'instructors' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    
                    <div className="flex items-center space-x-4 mb-2 relative z-10">
                      <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">Create Instructor</h2>
                    </div>
                    <p className="text-white/80 relative z-10">
                      Add a new instructor to the system with their details and teaching preferences.
                    </p>
                  </div>
                  
                  <form onSubmit={handleCreateInstructor} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={newInstructor.firstName}
                        onChange={(e) =>
                          setNewInstructor({ ...newInstructor, firstName: e.target.value })
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        required
                      />
                    </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newInstructor.lastName}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, lastName: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newInstructor.email}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={newInstructor.password}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, password: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newInstructor.phone}
                    onChange={(e) =>
                      setNewInstructor({ ...newInstructor, phone: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location) => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newInstructor.locations.includes(location)}
                          onChange={() => handleLocationChange(location)}
                          className="mr-1"
                        />
                        {location}
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Class Types</label>
                  <div className="flex flex-wrap gap-2">
                    {classTypes.map((classType) => (
                      <label key={classType} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newInstructor.classTypes.includes(classType)}
                          onChange={() => handleClassTypeChange(classType)}
                          className="mr-1"
                        />
                        {classType}
                      </label>
                    ))}
                  </div>
                </div>
                
                    <div>
                      <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-full shadow-md transition-all"
                      >
                        Create Instructor
                      </button>
                    </div>
                  </form>
                </div>
            
                <div>
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    
                    <div className="flex items-center space-x-4 mb-2 relative z-10">
                      <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-8 h-8" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">Current Instructors</h2>
                    </div>
                    <p className="text-white/80 relative z-10">
                      View and manage all instructors in the system.
                    </p>
                  </div>
                  
                  {instructors.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg">
                      <p className="text-slate-500">No instructors found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {instructors.map((instructor) => (
                        <div key={instructor._id} className="border border-pink-100 p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-bold text-pink-600">
                                {instructor.user.firstName} {instructor.user.lastName}
                              </h3>
                              <p className="text-sm text-gray-600">{instructor.user.email}</p>
                              <p className="text-sm text-gray-600">{instructor.user.phone}</p>
                              
                              <div className="mt-3">
                                <p className="text-sm font-medium text-purple-600">Locations:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {instructor.locations.map((location) => (
                                    <span
                                      key={location}
                                      className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                                    >
                                      {location}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-3">
                                <p className="text-sm font-medium text-indigo-600">Class Types:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {instructor.classTypes.map((classType) => (
                                    <span
                                      key={classType}
                                      className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full"
                                    >
                                      {classType}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteInstructor(instructor._id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 shadow-sm transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
        
            {activeTab === 'calendar' && (
              <div>
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  
                  <div className="flex items-center space-x-4 mb-2 relative z-10">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Calendar View</h2>
                  </div>
                  <p className="text-white/80 relative z-10">
                    View all approved bookings in a calendar format.
                  </p>
                </div>
                
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-pink-600">Instructor Color Legend</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    {instructors.map((instructor) => (
                      <div key={instructor._id} className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                        <div 
                          className="w-4 h-4 mr-2 rounded-full" 
                          style={{ backgroundColor: instructorColors[instructor._id] || '#808080' }}
                        ></div>
                        <span className="text-sm">{instructor.user.firstName} {instructor.user.lastName}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={isSmallScreen ? "timeGridDay" : "timeGridWeek"}
                    slotMinTime={slotMinTime}
                    slotMaxTime={slotMaxTime}
                    allDaySlot={false}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: isSmallScreen ? 'timeGridDay' : 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={calendarEvents}
                    eventClick={(info) => {
                      setSelectedBooking(info.event);
                      setIsModalOpen(true);
                    }}
                    height="auto"
                    dayHeaderClassNames={['text-pink-600', 'font-semibold', 'py-2']}
                    slotLabelClassNames={['text-xs', 'text-slate-500']}
                  />
                </div>
              </div>
            )}
        
            {activeTab === 'users' && (
              <div>
                <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  
                  <div className="flex items-center space-x-4 mb-2 relative z-10">
                    <div className="bg-white/20 p-2 rounded-full">
                      <User className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">All Users</h2>
                  </div>
                  <p className="text-white/80 relative z-10">
                    View all users registered in the system.
                  </p>
                </div>
                
                {users.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">No users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl shadow-lg">
                    <table className="min-w-full bg-white border">
                      <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                        <tr>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Name</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Email</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Phone</th>
                          <th className="py-3 px-4 border-b text-left text-pink-700">Role</th>
                        </tr>
                      </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="py-2 px-4 border-b">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">{user.email}</td>
                        <td className="py-2 px-4 border-b">{user.phone || 'N/A'}</td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : user.role === 'instructor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'prices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-8 h-8"
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
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Add New Price</h2>
                </div>
                <p className="text-white/80 relative z-10">
                  Create pricing for different class types, durations, and packages.
                </p>
              </div>
              
              <form onSubmit={handleAddPrice} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Class Type</label>
                  <select
                    value={newPrice.classType}
                    onChange={(e) => setNewPrice({ ...newPrice, classType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  >
                    <option value="class 7">Class 7</option>
                    <option value="class 5">Class 5</option>
                    <option value="class 4">Class 4</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Duration (minutes)</label>
                  <select
                    value={newPrice.duration}
                    onChange={(e) => setNewPrice({ ...newPrice, duration: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  >
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes (Road Test)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Package</label>
                  <select
                    value={newPrice.package}
                    onChange={(e) => setNewPrice({ ...newPrice, package: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  >
                    <option value="1 lesson">1 Lesson</option>
                    <option value="3 lessons">3 Lessons</option>
                    <option value="10 lessons">10 Lessons</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-full shadow-md transition-all"
                  >
                    Add Price
                  </button>
                </div>
              </form>
              
            </div>
            
            <div>
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-8 h-8"
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
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Current Prices</h2>
                </div>
                <p className="text-white/80 relative z-10">
                  View and manage all pricing in the system.
                </p>
              </div>
              
              {prices.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">No prices found. Add your first price using the form.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-lg">
                  <table className="min-w-full bg-white border">
                    <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                      <tr>
                        <th className="py-3 px-4 border-b text-left text-pink-700">Class Type</th>
                        <th className="py-3 px-4 border-b text-left text-pink-700">Duration</th>
                        <th className="py-3 px-4 border-b text-left text-pink-700">Package</th>
                        <th className="py-3 px-4 border-b text-left text-pink-700">Price</th>
                        <th className="py-3 px-4 border-b text-left text-pink-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((price) => (
                        <tr key={price._id}>
                          <td className="py-2 px-4 border-b">{price.classType}</td>
                          <td className="py-2 px-4 border-b">
                            {price.duration === 120 ? '120 mins (Road Test)' : `${price.duration} mins`}
                          </td>
                          <td className="py-2 px-4 border-b">{price.package}</td>
                          <td className="py-2 px-4 border-b">
                            <span className="text-green-600 font-semibold">${price.price.toFixed(2)}</span>
                          </td>
                          <td className="py-3 px-4 border-b">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPrice(price);
                                  setIsPriceModalOpen(true);
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 shadow-sm transition-all"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeletePrice(price._id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 shadow-sm transition-all"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    
    {/* Modal for calendar events */}
    <BookingModal
      booking={selectedBooking}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onDelete={handleCancelBooking}
      onReschedule={handleRescheduleBooking}
    />
    
    {/* Price Update Modal */}
    <PriceUpdateModal
      price={editingPrice}
      isOpen={isPriceModalOpen}
      onClose={() => {
        setIsPriceModalOpen(false);
        setEditingPrice(null);
      }}
      onUpdate={handleUpdatePrice}
      onPriceChange={handlePriceChange}
    />
    
    {/* Reschedule Modal */}
    {isRescheduleModalOpen && originalBooking && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
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
                Select Instructor
              </label>
              {loadingInstructors ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <select
                  value={selectedInstructorId}
                  onChange={(e) => {
                    const newInstructorId = e.target.value;
                    setSelectedInstructorId(newInstructorId);
                    if (newInstructorId && newBookingDate && originalBooking) {
                      fetchAvailableTimeSlots(
                        newInstructorId,
                        newBookingDate,
                        originalBooking.duration,
                        originalBooking.location
                      );
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an instructor</option>
                  {availableInstructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.user.firstName} {instructor.user.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Date
              </label>
              <input
                type="date"
                value={newBookingDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setNewBookingDate(newDate);
                  if (selectedInstructorId && originalBooking) {
                    fetchAvailableTimeSlots(
                      selectedInstructorId,
                      newDate,
                      originalBooking.duration,
                      originalBooking.location
                    );
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Time Slots
              </label>
              
              {loadingTimeSlots ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : !selectedInstructorId ? (
                <div className="bg-blue-50 border border-blue-300 p-4 rounded-md text-blue-800 text-center">
                  Please select an instructor first.
                </div>
              ) : availableTimeSlots.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800 text-center">
                  No time slots available for the selected date and instructor.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {availableTimeSlots
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <div
                        key={`${slot.startTime}-${slot.endTime}`}
                        className={`p-3 border-2 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                          newStartTime === slot.startTime
                            ? "bg-orange-400 border-orange-500 shadow-md transform scale-105"
                            : "bg-white border-gray-300 hover:border-orange-400 hover:bg-orange-50"
                        }`}
                        onClick={() => setNewStartTime(slot.startTime)}
                      >
                        <span className="font-medium">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    ))}
                </div>
              )}
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
              disabled={loading || !newStartTime || !selectedInstructorId}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300"
            >
              {loading ? "Processing..." : "Reschedule Booking"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  </div>
  );
};