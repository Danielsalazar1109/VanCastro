"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  
  // Data state
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  
  // Knowledge test modal state
  const [showKnowledgeTestModal, setShowKnowledgeTestModal] = useState<boolean>(false);
  const [hasPassedKnowledgeTest, setHasPassedKnowledgeTest] = useState<boolean | null>(null);
  
  // Constants
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  const classTypes = ["class 4", "class 5", "class 7"];
  const packageTypes = ["1 lesson", "3 lessons", "10 lessons"];
  const durations = [60, 90, 120];
  
  // Handle class type change
  const handleClassTypeChange = (selectedClassType: string) => {
    if (selectedClassType === "class 7") {
      setShowKnowledgeTestModal(true);
    } else {
      setClassType(selectedClassType);
    }
  };
  
  // Handle knowledge test modal response
  const handleKnowledgeTestResponse = (hasPassed: boolean) => {
    setHasPassedKnowledgeTest(hasPassed);
    if (hasPassed) {
      setClassType("class 7");
    } else {
      setClassType("");
    }
    setShowKnowledgeTestModal(false);
  };
  
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

  console.log ("availableTimeSlots", availableTimeSlots);
  
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
  
  const nextStep = () => {
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setStep(step - 1);
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
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Book Your Driving Lesson</h2>
      
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
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div 
            className={`w-1/3 text-center p-2 rounded-l-lg ${
              step === 1 ? "bg-yellow-400 text-black" : "bg-gray-200"
            }`}
          >
            1. Select Package
          </div>
          <div 
            className={`w-1/3 text-center p-2 ${
              step === 2 ? "bg-yellow-400 text-black" : "bg-gray-200"
            }`}
          >
            2. Select Instructor
          </div>
          <div 
            className={`w-1/3 text-center p-2 rounded-r-lg ${
              step === 3 ? "bg-yellow-400 text-black" : "bg-gray-200"
            }`}
          >
            3. Select Time
          </div>
        </div>
      </div>
      
      {showKnowledgeTestModal && <KnowledgeTestModal />}
      
      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Class Type
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={classType}
                onChange={(e) => handleClassTypeChange(e.target.value)}
                required
              >
                <option value="">Select Class Type</option>
                {classTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Package
              </label>
              <select
                className="w-full p-2 border rounded-md"
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                required
              >
                <option value="">Select Package</option>
                {packageTypes.map((pkg) => (
                  <option key={pkg} value={pkg}>
                    {pkg}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Duration
              </label>
              <div className="flex gap-4">
                {durations.map((dur) => (
                  <label key={dur} className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value={dur}
                      checked={duration === dur}
                      onChange={() => setDuration(dur)}
                      className="mr-2"
                      required
                    />
                    {dur} minutes
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={nextStep}
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
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Instructor
              </label>
              {loading ? (
                <p>Loading instructors...</p>
              ) : instructors.length === 0 ? (
                <p>No instructors available for the selected location and class type.</p>
              ) : (
                <select
                  className="w-full p-2 border rounded-md"
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  required
                >
                  <option value="">Select Instructor</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.user.firstName} {instructor.user.lastName}
                    </option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Date
              </label>
              <input
                type="date"
                className="w-full p-2 border rounded-md"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getMinBookingDate()}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Bookings must be made at least 2 days in advance.
              </p>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded-md"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
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
          <div>
            <div className="mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Available Time Slots
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  These time slots are automatically generated based on the instructor's availability for {date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : ''}.
                </p>
                {loading ? (
                  <p>Loading time slots...</p>
                ) : availableTimeSlots.length === 0 ? (
                  <p>No time slots available for the selected date and instructor.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {availableTimeSlots
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((slot) => (
                        <div
                          key={`${slot.startTime}-${slot.endTime}`}
                          className={`p-3 border rounded-md text-center cursor-pointer transition-colors ${
                            timeSlot === `${slot.startTime}-${slot.endTime}`
                              ? "bg-yellow-400 border-yellow-500"
                              : "bg-white hover:bg-yellow-100"
                          }`}
                          onClick={() => setTimeSlot(`${slot.startTime}-${slot.endTime}`)}
                        >
                          {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                  </div>
                )}
                {availableTimeSlots.length > 0 && !timeSlot && (
                  <p className="text-sm text-red-500 mt-2">
                    Please select a time slot to continue.
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6 bg-gray-100 p-4 rounded-md">
              <h3 className="font-bold mb-2">Booking Summary</h3>
              <p><span className="font-semibold">Location:</span> {location}</p>
              <p><span className="font-semibold">Class Type:</span> {classType}</p>
              <p><span className="font-semibold">Package:</span> {packageType}</p>
              <p><span className="font-semibold">Duration:</span> {duration} minutes</p>
              <p><span className="font-semibold">Date:</span> {date}</p>
              <p>
                <span className="font-semibold">Instructor:</span>{" "}
                {instructors.find(i => i._id === instructorId)?.user.firstName}{" "}
                {instructors.find(i => i._id === instructorId)?.user.lastName}
              </p>
              <p><span className="font-semibold">Time:</span> {timeSlot}</p>
              {classType === "class 7" && (
                <p><span className="font-semibold">Knowledge Test:</span> Passed</p>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={prevStep}
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