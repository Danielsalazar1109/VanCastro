"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, LogOut, Clock, MapPin, User, Info, Menu, X, Phone, Heart, Star, Shield, Image, Edit } from "lucide-react";
import LoadingComponent from "@/components/layout/Loading";
import Booking from "@/models/Booking";
import GlobalAvailabilityManager from "@/components/admin/GlobalAvailabilityManager";
import InstructorModal from "@/components/admin/InstructorModal";
import PriceUpdateModal from "@/components/admin/PriceUpdateModal";
import BookingModal from "@/components/admin/BookingModal";
import TimeRemaining from "@/components/admin/TimeRemaining";
import AbsenceModal from "@/components/admin/AbsenceModal";
import LocationSelector from "@/components/admin/LocationSelector";

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
  locations?: string[] | Promise<string[]>;
  teachingLocations?: string[];
  classTypes: string[];
  availability?: Availability[];
  absences?: {
    startDate: Date | string;
    endDate: Date | string;
    reason?: string;
  }[];
  image?: string;
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
  termsAcceptedAt: string;
  hasLicenseAcceptedAt?: string;
  privacyPolicyAcceptedAt?: string;
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

interface Location {
  _id: string;
  name: string;
  isActive: boolean;
}

interface InstructorModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => void;
  onInstructorChange: (field: string, value: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange?: (location: string) => void;
  onClassTypeChange?: (classType: string) => void;
  locations?: string[];
  classTypes?: string[];
  locationMapping?: { [key: string]: string[] };
}

