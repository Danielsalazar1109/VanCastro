"use client";

import { useState } from "react";

interface PhoneNumberFormProps {
  userId: string;
  onPhoneNumberAdded: () => void;
}

export default function PhoneNumberForm({ userId, onPhoneNumberAdded }: PhoneNumberFormProps) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!phone || phone.trim().length < 10) {
      setError("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update phone number");
      }

      setSuccess(true);
      setLoading(false);
      
      // Notify parent component that phone number was added
      setTimeout(() => {
        onPhoneNumberAdded();
      }, 1500);
    } catch (error: any) {
      console.error("Error updating phone number:", error);
      setError(error.message || "Failed to update phone number");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Add Your Phone Number</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Phone number updated successfully! Redirecting...
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We need your phone number to contact you about your bookings.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md ${
              loading
                ? "bg-gray-300 cursor-not-allowed text-gray-700"
                : "bg-yellow-400 hover:bg-yellow-500 text-black"
            }`}
          >
            {loading ? "Updating..." : "Save Phone Number"}
          </button>
        </form>
      )}
    </div>
  );
}