"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Get the callback URL from the query parameters
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  useEffect(() => {
    // If user is not authenticated or loading, do nothing
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    if (status === 'loading') {
      return;
    }
    
    // If user is authenticated, check if they already have a phone number
    if (status === 'authenticated' && session?.user?.email) {
      // If they already have a phone number, redirect to the callback URL
      if (session.user.phone && session.user.phone !== '') {
        router.push(callbackUrl);
        return;
      }
      
      // Otherwise, fetch their user ID
      fetchUserId(session.user.email);
    }
  }, [session, status, router, callbackUrl]);
  
  const fetchUserId = async (email: string) => {
    try {
      const response = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (data.users && data.users.length > 0) {
        setUserId(data.users[0]._id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user ID:', error);
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!phone || phone.trim().length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    
    if (!userId) {
      setError("User ID not found. Please try again later.");
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      // Update the user's phone number
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
      
      // Update the session to include the phone number
      await update({
        ...session,
        user: {
          ...session?.user,
          phone,
        },
      });
      
      // Redirect to the callback URL
      router.push(callbackUrl);
    } catch (error: any) {
      console.error("Error updating phone number:", error);
      setError(error.message || "Failed to update phone number");
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We need your phone number to contact you about your bookings
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={submitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black ${
                submitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              }`}
            >
              {submitting ? "Saving..." : "Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}