// Interface for absence modal
interface AbsenceModalProps {
  instructor: Instructor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

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
  const [sendingReminders, setSendingReminders] = useState<boolean>(false);
  const [reminderMessage, setReminderMessage] = useState<string>("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [newPrice, setNewPrice] = useState({
    classType: 'class 7',
    duration: 60,
    package: '1 lesson',
    price: 0
  });
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false);
  
  
  // Map general locations to full location names
  const locationMapping: { [key: string]: string[] } = {
    'Vancouver': ["Vancouver, 999 Kingsway", "Vancouver, 4126 McDonald St"],
    'Burnaby': ["Burnaby, 3880 Lougheed Hwy", "Burnaby, 4399 Wayburne Dr"],
    'North Vancouver': ["North Vancouver, 1331 Marine Drive"]
  };
  
  // Function to get full location names from general locations
  const getFullLocationNames = (generalLocations: string[]): string[] => {
    let fullLocations: string[] = [];
    generalLocations.forEach(loc => {
      if (locationMapping[loc]) {
        fullLocations = [...fullLocations, ...locationMapping[loc]];
      } else {
        fullLocations.push(loc);
      }
    });
    return fullLocations;
  };
  const classTypes = ["class 4", "class 5", "class 7"];
  
  const [locations, setLocations] = useState<any[]>([]);
  const [newLocation, setNewLocation] = useState({ name: '' });
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  
  // Define tab types and state before using it
  type TabType = 'bookings' | 'approved-bookings' | 'calendar' | 'instructors' | 'users' | 'prices' | 'locations' | 'global-availability';
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  
  const [newInstructor, setNewInstructor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    image: "",
    locations: [] as string[]
  });
  
  // Fetch locations directly for the create instructor form
  // Explicitly use the Location interface defined at the top of this file
  const [createFormLocations, setCreateFormLocations] = useState<Location[]>([]);
  const [isLoadingCreateFormLocations, setIsLoadingCreateFormLocations] = useState<boolean>(false);
  
  // Fetch locations when the instructors tab is active
  useEffect(() => {
    if (activeTab === 'instructors') {
      fetchCreateFormLocations();
    }
  }, [activeTab]);
  
  // Function to fetch locations directly from the API for the create form
  const fetchCreateFormLocations = async () => {
    try {
      setIsLoadingCreateFormLocations(true);
      const response = await fetch('/api/locations');
      const data = await response.json();
      setCreateFormLocations(data.locations || []);
      setIsLoadingCreateFormLocations(false);
    } catch (error) {
      console.error('Error fetching locations for create form:', error);
      setIsLoadingCreateFormLocations(false);
    }
  };
  
  // State for instructor edit and absence modals
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  
  // Function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Handle image upload for new instructor
  const handleNewInstructorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64Image = await fileToBase64(e.target.files[0]);
        setNewInstructor({
          ...newInstructor,
          image: base64Image
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  };
  
  // Handle image upload for editing instructor
  const handleEditInstructorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editingInstructor) {
      try {
        const base64Image = await fileToBase64(e.target.files[0]);
        setEditingInstructor({
          ...editingInstructor,
          image: base64Image
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }
  };
  
  // Modal state
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  // Invoice modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceBookingId, setSelectedInvoiceBookingId] = useState<string | null>(null);
  const [selectedInvoiceFile, setSelectedInvoiceFile] = useState<File | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<Booking | null>(null);
  
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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [seedStatus, setSeedStatus] = useState<string>("");
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [slotMinTime, setSlotMinTime] = useState<string>("00:00");
  const [slotMaxTime, setSlotMaxTime] = useState<string>("23:59");
  
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
      if (activeTab === 'calendar' || activeTab === 'approved-bookings') {
        fetchAllBookings();
        fetchInstructors();
      } else if (activeTab === 'instructors') {
        fetchInstructors();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'prices') {
        fetchPrices();
      } else if (activeTab === 'locations') {
        fetchLocations();
      }
    }
  }, [isAdmin, activeTab]);
  
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/locations');
      const data = await response.json();
      
      setLocations(data.locations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError("Failed to load locations");
      setLoading(false);
    }
  };
  
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocation),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add location');
      }
      
      // Reset form and refresh locations
      setNewLocation({ name: '' });
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      setError("Failed to add location");
    }
  };
  
  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingLocation) return;
    
    try {
      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: editingLocation._id,
          name: editingLocation.name,
          isActive: editingLocation.isActive
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      // Reset editing state and refresh locations
      setEditingLocation(null);
      setIsLocationModalOpen(false);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location:', error);
      setError("Failed to update location");
    }
  };
  
  const handleLocationChange = (field: string, value: any) => {
    setEditingLocation({
      ...editingLocation,
      [field]: value
    });
  };
  
  const handleToggleLocationStatus = async (locationId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          isActive: !currentStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update location status');
      }
      
      // Refresh locations
      fetchLocations();
    } catch (error) {
      console.error('Error updating location status:', error);
      setError("Failed to update location status");
    }
  };
  
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
  
  const handleSendReminders = async () => {
    try {
      setSendingReminders(true);
      setReminderMessage("");
      
      const response = await fetch('/api/booking/reminder');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to send reminder emails');
      }
      
      setReminderMessage(data.message || `Sent ${data.remindersSent} reminder emails`);
    } catch (error) {
      console.error('Error sending reminder emails:', error);
      setReminderMessage("Failed to send reminder emails");
    } finally {
      setSendingReminders(false);
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
          adminEmail: session?.user?.email, // Add admin email for fallback authentication
        }),
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve booking');
      }
      
      // Refresh bookings
      fetchPendingBookings();
    } catch (error: any) {
      console.error('Error approving booking:', error);
      alert(error.message || "Failed to approve booking");
    }
  };
  
  const handleRejectBooking = async (bookingId: string) => {
    try {
      // Ask for a reason (optional)
      const reason = window.prompt('Please provide a reason for rejecting this booking (optional):');
      
      const response = await fetch('/api/booking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'cancelled',
          reason: reason || undefined,
          adminEmail: session?.user?.email, // Add admin email for fallback authentication
        }),
        credentials: 'include', // Include cookies in the request
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

  // Function to get general location from full location name
  const getGeneralLocationFromFull = (fullLocation: string): string => {
    // Check each general location
    for (const [generalLocation, fullLocations] of Object.entries(locationMapping)) {
      // If the full location is in the array for this general location, return the general location
      if (fullLocations.includes(fullLocation)) {
        return generalLocation;
      }
    }
    // If no match found, return the original location (might be a general location already)
    return fullLocation;
  };

  const fetchAvailableInstructors = async (classType: string, location: string) => {
    try {
      setLoadingInstructors(true);
      
      // Get the general location from the full location name
      const generalLocation = getGeneralLocationFromFull(location);
      console.log(`Fetching instructors for class type: ${classType}, location: ${location}, general location: ${generalLocation}`);
      
      // Fetch instructors who can teach this class type and are available at this location
      // Try both the original location and the general location
      const response = await fetch(
        `/api/instructors?classType=${classType}&location=${encodeURIComponent(generalLocation)}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }
      
      const data = await response.json();
      console.log(`Found ${data.instructors?.length || 0} instructors`);
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
  
  // Handler for sending invoice
  const handleSendInvoice = async (bookingId: string) => {
    try {
      // Find the booking in both pending and approved bookings
      const booking = pendingBookings.find(b => b._id === bookingId) || 
                     allBookings.find(b => b._id === bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }
      
      // Set the selected booking for invoice
      setSelectedBookingForInvoice(booking);
      setSelectedInvoiceBookingId(bookingId);
      
      // Reset form fields
      setSelectedInvoiceFile(null);
      setInvoiceNumber('');
      setInvoiceNotes('');
      
      // Open the invoice modal
      setIsInvoiceModalOpen(true);
    } catch (error: any) {
      console.error('Error preparing to send invoice:', error);
      setError(error.message || "Failed to prepare invoice");
    }
  };
  
  // Handler for submitting invoice
  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoiceBookingId || !selectedInvoiceFile) {
      alert('Please select an invoice file');
      return;
    }
    
    try {
      setIsUploadingInvoice(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('bookingId', selectedInvoiceBookingId);
      formData.append('invoiceFile', selectedInvoiceFile);
      
      // Add admin email for fallback authentication in production
      if (session?.user?.email) {
        formData.append('adminEmail', session.user.email);
      }
      
      if (invoiceNumber) {
        formData.append('invoiceNumber', invoiceNumber);
      }
      
      if (invoiceNotes) {
        formData.append('notes', invoiceNotes);
      }
      
      // Send the invoice with credentials included
      const response = await fetch('/api/booking/invoice', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invoice');
      }
      
      // Close modal and refresh bookings
      setIsInvoiceModalOpen(false);
      fetchPendingBookings();
      
      // Show success message
      alert('Invoice sent successfully');
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      alert(error.message || "Failed to send invoice");
    } finally {
      setIsUploadingInvoice(false);
    }
  };
  
  // Handler for approving payment
  const handleApprovePayment = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking/invoice', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'approved',
          adminEmail: session?.user?.email, // Add admin email for fallback authentication
        }),
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve payment');
      }
      
      // Refresh bookings
      fetchPendingBookings();
      
      // Show success message
      alert('Payment approved successfully');
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(error.message || "Failed to approve payment");
    }
  };
  
  // Handler for rejecting payment
  const handleRejectPayment = async (bookingId: string) => {
    try {
      const response = await fetch('/api/booking/invoice', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status: 'rejected',
          adminEmail: session?.user?.email, // Add admin email for fallback authentication
        }),
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject payment');
      }
      
      // Refresh bookings
      fetchPendingBookings();
      
      // Show success message
      alert('Payment rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(error.message || "Failed to reject payment");
    }
  };

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
          adminEmail: session?.user?.email, // Add admin email for fallback authentication
        }),
        credentials: 'include', // Include cookies in the request
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
          image: newInstructor.image,
          locations: newInstructor.locations
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
        image: "",
        locations: []
      });
      
      fetchInstructors();
    } catch (error) {
      console.error('Error creating instructor:', error);
      setError("Failed to create instructor");
    }
  };
  
  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingInstructor) return;
    
    try {
      const response = await fetch('/api/instructors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: editingInstructor._id,
          firstName: editingInstructor.user.firstName,
          lastName: editingInstructor.user.lastName,
          email: editingInstructor.user.email,
          phone: editingInstructor.user.phone,
          locations: editingInstructor.teachingLocations,
          classTypes: editingInstructor.classTypes,
          image: editingInstructor.image
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update instructor');
      }
      
      // Close modal and refresh instructors
      setIsInstructorModalOpen(false);
      setEditingInstructor(null);
      fetchInstructors();
    } catch (error) {
      console.error('Error updating instructor:', error);
      setError("Failed to update instructor");
    }
  };
  
  const handleInstructorChange = (field: string, value: any) => {
    if (!editingInstructor) return;
    
    if (field === 'firstName' || field === 'lastName' || field === 'email' || field === 'phone') {
      setEditingInstructor({
        ...editingInstructor,
        user: {
          ...editingInstructor.user,
          [field]: value
        }
      });
    } else {
      setEditingInstructor({
        ...editingInstructor,
        [field]: value
      });
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
  
  // Removed handleLocationChange and handleClassTypeChange as they are no longer needed
  
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
      <div className="max-w-9xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black p-6 flex justify-between items-center rounded-t-3xl shadow-lg mb-8">
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
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300 relative`}
              onClick={() => {
                setActiveTab('bookings');
                setHasNewPendingBookings(false);
              }}
            >
              <Clock className={`w-5 h-5 ${activeTab === 'bookings' ? 'text-yellow-500' : ''}`} />
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
                activeTab === 'approved-bookings'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => {
                setActiveTab('approved-bookings');
                fetchAllBookings();
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`w-5 h-5 ${activeTab === 'approved-bookings' ? 'text-yellow-500' : ''}`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Approved Bookings</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'calendar'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('calendar')}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'text-yellow-500' : ''}`} />
              <span>Calendar View</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'instructors'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('instructors')}
            >
              <User className={`w-5 h-5 ${activeTab === 'instructors' ? 'text-yellow-500' : ''}`} />
              <span>Manage Instructors</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('users')}
            >
              <User className={`w-5 h-5 ${activeTab === 'users' ? 'text-yellow-500' : ''}`} />
              <span>View Users</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'prices'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('prices')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`w-5 h-5 ${activeTab === 'prices' ? 'text-yellow-500' : ''}`}
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
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'locations'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('locations')}
            >
              <MapPin className={`w-5 h-5 ${activeTab === 'locations' ? 'text-yellow-500' : ''}`} />
              <span>Manage Locations</span>
            </button>
            <button
              className={`px-6 py-4 flex items-center space-x-2 ${
                activeTab === 'global-availability'
                  ? 'text-yellow-600 border-b-2 border-yellow-500 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              } transition-all duration-300`}
              onClick={() => setActiveTab('global-availability')}
            >
              <Calendar className={`w-5 h-5 ${activeTab === 'global-availability' ? 'text-yellow-500' : ''}`} />
              <span>Availability</span>
            </button>
          </div>
          
          <div className="p-6">
        
            {activeTab === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Clock className="mr-3 text-yellow-500" />
                    Pending Bookings
                  </h2>
                  <button
                    onClick={handleUpdateExpiredBookings}
                    disabled={updatingExpired}
                    className={`px-6 py-3 rounded-full text-white font-medium shadow-md ${
                      updatingExpired 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700'
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
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Date</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Time</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Location</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Class</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Duration</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Student</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Email</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Phone</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Terms Accepted</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">License Confirmed</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Privacy Policy</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Instructor</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Payment</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Time Remaining</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Actions</th>
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
                          {booking.user.email}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.user.phone}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.termsAcceptedAt 
                            ? new Date(booking.termsAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not accepted'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.hasLicenseAcceptedAt 
                            ? new Date(booking.hasLicenseAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not confirmed'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.privacyPolicyAcceptedAt 
                            ? new Date(booking.privacyPolicyAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not accepted'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.instructor?.user?.firstName} {booking.instructor?.user?.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'invoice sent'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.paymentStatus === 'requested'
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

        {activeTab === 'approved-bookings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-3 text-yellow-500 h-6 w-6"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Approved Bookings
                </h2>
              </div>
              <div className="relative group">
                <button
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                  className={`px-6 py-3 rounded-full text-white font-medium shadow-md ${
                    sendingReminders 
                      ? 'bg-gray-400' 
                      : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700'
                  } transition-all duration-300 flex items-center`}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {sendingReminders ? 'Sending...' : 'Send Reminders'}
                </button>
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-black text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p>Reminders are automatically sent daily at 10:05 PM. Use this button only for manual sending.</p>
                  <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black"></div>
                </div>
              </div>
            </div>
            
            {reminderMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl text-green-800 shadow-sm">
                {reminderMessage}
              </div>
            )}
            
            {allBookings.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg">
                <p className="text-slate-500">No approved bookings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-lg">
                <table className="min-w-full bg-white border">
                  <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
                    <tr>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Date</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Time</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Location</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Class</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Duration</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Student</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Email</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Phone</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Terms Accepted</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">License Confirmed</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Privacy Policy</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Instructor</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Payment</th>
                      <th className="py-3 px-4 border-b text-left text-yellow-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((booking) => (
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
                          {booking.user.email}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.user.phone}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.termsAcceptedAt 
                            ? new Date(booking.termsAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not accepted'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.hasLicenseAcceptedAt 
                            ? new Date(booking.hasLicenseAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not confirmed'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.privacyPolicyAcceptedAt 
                            ? new Date(booking.privacyPolicyAcceptedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not accepted'}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {booking.instructor?.user?.firstName} {booking.instructor?.user?.lastName}
                        </td>
                        <td className="py-2 px-4 border-b">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'invoice sent'
                                ? 'bg-blue-100 text-blue-800'
                                : booking.paymentStatus === 'requested'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-b">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSendInvoice(booking._id)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 shadow-sm transition-all"
                            >
                              Send Invoice
                            </button>
                            <button
                              onClick={() => handleRescheduleBooking(booking._id)}
                              className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full hover:from-yellow-600 hover:to-orange-600 shadow-sm transition-all"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 shadow-sm transition-all"
                            >
                              Cancel
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
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    
                    <div className="flex items-center space-x-4 mb-2 relative z-10">
                      <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-8 h-8 text-black" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-black">Create Instructor</h2>
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
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
                  <label className="block text-sm font-medium mb-1">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewInstructorImageUpload}
                    className="w-full p-2 border rounded"
                  />
                  {newInstructor.image && (
                    <div className="mt-2">
                      <img 
                        src={newInstructor.image} 
                        alt="Profile Preview" 
                        className="w-20 h-20 object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Teaching Locations</label>
                  {isLoadingCreateFormLocations ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                    </div>
                  ) : createFormLocations.length > 0 && locationMapping ? (
                    <LocationSelector
                      selectedLocations={newInstructor.locations}
                      onLocationChange={(location) => {
                        const currentLocations = [...newInstructor.locations];
                        const locationIndex = currentLocations.indexOf(location);
                        
                        if (locationIndex === -1) {
                          // Add location
                          setNewInstructor({
                            ...newInstructor,
                            locations: [...currentLocations, location]
                          });
                        } else {
                          // Remove location
                          currentLocations.splice(locationIndex, 1);
                          setNewInstructor({
                            ...newInstructor,
                            locations: currentLocations
                          });
                        }
                      }}
                      locations={createFormLocations}
                      locationMapping={locationMapping}
                    />
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No locations available.</p>
                    </div>
                  )}
                </div>
                
                    <div>
                      <button
                        type="submit"
                        className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold rounded-full shadow-md transition-all"
                      >
                        Create Instructor
                      </button>
                    </div>
                  </form>
                </div>
            
                <div>
                  <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                    
                    <div className="flex items-center space-x-4 mb-2 relative z-10">
                      <div className="bg-white/20 p-2 rounded-full">
                        <User className="w-8 h-8 text-black" />
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-black">Current Instructors</h2>
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
                            <div className="flex items-start space-x-4">
                              {instructor.image ? (
                                <img 
                                  src={instructor.image} 
                                  alt={`${instructor.user.firstName} ${instructor.user.lastName}`} 
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <h3 className="text-xl font-bold text-yellow-600">
                                  {instructor.user.firstName} {instructor.user.lastName}
                                </h3>
                                <p className="text-sm text-gray-600">{instructor.user.email}</p>
                                <p className="text-sm text-gray-600">{instructor.user.phone}</p>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingInstructor(instructor);
                                  setIsInstructorModalOpen(true);
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 shadow-sm transition-all flex items-center"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setEditingInstructor(instructor);
                                  setIsAbsenceModalOpen(true);
                                }}
                                className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full hover:from-purple-600 hover:to-indigo-600 shadow-sm transition-all"
                              >
                                Absences
                              </button>
                              <button
                                onClick={() => handleDeleteInstructor(instructor._id)}
                                className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full hover:from-red-600 hover:to-pink-600 shadow-sm transition-all"
                              >
                                Delete
                              </button>
                            </div>
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
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600  text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  
                  <div className="flex items-center space-x-4 mb-2 relative z-10">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Calendar className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-black">Calendar View</h2>
                  </div>
                  <p className="text-white/80 relative z-10">
                    View all approved bookings in a calendar format.
                  </p>
                </div>
                
                <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-600">Instructor Color Legend</h3>
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
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                  
                  <div className="flex items-center space-x-4 mb-2 relative z-10">
                    <div className="bg-white/20 p-2 rounded-full">
                      <User className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-black">All Users</h2>
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
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Name</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Email</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Phone</th>
                          <th className="py-3 px-4 border-b text-left text-yellow-700">Role</th>
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
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-8 h-8 text-black"
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
                  <h2 className="text-2xl font-bold tracking-tight text-black">Add New Price</h2>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold rounded-full shadow-md transition-all"
                  >
                    Add Price
                  </button>
                </div>
              </form>
              
            </div>
            
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600  text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-8 h-8 text-black"
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
                  <h2 className="text-2xl font-bold tracking-tight text-black">Current Prices</h2>
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
                        <th className="py-3 px-4 border-b text-left text-yellow-700">Class Type</th>
                        <th className="py-3 px-4 border-b text-left text-yellow-700">Duration</th>
                        <th className="py-3 px-4 border-b text-left text-yellow-700">Package</th>
                        <th className="py-3 px-4 border-b text-left text-yellow-700">Price</th>
                        <th className="py-3 px-4 border-b text-left text-yellow-700">Actions</th>
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
        
        {activeTab === 'global-availability' && (
          <div>
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
              <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
              
              <div className="flex items-center space-x-4 mb-2 relative z-10">
                <div className="bg-white/20 p-2 rounded-full">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-black">Global Availability Management</h2>
              </div>
              <p className="text-white/80 relative z-10">
                Set the days and hours when bookings are allowed for all instructors in the system.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-yellow-700 mb-4">Global Availability Settings</h3>
                <p className="text-gray-600 mb-6">
                  Set the days and hours when bookings are allowed for all instructors. These settings will apply to all instructors in the system.
                </p>
                
                <GlobalAvailabilityManager />
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'locations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <MapPin className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-black">Add New Location</h2>
                </div>
                <p className="text-white/80 relative z-10">
                  Add a new location where driving lessons can take place.
                </p>
              </div>
              
              <form onSubmit={handleAddLocation} className="space-y-4 bg-white p-6 rounded-2xl shadow-lg">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Location Name</label>
                  <input
                    type="text"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                    placeholder="e.g., Vancouver, 999 Kingsway"
                    required
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-full shadow-md transition-all"
                  >
                    Add Location
                  </button>
                </div>
              </form>
            </div>
            
            <div>
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full"></div>
                <div className="absolute -left-10 -bottom-10 bg-white/10 w-40 h-40 rounded-full"></div>
                
                <div className="flex items-center space-x-4 mb-2 relative z-10">
                  <div className="bg-white/20 p-2 rounded-full">
                    <MapPin className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-black">Current Locations</h2>
                </div>
                <p className="text-white/80 relative z-10">
                  View and manage all locations in the system.
                </p>
              </div>
              
              {locations.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-lg">
                  <p className="text-slate-500">No locations found. Add your first location using the form.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div key={location._id} className="border border-pink-100 p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition-all">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${location.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <h3 className="text-xl font-bold text-yellow-600">
                            {location.name}
                          </h3>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingLocation(location);
                              setIsLocationModalOpen(true);
                            }}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 shadow-sm transition-all flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleLocationStatus(location._id, location.isActive)}
                            className={`px-3 py-1 ${
                              location.isActive 
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                                : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'
                            } text-white rounded-full shadow-sm transition-all`}
                          >
                            {location.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
    
    {/* Instructor Edit Modal */}
    <InstructorModal
      instructor={editingInstructor}
      isOpen={isInstructorModalOpen}
      onClose={() => {
        setIsInstructorModalOpen(false);
        setEditingInstructor(null);
      }}
      onUpdate={handleUpdateInstructor}
      onInstructorChange={handleInstructorChange}
      onImageUpload={handleEditInstructorImageUpload}
      locationMapping={locationMapping}
      locations={locations}
      onLocationChange={(locationName) => {
        if (!editingInstructor) return;
        
        const currentLocations = Array.isArray(editingInstructor.teachingLocations) 
          ? [...editingInstructor.teachingLocations] 
          : [];
        
        const newLocations = currentLocations.includes(locationName)
          ? currentLocations.filter(loc => loc !== locationName)
          : [...currentLocations, locationName];
        
        setEditingInstructor({
          ...editingInstructor,
          teachingLocations: newLocations
        });
      }}
    />
    
    {/* Instructor Absence Modal */}
    <AbsenceModal
      instructor={editingInstructor}
      isOpen={isAbsenceModalOpen}
      onClose={() => {
        setIsAbsenceModalOpen(false);
        setEditingInstructor(null);
      }}
      onSave={() => {
        fetchInstructors();
        setIsAbsenceModalOpen(false);
        setEditingInstructor(null);
      }}
    />
    
    {/* Location Edit Modal */}
    {isLocationModalOpen && editingLocation && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-yellow-600">Edit Location</h3>
            <button 
              onClick={() => {
                setIsLocationModalOpen(false);
                setEditingLocation(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateLocation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Location Name</label>
              <input
                type="text"
                value={editingLocation.name}
                onChange={(e) => handleLocationChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 transition-all"
                required
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={editingLocation.isActive}
                    onChange={(e) => handleLocationChange('isActive', e.target.checked)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${editingLocation.isActive ? 'bg-green-500' : 'bg-red-500'} transition-colors`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${editingLocation.isActive ? 'translate-x-6' : ''}`}></div>
                </div>
                <div className="ml-3 text-gray-700 font-medium">
                  {editingLocation.isActive ? 'Active' : 'Inactive'}
                </div>
              </label>
            </div>
            
            <div className="mt-6 flex space-x-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setEditingLocation(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full hover:from-yellow-600 hover:to-yellow-700 transition-colors shadow-md"
              >
                Update Location
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    
    {/* Invoice Modal */}
    {isInvoiceModalOpen && selectedBookingForInvoice && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Send Invoice</h3>
            <button 
              onClick={() => setIsInvoiceModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">Booking Details</h4>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Student:</p>
                <p className="font-medium">{selectedBookingForInvoice.user.firstName} {selectedBookingForInvoice.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{selectedBookingForInvoice.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Class Type:</p>
                <p className="font-medium">{selectedBookingForInvoice.classType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration:</p>
                <p className="font-medium">{selectedBookingForInvoice.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date:</p>
                <p className="font-medium">{new Date(selectedBookingForInvoice.date).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Time:</p>
                <p className="font-medium">{selectedBookingForInvoice.startTime} - {selectedBookingForInvoice.endTime}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmitInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice File (PDF)
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedInvoiceFile(e.target.files[0]);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number (Optional)
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., INV-2023-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 h-24"
                placeholder="Any additional information for the student..."
              />
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isUploadingInvoice || !selectedInvoiceFile}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isUploadingInvoice ? "Sending..." : "Send Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    
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
}