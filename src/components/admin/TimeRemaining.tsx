"use client";

import { useState, useEffect } from "react";

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

export default TimeRemaining;