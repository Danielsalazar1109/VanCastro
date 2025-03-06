'use client';

import { useState } from 'react';
import Link from 'next/link';

// This is a simplified booking page. In a real implementation, you would:
// 1. Fetch available time slots from Calendly API
// 2. Implement a multi-step booking process
// 3. Add form validation
// 4. Connect to Stripe for payment processing

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: 'beginner',
    date: '',
    timeSlot: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // In a real implementation, you would:
    // 1. Submit the booking data to your API
    // 2. Redirect to Stripe payment
    // 3. Handle success/failure
    
    alert('Booking submitted! In a real implementation, you would be redirected to payment.');
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
                className="form-input"
              >
                <option value="beginner">Beginner Lessons ($50/hour)</option>
                <option value="refresher">Refresher Course ($45/hour)</option>
                <option value="test">Test Preparation ($55/hour)</option>
              </select>
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
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                required
              />
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
                className="form-input"
                required
              >
                <option value="">Select a time slot</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="3:00 PM">3:00 PM</option>
              </select>
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
                  className="form-input"
                  required
                />
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
                  className="form-input"
                  required
                />
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
                className="form-input"
                required
              />
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
                className="form-input"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-8">Book Your Driving Lesson</h1>
      
      {renderStepIndicator()}
      
      <div className="bg-white p-8 rounded-lg shadow-md">
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
              <Link href="/" className="btn-secondary">
                Cancel
              </Link>
            )}
            
            <button type="submit" className="btn-primary">
              {step < 3 ? 'Continue' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
