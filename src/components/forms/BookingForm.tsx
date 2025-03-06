'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  onSubmit?: (data: BookingFormData) => void;
  initialStep?: number;
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  timeSlot: string;
}

export default function BookingForm({ onSubmit, initialStep = 1 }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: 'beginner',
    date: '',
    timeSlot: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is changed
    if (errors[name as keyof BookingFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateStep = () => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
    
    if (step === 1) {
      if (!formData.service) {
        newErrors.service = 'Please select a service';
      }
    } else if (step === 2) {
      if (!formData.date) {
        newErrors.date = 'Please select a date';
      }
      if (!formData.timeSlot) {
        newErrors.timeSlot = 'Please select a time slot';
      }
    } else if (step === 3) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
      return;
    }
    
    try {
      // In a real implementation, you would submit the form data to your API
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      // Redirect to Stripe checkout
      // In a real implementation, you would use Stripe.js to redirect to checkout
      router.push(`/booking/confirmation?session_id=${data.sessionId}`);
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= i ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {i}
          </div>
          {i < 3 && (
            <div
              className={`w-12 h-1 ${
                step > i ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Select a Service</h2>
            <div className="mb-4">
              <label htmlFor="service" className="form-label">
                Service Type
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className={`form-input ${errors.service ? 'border-red-500' : ''}`}
              >
                <option value="beginner">Beginner Lessons ($50/hour)</option>
                <option value="refresher">Refresher Course ($45/hour)</option>
                <option value="test">Test Preparation ($55/hour)</option>
              </select>
              {errors.service && <p className="form-error">{errors.service}</p>}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Choose Date & Time</h2>
            <div className="mb-4">
              <label htmlFor="date" className="form-label">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`form-input ${errors.date ? 'border-red-500' : ''}`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="form-error">{errors.date}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="timeSlot" className="form-label">
                Time Slot
              </label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                className={`form-input ${errors.timeSlot ? 'border-red-500' : ''}`}
              >
                <option value="">Select a time slot</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="3:00 PM">3:00 PM</option>
              </select>
              {errors.timeSlot && <p className="form-error">{errors.timeSlot}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Note: In a real implementation, these would be dynamically loaded from Calendly
              </p>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-semibold mb-6">Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? 'border-red-500' : ''}`}
                />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? 'border-red-500' : ''}`}
                />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="form-error">{errors.phone}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      {renderStepIndicator()}
      
      <form onSubmit={handleSubmit}>
        {renderStepContent()}
        
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
          )}
          
          <button type="submit" className="btn-primary">
            {step < 3 ? 'Continue' : 'Proceed to Payment'}
          </button>
        </div>
      </form>
    </div>
  );
}
