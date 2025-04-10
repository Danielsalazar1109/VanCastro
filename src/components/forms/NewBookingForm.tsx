"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CircularSelector from "./CircularSelector";
import Image from "next/image";

interface Instructor {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  locations: string[];
  classTypes: string[];
  image?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Schedule {
  _id: string;
  instructor: Instructor;
  date: string;
  slots: TimeSlot[];
}

interface NewBookingFormProps {
  userId: string;
}

interface StepNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  steps: string[];
}

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  currentStep, 
  onStepChange, 
  steps 
}) => {
  return (
    <div className="flex justify-between items-center w-full mb-6">
      {steps.map((step, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => onStepChange(index + 1)}
        >
          <div 
            className={`
              w-10 h-10 rounded-full flex items-center justify-center 
              border-2 transition-all duration-300 
              ${currentStep === index + 1 
                ? 'bg-yellow-400 border-yellow-500 scale-110' 
                : 'bg-white border-gray-300 group-hover:border-yellow-400'
              }
              ${index + 1 < currentStep 
                ? 'bg-green-400 border-green-500' 
                : ''
              }
            `}
          >
            <span 
              className={`
                font-bold 
                ${currentStep === index + 1 
                  ? 'text-black' 
                  : 'text-gray-600 group-hover:text-yellow-600'
                }
                ${index + 1 < currentStep 
                  ? 'text-green-600' 
                  : ''
                }
              `}
            >
              {index + 1}
            </span>
          </div>
          <span 
            className={`
              mt-2 text-sm transition-colors 
              ${currentStep === index + 1 
                ? 'font-bold text-black' 
                : 'text-gray-500 group-hover:text-yellow-600'
              }
              ${index + 1 < currentStep 
                ? 'text-green-600' 
                : ''
              }
            `}
          >
          </span>
        </div>
      ))}
    </div>
  );
};

