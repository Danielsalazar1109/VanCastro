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
  location: string;
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
  
  // Constants
  const locations = ["Surrey", "Burnaby", "North Vancouver"];
  const classTypes = ["class 4", "class 5", "class 7"];
  const packageTypes = ["1 lesson", "3 lessons", "10 lessons"];
  const durations = [60, 90];
  
  // Load instructors based on selected location and class type
  useEffect(() => {
    if (location && classType) {
      fetchInstructors();
    }
  }, [location, classType]);
  
  // Load schedules based on selected instructor and date
  useEffect(() => {
    if (instructorId && date) {
      fetchSchedules();
    }
  }, [instructorId, date]);
  
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
      const response = await fetch(
        `/api/schedules?instructorId=${instructorId}&startDate=${date}&endDate=${date}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch schedules");
      }
      
      const data = await response.json();
      setSchedules(data.schedules);
      
      // Extract available time slots
      if (data.schedules && data.schedules.length > 0) {
        const schedule = data.schedules[0];
        const availableSlots = schedule.slots.filter(
          (slot: TimeSlot) => !slot.isBooked && slot.location === location
        );
        setAvailableTimeSlots(availableSlots);
      } else {
        setAvailableTimeSlots([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setError("Failed to load schedules. Please try again.");
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
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }
      
      // Redirect to Stripe checkout
      if (data.sessionId) {
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        router.push(`/booking/confirmation?bookingId=${data.bookingId}`);
      }
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
  
  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Book Your Driving Lesson</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
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
                onChange={(e) => setClassType(e.target.value)}
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
                min={new Date().toISOString().split("T")[0]}
                required
              />
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
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Time Slot
              </label>
              {loading ? (
                <p>Loading time slots...</p>
              ) : availableTimeSlots.length === 0 ? (
                <p>No time slots available for the selected date and instructor.</p>
              ) : (
                <select
                  className="w-full p-2 border rounded-md"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  required
                >
                  <option value="">Select Time Slot</option>
                  {availableTimeSlots.map((slot) => (
                    <option
                      key={`${slot.startTime}-${slot.endTime}`}
                      value={`${slot.startTime}-${slot.endTime}`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
              )}
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