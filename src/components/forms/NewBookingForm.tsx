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
                  ? 'text-white' 
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
            {step}
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
        <span className="text-3xl font-bold text-gray-600">
          {instructor.user.firstName[0]}{instructor.user.lastName[0]}
        </span>
      </div>
      <h3 className="font-bold text-lg">
        {instructor.user.firstName} {instructor.user.lastName}
      </h3>
      <p className="text-sm text-gray-600">
        {instructor.locations.join(', ')}
      </p>
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
  
  // Form state
  const [location, setLocation] = useState<string>("");
  const [classType, setClassType] = useState<string>("");
  const [packageType, setPackageType] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [date, setDate] = useState<string>("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  
  // Data state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  
  // Knowledge test modal state
  const [showKnowledgeTestModal, setShowKnowledgeTestModal] = useState<boolean>(false);
  const [hasPassedKnowledgeTest, setHasPassedKnowledgeTest] = useState<boolean | null>(null);
  
  const locationOptions = [
    { 
      value: "Surrey",  
      alt: "Surrey Location" 
    },
    { 
      value: "Burnaby", 
      alt: "Burnaby Location" 
    },
    { 
      value: "North Vancouver",  
      alt: "North Vancouver Location" 
    }
  ];

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
  
  // Fetch all prices on component mount
  useEffect(() => {
    fetchPrices();
  }, []);
  
  // Update price when class type, duration, and package are selected
  useEffect(() => {
    if (classType && duration && packageType) {
      updatePrice();
    }
  }, [classType, duration, packageType, prices]);
  
  // Load instructors based on selected location and class type
  useEffect(() => {
    if (location && classType) {
      fetchInstructors();
    }
  }, [location, classType]);
  
  // Calculate minimum booking date (2 days from now)
  const getMinBookingDate = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    return minDate.toISOString().split("T")[0];
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
      setPrice(matchingPrice.price);
    } else {
      setPrice(null);
    }
  };
  
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/instructors?location=${location}&classType=${classType}`
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
          location
        }),
      });
      
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Schedule generation error:", errorData);
        throw new Error(errorData.error || "Failed to generate schedule");
      }
      
      // Fetch the newly created/updated schedule
      const fetchResponse = await fetch(
        `/api/schedules?instructorId=${instructorId}&startDate=${date}&endDate=${date}`
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
          price: price,
          hasPassedKnowledgeTest: classType === "class 7" ? true : undefined
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }
      
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
        return instructorId !== "" && date !== "";
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
        steps={['Select Package', 'Select Instructor', 'Select Time']}
      />
      
      {showKnowledgeTestModal && <KnowledgeTestModal />}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-8">
            {/* Location Selection - Styled Select Dropdown */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-3">
                Select Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block appearance-none w-full bg-white border-2 border-yellow-300 hover:border-yellow-400 px-4 py-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 text-gray-700 font-medium"
                >
                  <option value="">Select a location</option>
                  {locationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-yellow-600">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Class Type - Keep CircularSelector */}
            <CircularSelector
              label="Class Type"
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
                Duration
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
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={getMinBookingDate()}
                  className="w-full bg-transparent text-center text-xl font-bold text-yellow-700 focus:outline-none"
                />
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
                  These time slots are automatically generated based on the instructor's availability for {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}.
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
                  {price !== null && (
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
                disabled={loading || !isStepValid()}
                className={`px-4 py-2 rounded-md ${
                  !loading && isStepValid()
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