const CircularOption = ({ 
  label, 
  options, 
  selectedValue, 
  onChange 
}: { 
  label: string, 
  options: string[], 
  selectedValue: string, 
  onChange: (value: string) => void 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-4">{label}</label>
      <div className="flex flex-wrap gap-4 justify-center">
        {options.map((option) => (
          <div 
            key={option}
            onClick={() => onChange(option)}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center 
              cursor-pointer transition-all duration-300 
              border-2 relative
              ${selectedValue === option 
                ? 'bg-yellow-400 border-yellow-500 scale-110 shadow-lg' 
                : 'bg-white border-gray-300 hover:border-yellow-400 hover:scale-105'}
            `}
          >
            <span 
              className={`
                text-sm font-semibold text-center 
                ${selectedValue === option ? 'text-black' : 'text-gray-700'}
              `}
            >
              {option}
            </span>
            {selectedValue === option && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                ✓
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorCard = ({ 
  instructor, 
  selected, 
  onSelect 
}: { 
  instructor: Instructor, 
  selected: boolean, 
  onSelect: (id: string) => void 
}) => {
  return (
    <div 
      onClick={() => onSelect(instructor._id)}
      className={`
        border-2 rounded-lg p-4 cursor-pointer transition-all duration-300
        flex flex-col items-center text-center
        ${selected 
          ? 'border-yellow-500 bg-yellow-50 scale-105 shadow-lg' 
          : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'}
      `}
    >
      <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
        <Image
          src={instructor.image || ''} 
          alt={instructor.user.firstName} 
          width={400} 
          height={400}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <h3 className="font-bold text-lg">
        {instructor.user.firstName} {instructor.user.lastName}
      </h3>
      {selected && (
        <div className="mt-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
          Selected
        </div>
      )}
    </div>
  );
};

const EnhancedDatePicker = ({ 
  value, 
  onChange, 
  minDate 
}: { 
  value: string, 
  onChange: (date: string) => void, 
  minDate: string 
}) => {
  const [selectedDate, setSelectedDate] = useState(value);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onChange(newDate);
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-4">
        Select Your Lesson Date
      </label>
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-400">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate}
          className="w-full bg-transparent text-center text-xl font-bold text-yellow-700 focus:outline-none"
        />
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>Earliest Date: {new Date(minDate).toLocaleDateString()}</span>
          <span>Selected: {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'None'}</span>
        </div>
      </div>
    </div>
  );
};

export default function NewBookingForm({ userId }: NewBookingFormProps) {
  const router = useRouter();
  
  // Load saved form state from localStorage on component mount
  const loadSavedState = () => {
    if (typeof window === 'undefined') return null;
    
    const savedState = localStorage.getItem(`booking_form_${userId}`);
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error("Error parsing saved form state:", e);
        return null;
      }
    }
    return null;
  };

  // Form state with localStorage persistence
  const savedState = loadSavedState();
  
  // Form state
  const [location, setLocation] = useState<string>(savedState?.location || "");
  const [classType, setClassType] = useState<string>(savedState?.classType || "");
  const [packageType, setPackageType] = useState<string>(savedState?.packageType || "");
  const [duration, setDuration] = useState<number>(savedState?.duration || 0);
  const [date, setDate] = useState<string>(savedState?.date || "");
  const [instructorId, setInstructorId] = useState<string>(savedState?.instructorId || "");
  const [timeSlot, setTimeSlot] = useState<string>(savedState?.timeSlot || "");
  const [price, setPrice] = useState<number | null>(savedState?.price || null);
  const [isPackageComplete, setIsPackageComplete] = useState<boolean>(savedState?.isPackageComplete || false);
  const [packageSize, setPackageSize] = useState<number>(savedState?.packageSize || 1);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(savedState?.discountedPrice || null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(savedState?.termsAccepted || false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(savedState?.termsAcceptedAt || null);
  
  // Data state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [userExistingBookings, setUserExistingBookings] = useState<any[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ value: string, alt: string }[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(savedState?.step || 1);
  const [checkingPackage, setCheckingPackage] = useState<boolean>(false);
  
  // Knowledge test modal state
  const [showKnowledgeTestModal, setShowKnowledgeTestModal] = useState<boolean>(false);
  const [hasPassedKnowledgeTest, setHasPassedKnowledgeTest] = useState<boolean | null>(savedState?.hasPassedKnowledgeTest || null);
  
  // Save form state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stateToSave = {
      location,
      classType,
      packageType,
      duration,
      date,
      instructorId,
      timeSlot,
      price,
      isPackageComplete,
      packageSize,
      discountedPrice,
      termsAccepted,
      termsAcceptedAt,
      step,
      hasPassedKnowledgeTest
    };
    
    localStorage.setItem(`booking_form_${userId}`, JSON.stringify(stateToSave));
  }, [
    location, 
    classType, 
    packageType, 
    duration, 
    date, 
    instructorId, 
    timeSlot, 
    price, 
    isPackageComplete, 
    packageSize, 
    discountedPrice, 
    termsAccepted, 
    termsAcceptedAt, 
    step, 
    hasPassedKnowledgeTest,
    userId
  ]);
  
  // Clear saved form state
  const clearSavedState = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`booking_form_${userId}`);
  };
  
  const classTypeOptions = [
    { 
      value: "class 4", 
      imageUrl: "https://media.istockphoto.com/id/865989884/vector/caucasian-bus-driver-sitting-at-steering-wheel.jpg?s=612x612&w=0&k=20&c=zmxXE-jde_xBtGSxqrdOxZWVS7idP6y3FcLiOHWO-cU=", 
      alt: "Class 4" 
    },
    { 
      value: "class 5", 
      imageUrl: "https://media.istockphoto.com/id/838089460/vector/female-hand-with-driver-license.jpg?s=612x612&w=0&k=20&c=bvednGjVoojSkZKYIjQ2IFR-IcwoqaoAOzzYY-OHmrY=", 
      alt: "Class 5" 
    },
    { 
      value: "class 7", 
      imageUrl: "https://www.drivesmartbc.ca/sites/default/files/L_N_Sign_640x200.jpg", 
      alt: "Class 7" 
    }
  ];

  const packageOptions = [
    { 
      value: "1 lesson", 
      alt: "1 Lesson Package" 
    },
    { 
      value: "3 lessons", 
      alt: "3 Lessons Package" 
    },
    { 
      value: "10 lessons", 
      alt: "10 Lessons Package" 
    }
  ];

  const durations = [60, 90,120];

  // Update handleClassTypeChange to work with the new structure
  const handleClassTypeChange = (selectedClassType: string) => {
    if (selectedClassType === "class 7") {
      setShowKnowledgeTestModal(true);
    } else {
      setClassType(selectedClassType);
      // Always set package type to "1 lesson"
      setPackageType("1 lesson");
    }
  };

  
  // Handle knowledge test modal response
  const handleKnowledgeTestResponse = (hasPassed: boolean) => {
    setHasPassedKnowledgeTest(hasPassed);
    if (hasPassed) {
      setClassType("class 7");
      // Always set package type to "1 lesson"
      setPackageType("1 lesson");
    } else {
      setClassType("");
    }
    setShowKnowledgeTestModal(false);
  };
  
  // Fetch locations from the API
  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await fetch('/api/locations?activeOnly=true');
      
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      
      const data = await response.json();
      
      if (data.locations && data.locations.length > 0) {
        // Transform locations to match the expected format
        const formattedLocations = data.locations.map((loc: any) => ({
          value: loc.name,
          alt: loc.name.includes(',') 
            ? `${loc.name.split(',')[0]} - ${loc.name.split(',')[1].trim()} Location`
            : `${loc.name} Location`
        }));
        
        setLocationOptions(formattedLocations);
      } else {
        // Fallback to hardcoded locations if none are found in the database
        setLocationOptions([
          { value: "Vancouver, 999 Kingsway", alt: "Vancouver - Kingsway Location" },
          { value: "Vancouver, 4126 McDonald St", alt: "Vancouver - McDonald St Location" },
          { value: "Burnaby, 3880 Lougheed Hwy", alt: "Burnaby - Lougheed Hwy Location" },
          { value: "Burnaby, 4399 Wayburne Dr", alt: "Burnaby - Wayburne Dr Location" },
          { value: "North Vancouver, 1331 Marine Drive", alt: "North Vancouver - Marine Drive Location" }
        ]);
      }
      
      setLoadingLocations(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
      
      // Fallback to hardcoded locations if there's an error
      setLocationOptions([
        { value: "Vancouver, 999 Kingsway", alt: "Vancouver - Kingsway Location" },
        { value: "Vancouver, 4126 McDonald St", alt: "Vancouver - McDonald St Location" },
        { value: "Burnaby, 3880 Lougheed Hwy", alt: "Burnaby - Lougheed Hwy Location" },
        { value: "Burnaby, 4399 Wayburne Dr", alt: "Burnaby - Wayburne Dr Location" },
        { value: "North Vancouver, 1331 Marine Drive", alt: "North Vancouver - Marine Drive Location" }
      ]);
      
      setLoadingLocations(false);
    }
  };

  // Fetch all prices and locations on component mount
  useEffect(() => {
    fetchPrices();
    fetchLocations();
  }, []);
  
  // Update price when class type, duration, and package are selected
  useEffect(() => {
    if (classType && duration && packageType) {
      updatePrice();
    }
  }, [classType, duration, packageType, prices]);
  
  // Check if this booking would complete a package when user, class type, and duration are selected
  useEffect(() => {
    if (userId && classType && duration) {
      checkPackageCompletion();
    }
  }, [userId, classType, duration]);
  
  // Also check when moving to step 3 (final step)
  useEffect(() => {
    if (step === 3 && userId && classType && duration) {
      console.log("Step 3 - Checking package completion");
      checkPackageCompletion();
    }
  }, [step]);
  
  // Load instructors based on selected location, class type, and date
  useEffect(() => {
    if (location && classType && date) {
      fetchInstructors();
    }
  }, [location, classType, date]);
  
  // State for availability
  const [globalAvailability, setGlobalAvailability] = useState<{day: string; isAvailable: boolean}[]>([]);
  const [specialAvailability, setSpecialAvailability] = useState<any[]>([]);
  const [loadingGlobalAvailability, setLoadingGlobalAvailability] = useState<boolean>(false);
  const [loadingSpecialAvailability, setLoadingSpecialAvailability] = useState<boolean>(false);
  const [dateIsAvailable, setDateIsAvailable] = useState<boolean>(true);
  const [showDateUnavailableModal, setShowDateUnavailableModal] = useState<boolean>(false);
  const [unavailableDayOfWeek, setUnavailableDayOfWeek] = useState<string>("");
  const [unavailableReason, setUnavailableReason] = useState<string>("");

  // Fetch global availability settings
  const fetchGlobalAvailability = async () => {
    try {
      setLoadingGlobalAvailability(true);
      const response = await fetch('/api/global-availability');
      
      if (!response.ok) {
        throw new Error('Failed to fetch global availability settings');
      }
      
      const data = await response.json();
      
      if (data.globalAvailability && data.globalAvailability.length > 0) {
        setGlobalAvailability(data.globalAvailability.map((item: any) => ({
          day: item.day,
          isAvailable: item.isAvailable
        })));
      }
      
      setLoadingGlobalAvailability(false);
    } catch (error) {
      console.error('Error fetching global availability:', error);
      setLoadingGlobalAvailability(false);
    }
  };

  // Fetch special availability for a specific date
  const fetchSpecialAvailability = async (dateStr: string) => {
    if (!dateStr) return;
    
    try {
      setLoadingSpecialAvailability(true);
      const response = await fetch(`/api/special-availability?checkDate=${dateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch special availability settings');
      }
      
      const data = await response.json();
      
      if (data.specialAvailability && data.specialAvailability.length > 0) {
        setSpecialAvailability(data.specialAvailability);
      } else {
        setSpecialAvailability([]);
      }
      
      setLoadingSpecialAvailability(false);
    } catch (error) {
      console.error('Error fetching special availability:', error);
      setLoadingSpecialAvailability(false);
    }
  };

  // Fetch global availability on component mount
  useEffect(() => {
    fetchGlobalAvailability();
  }, []);

  // Calculate minimum booking date (2 days from now)
  const getMinBookingDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    return minDate.toISOString().split("T")[0];
  };

  // Check if a date is available based on global and special availability settings
  const isDateAvailable = async (dateStr: string) => {
    if (!dateStr) return true;
    
    // Set time to noon to ensure consistent day interpretation in local timezone
    const date = new Date(dateStr + 'T12:00:00');
    // Use local timezone to match what the date picker returns
    const dayIndex = date.getDay();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
    
    console.log(`Checking availability for date: ${dateStr}`);
    console.log(`Date with noon time: ${date.toISOString()}`);
    console.log(`Day index from getDay(): ${dayIndex}`);
    console.log(`Day of week: ${dayOfWeek}`);
    
    // First check special availability for this specific date
    await fetchSpecialAvailability(dateStr);
    
    // If we have special availability settings for this date, they override global settings
    if (specialAvailability.length > 0) {
      console.log(`Found special availability settings for ${dateStr}:`, specialAvailability);
      
      // Find the special availability setting for this day of week
      const specialDayAvailability = specialAvailability.find(item => item.day === dayOfWeek);
      
      if (specialDayAvailability) {
        console.log(`Special availability for ${dayOfWeek} on ${dateStr}: isAvailable=${specialDayAvailability.isAvailable}`);
        
        if (!specialDayAvailability.isAvailable) {
          setUnavailableReason(`This date (${new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}) has special availability settings and is marked as unavailable.`);
          return false;
        }
      }
    }
    
    // If no special availability or the special availability doesn't make it unavailable,
    // check global availability
    if (globalAvailability.length === 0) {
      // If no global availability settings are loaded, use default (Sunday is unavailable)
      console.log(`No global availability settings loaded. Using default (Sunday is unavailable).`);
      if (dayOfWeek === 'Sunday') {
        setUnavailableReason(`Bookings are not allowed on Sundays as per default settings.`);
        return false;
      }
      return true;
    }
    
    console.log(`Global availability settings:`, globalAvailability);
    const dayAvailability = globalAvailability.find(item => item.day === dayOfWeek);
    console.log(`Day availability for ${dayOfWeek}:`, dayAvailability);
    
    // If no availability setting found for this day, use default (Sunday is unavailable)
    if (!dayAvailability) {
      console.log(`No availability setting found for ${dayOfWeek}. Using default (Sunday is unavailable).`);
      if (dayOfWeek === 'Sunday') {
        setUnavailableReason(`Bookings are not allowed on Sundays as per default settings.`);
        return false;
      }
      return true;
    }
    
    console.log(`${dayOfWeek} is ${dayAvailability.isAvailable ? 'available' : 'unavailable'}`);
    if (!dayAvailability.isAvailable) {
      setUnavailableReason(`Bookings are not allowed on ${dayOfWeek}s as per admin settings.`);
      return false;
    }
    
    return true;
  };

  // Function to handle date changes and check availability
  const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    
    // First check if the date is available
    const available = await isDateAvailable(newDate);
    
    if (!available) {
      // Use the same local timezone-based day of week determination as in isDateAvailable
      const date = new Date(newDate + 'T12:00:00');
      const dayIndex = date.getDay();
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
      
      // Set state to show the modal and disable the Next button
      setDateIsAvailable(false);
      setUnavailableDayOfWeek(dayOfWeek);
      setShowDateUnavailableModal(true);
      
      // Still set the date so the input shows the selected date
      setDate(newDate);
      return;
    }
    
    // Date is available
    setDateIsAvailable(true);
    setError("");
    setDate(newDate);
  };

  // Load schedules based on selected instructor, date, and duration
  useEffect(() => { 
    if (instructorId && date && duration && location) {
      fetchSchedules();
    }
  }, [instructorId, date, duration, location]);
  
  // Fetch all prices from the API
  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/prices');
      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }
      
      const data = await response.json();
      setPrices(data.prices || []);
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  };
  
  // Check if this booking would complete a package
  const checkPackageCompletion = async () => {
    if (!userId || !classType || !duration) {
      return;
    }
    
    try {
      setCheckingPackage(true);
      console.log(`Checking package completion for user ${userId}, class ${classType}, duration ${duration}`);
      
      // Fetch user's existing bookings for this class type and duration
      const response = await fetch(
        `/api/booking?userId=${userId}&status=approved`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch user bookings");
      }
      
      const data = await response.json();
      console.log (data);
      const bookings = data.bookings || [];
      
      // Filter bookings by class type and duration
      const filteredBookings = bookings.filter(
        (booking: any) => 
          booking.classType === classType && 
          booking.duration === duration &&
          booking.status !== 'cancelled'
      );

      console.log (bookings)
      console.log(filteredBookings);
      console.log(`Found ${filteredBookings.length} existing bookings for this class type and duration`);
      setUserExistingBookings(filteredBookings);
      
      // Determine if this booking completes a package
      let isComplete = false;
      let pkgSize = 1;
      
      if (classType === 'class 5' && duration === 90) {
        pkgSize = 3;
        // Check if this is the 3rd booking (user already has 2 bookings)
        if (filteredBookings.length === 2) {
          // This is the 3rd booking for Class 5 (90 min), complete the package
          isComplete = true;
          console.log("This is the 3rd booking for Class 5 (90 min), completing the package");
        } else if (filteredBookings.length >= 3 && ((filteredBookings.length + 1) % 3) === 0) {
          // Only apply discount to every 3rd booking (3rd, 6th, 9th, etc.)
          isComplete = true;
          console.log(`This is booking #${filteredBookings.length + 1} for Class 5 (90 min), completing another package`);
        }
      } else if (classType === 'class 7' && duration === 60) {
        pkgSize = 10;
        // Check if this is the 10th booking (user already has 9 bookings)
        if (filteredBookings.length === 9) {
          // This is the 10th booking for Class 7 (60 min), complete the package
          isComplete = true;
          console.log("This is the 10th booking for Class 7 (60 min), completing the package");
        } else if (filteredBookings.length >= 9 && ((filteredBookings.length + 1) % 10) === 0) {
          // Only apply discount to every 10th booking (10th, 20th, 30th, etc.)
          isComplete = true;
          console.log(`This is booking #${filteredBookings.length + 1} for Class 7 (60 min), completing another package`);
        }
      }
      
      // For debugging - log the package completion status
      console.log(`Package completion check: isComplete=${isComplete}, packageSize=${pkgSize}, existingBookings=${filteredBookings.length}`);
      
      // Note: The line below was used for testing purposes and has been removed
      // isComplete = true;
      
      console.log(`Package completion: ${isComplete}, Package size: ${pkgSize}`);
      setIsPackageComplete(isComplete);
      setPackageSize(pkgSize);
      
      // If this booking completes a package, calculate the discounted price
      if (isComplete) {
        calculateDiscountedPrice(pkgSize);
      } else {
        setDiscountedPrice(null);
      }
      
      setCheckingPackage(false);
    } catch (error) {
      console.error("Error checking package completion:", error);
      setCheckingPackage(false);
    }
  };
  
  // Calculate the discounted price for the last booking in a package
  const calculateDiscountedPrice = async (pkgSize: number) => {
    if (!classType || !duration || !price) {
      console.log("Cannot calculate discounted price - missing classType, duration, or price");
      return;
    }
    
    console.log(`Calculating discounted price for packageSize=${pkgSize}, classType=${classType}, duration=${duration}`);
    
    try {
      // Try to get the package price from the Price model
      const packageType = classType === 'class 5' ? '3 lessons' : '10 lessons';
      console.log(`Looking for package price for ${classType}, ${duration} min, ${packageType}`);
      
      // Find the package price in the already fetched prices
      const packagePriceRecord = prices.find(
        (p) => 
          p.classType === classType && 
          p.duration === duration && 
          p.package === packageType
      );
      
      let packagePrice;
      
      if (packagePriceRecord && packagePriceRecord.price) {
        packagePrice = packagePriceRecord.price;
        console.log(`Found package price in database: $${packagePrice}`);
      } else {
        // Fall back to default values if no price record is found
        if (classType === 'class 5' && duration === 90) {
          // Class 5 (90 min) package price: $262.50
          packagePrice = 262.50;
        } else if (classType === 'class 7' && duration === 60) {
          // Class 7 (60 min) package price: $892.50
          packagePrice = 892.50;
        }
        console.log(`Using default package price: $${packagePrice}`);
      }
      
      if (packagePrice) {
        // Calculate the individual lesson price from the package
        const individualPrice = packagePrice - price * (pkgSize - 1);
        console.log(`Regular price: $${price}, Package price: $${packagePrice}, Package size: ${pkgSize}`);
        console.log(`Calculated discounted price: $${individualPrice} = $${packagePrice} - $${price} * (${pkgSize} - 1)`);
        setDiscountedPrice(individualPrice);
      }
    } catch (error) {
      console.error("Error calculating discounted price:", error);
    }
  };
  
  // Update the price based on selected class type, duration, and package
  const updatePrice = () => {
    if (prices.length === 0 || !classType || !duration || !packageType) {
      return;
    }
    
    const matchingPrice = prices.find(
      (p) => 
        p.classType === classType && 
        p.duration === duration && 
        p.package === packageType
    );
    
    if (matchingPrice) {
      console.log(`Setting regular price to $${matchingPrice.price}`);
      setPrice(matchingPrice.price);
      
      // If this is the last booking in a package, recalculate the discounted price
      if (isPackageComplete && packageSize > 1) {
        console.log("Recalculating discounted price after price update");
        calculateDiscountedPrice(packageSize);
      }
    } else {
      console.log("No matching price found");
      setPrice(null);
      setDiscountedPrice(null);
    }
  };
  
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/instructors?location=${location}&classType=${classType}${date ? `&checkDate=${date}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch instructors");
      }
      
      const data = await response.json();
      setInstructors(data.instructors);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to load instructors. Please try again.");
      setLoading(false);
    }
  };
  
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      // Always regenerate the schedule with current parameters to ensure it's up-to-date
      // This ensures dynamic slot generation based on location, duration, and existing bookings
      const createResponse = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId,
          date,
          duration,
          location,
          userId
        }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Schedule generation error:", errorData);
        throw new Error(errorData.error || "Failed to generate schedule");
      }
      
      // Fetch the newly created/updated schedule
      const fetchResponse = await fetch(
        `/api/schedules?instructorId=${instructorId}&startDate=${date}&endDate=${date}&userId=${userId}`
      );
      
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch generated schedule");
      }
      
      const data = await fetchResponse.json();
      setSchedules(data.schedules);
      
      // Extract available time slots
      if (data.schedules && data.schedules.length > 0) {
        const schedule = data.schedules[0];
        const availableSlots = schedule.slots.filter(
          (slot: TimeSlot) => !slot.isBooked
        );
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching/generating schedules:", error);
      
      // Display specific error message from API if available
      if (error.message.includes("Instructor is not available") || 
          error.message.includes("No available time slots")) {
        setError(error.message);
      } else {
        setError("Failed to load schedule. Please try again.");
      }
      
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      // Get start time from selected time slot
      const selectedSlot = availableTimeSlots.find(
        slot => `${slot.startTime}-${slot.endTime}` === timeSlot
      );
      
      if (!selectedSlot) {
        throw new Error("Invalid time slot selected");
      }
      
      // Use discounted price if this is the last booking in a package
      const finalPrice = isPackageComplete && discountedPrice !== null ? discountedPrice : price;
      console.log(`Submitting booking with price: $${finalPrice} (isPackageComplete: ${isPackageComplete}, discountedPrice: ${discountedPrice}, regular price: ${price})`);
      
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          instructorId,
          location,
          classType,
          packageType,
          duration,
          date,
          startTime: selectedSlot.startTime,
          price: finalPrice,
          hasPassedKnowledgeTest: classType === "class 7" ? true : undefined,
          termsAccepted,
          termsAcceptedAt
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }
      
      // Clear saved form state after successful submission
      clearSavedState();
      
      // Redirect to confirmation page
      router.push(`/booking/confirmation?bookingId=${data.bookingId}`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      setError(error.message || "Failed to create booking. Please try again.");
      setLoading(false);
    }
  };
  
  const isStepValid = () => {
    switch (step) {
      case 1:
        return location !== "" && classType !== "" && packageType !== "" && duration !== 0;
      case 2:
        // Also check if the selected date is available
        return instructorId !== "" && date !== "" && dateIsAvailable;
      case 3:
        return timeSlot !== "";
      default:
        return false;
    }
  };
  
  // Knowledge Test Modal Component
  const KnowledgeTestModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Knowledge Test Verification</h3>
          <p className="mb-6">
            Class 7 lessons require that you have passed the knowledge test. 
            Have you already passed your knowledge test?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => handleKnowledgeTestResponse(false)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              No, I haven't
            </button>
            <button
              onClick={() => handleKnowledgeTestResponse(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Yes, I have
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Date Unavailable Modal Component
  const DateUnavailableModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 text-red-600">Date Not Available</h3>
          <p className="mb-6">
            {unavailableReason || `Bookings are not allowed on ${unavailableDayOfWeek}s as per admin settings.`}
            <br /><br />
            Please select a different date to continue.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowDateUnavailableModal(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-b from-white to-yellow-50 p-10 rounded-xl shadow-lg border border-yellow-200">
      <h2 className="text-3xl font-bold mb-8 text-center text-yellow-800">Book Your Driving Lesson</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {hasPassedKnowledgeTest === false && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
          You need to pass the knowledge test before booking a Class 7 lesson. Please select a different class type or complete your knowledge test first.
        </div>
      )}
      
      <StepNavigation 
        currentStep={step}
        onStepChange={(newStep) => {
          // Only allow moving to previous steps if form is valid
          if (newStep < step || isStepValid()) {
            setStep(newStep);
          }
        }}
        steps={['', '', '']}
      />
      
      {showKnowledgeTestModal && <KnowledgeTestModal />}
      {showDateUnavailableModal && <DateUnavailableModal />}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-8">
            {/* Location Selection - Traditional Radio Buttons */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Select Location
              </label>
              {loadingLocations ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : locationOptions.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800 text-center">
                  No locations available. Please try again later.
                </div>
              ) : (
                <div className="space-y-2">
                  {locationOptions.map((option) => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="location"
                        value={option.value}
                        checked={location === option.value}
                        onChange={() => setLocation(option.value)}
                        className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-gray-700">
                        {option.value}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Class Type - Keep CircularSelector */}
            <CircularSelector
              label="Select Class Type"
              options={classTypeOptions}
              selectedValue={classType}
              onChange={handleClassTypeChange}
            />
            
            {/* Package Information - Discount Text */}
            <div className="mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">Lesson Discounts</h3>
                <p className="text-sm text-gray-700 mb-3">
                  We offer special discounts when you accumulate multiple lessons over time:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                  <li>
                    <span className="font-semibold">Class 7 (60 minutes):</span> After accumulating 10 lessons, you'll receive a discount! 
                    <span className="text-green-600 font-medium"> $892.50</span> (Regular price: $945)
                  </li>
                  <li>
                    <span className="font-semibold">Class 5 (90 minutes):</span> After accumulating 3 lessons, you'll receive a discount! 
                    <span className="text-green-600 font-medium"> $262.50</span> (Regular price: $283.50)
                  </li>
                  <li>
                    <span className="font-semibold">Road Test (2 hours):</span> Available as a single lesson
                  </li>
                </ul>
                <p className="text-sm text-gray-700 mt-3 italic">
                  The system will automatically track your lessons and apply discounts when you reach the required number.
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Duration
              </label>
              <div className="flex gap-4 justify-center">
                {durations.map((dur) => (
                  <label key={dur} className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value={dur}
                      checked={duration === dur}
                      onChange={() => {
                        setDuration(dur);
                        // Always set package type to "1 lesson"
                        setPackageType("1 lesson");
                      }}
                      className="hidden"
                    />
                    <span
                      onClick={() => {
                        setDuration(dur);
                        // Always set package type to "1 lesson"
                        setPackageType("1 lesson");
                      }}
                      className={`
                        w-24 h-24 rounded-full flex items-center justify-center 
                        cursor-pointer transition-all duration-300 
                        border-2 text-center
                        ${duration === dur 
                          ? 'bg-yellow-400 border-yellow-500 scale-110' 
                          : 'bg-white border-gray-300 hover:border-yellow-400'}
                      `}
                    >
                      {dur === 120 ? "Road Test (2 hours)" : `${dur} min`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStepValid()}
                className={`px-4 py-2 rounded-md ${
                  isStepValid()
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : "bg-gray-300 cursor-not-allowed text-gray-700"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-8">
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-4">
                Select an Instructor
              </label>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : instructors.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800 text-center">
                  No instructors available for the selected location and class type.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {instructors.map((instructor) => (
                    <InstructorCard
                      key={instructor._id}
                      instructor={instructor}
                      selected={instructorId === instructor._id}
                      onSelect={setInstructorId}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Select Your Lesson Date
              </label>
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-yellow-300 hover:border-yellow-400 transition-all duration-300">
                {loadingGlobalAvailability ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  <>
                    <input
                      type="date"
                      value={date}
                      onChange={handleDateChange}
                      min={getMinBookingDate()}
                      className="w-full bg-transparent text-center text-xl font-bold text-yellow-700 focus:outline-none"
                    />
                    <div className="mt-3 text-xs text-gray-600">
                      <p>Note: Some days may be unavailable due to admin settings.</p>
                    </div>
                  </>
                )}
                <div className="flex justify-between mt-4 text-sm text-gray-600">
                  <span>Earliest Date: {new Date(getMinBookingDate()).toLocaleDateString()}</span>
                  <span>Selected: {date ? new Date(date + 'T00:00:00').toLocaleDateString() : 'None'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!isStepValid()}
                className={`px-4 py-2 rounded-md ${
                  isStepValid()
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : "bg-gray-300 cursor-not-allowed text-gray-700"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-8">
            <div className="mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-3">
                  Available Time Slots
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  These time slots are automatically generated based on global availability settings for {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}.
                </p>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md text-yellow-800 text-center">
                    No time slots available for the selected date and instructor.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {availableTimeSlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={`${slot.startTime}-${slot.endTime}`}
                          className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                            timeSlot === `${slot.startTime}-${slot.endTime}`
                              ? "bg-yellow-400 border-yellow-500 shadow-md transform scale-105"
                              : "bg-white border-gray-300 hover:border-yellow-400 hover:bg-yellow-50"
                          }`}
                          onClick={() => setTimeSlot(`${slot.startTime}-${slot.endTime}`)}
                        >
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                {availableTimeSlots.length > 0 && !timeSlot && (
                  <p className="text-sm text-red-500 mt-3">
                    Please select a time slot to continue.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-white p-6 rounded-lg border border-yellow-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-yellow-800">Booking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-2">
                  <p className="mb-2"><span className="font-semibold text-gray-700">Location:</span> <span className="text-gray-900">{location}</span></p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Class Type:</span> <span className="text-gray-900">{classType}</span></p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Package:</span> <span className="text-gray-900">{packageType}</span></p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Duration:</span> <span className="text-gray-900">{duration} minutes</span></p>
                  {isPackageComplete && discountedPrice !== null ? (
                    <div>
                      <p className="mb-2">
                        <span className="font-semibold text-gray-700">Regular Price:</span>{" "}
                        <span className="text-gray-500 line-through">${price !== null ? price.toFixed(2) : '0.00'}</span>
                      </p>
                      <p className="mb-2">
                        <span className="font-semibold text-gray-700">Discounted Price:</span>{" "}
                        <span className="text-green-600 font-semibold">${discountedPrice.toFixed(2)}</span>
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Package Discount
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 italic">
                        This is your {packageSize}th lesson in a {packageSize}-lesson package!
                      </p>
                    </div>
                  ) : price !== null && (
                    <p className="mb-2">
                      <span className="font-semibold text-gray-700">Price:</span>{" "}
                      <span className="text-green-600 font-semibold">${price.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <div className="p-2">
                  <p className="mb-2"><span className="font-semibold text-gray-700">Date:</span> <span className="text-gray-900">{date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}</span></p>
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">Instructor:</span>{" "}
                    <span className="text-gray-900">
                      {instructors.find(i => i._id === instructorId)?.user.firstName}{" "}
                      {instructors.find(i => i._id === instructorId)?.user.lastName}
                    </span>
                  </p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Time:</span> <span className="text-gray-900">{timeSlot}</span></p>
                  {classType === "class 7" && (
                    <p className="mb-2"><span className="font-semibold text-gray-700">Knowledge Test:</span> <span className="text-green-600 font-medium">Passed</span></p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) {
                        setTermsAcceptedAt(new Date().toISOString());
                      } else {
                        setTermsAcceptedAt(null);
                      }
                    }}
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-yellow-300"
                    required
                  />
                </div>
                <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-700">
                  I agree to the <a href={classType ? `/contracts/${classType.replace(/\s+/g, '')}` : "#"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terms and Conditions</a> 
                </label>
              </div>
              {step === 3 && timeSlot !== "" && !termsAccepted && (
                <p className="text-sm text-red-500 mt-2">
                  You must accept the terms and conditions to continue.
                </p>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={loading || !isStepValid() || !termsAccepted}
                className={`px-4 py-2 rounded-md ${
                  !loading && isStepValid() && termsAccepted
                    ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                    : "bg-gray-300 cursor-not-allowed text-gray-700"
                }`}
              >
                {loading ? "Processing..." : "Book Now"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}