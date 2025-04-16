import { NextRequest } from 'next/server';
import LoginAttempt from '@/models/LoginAttempt';
import connectToDatabase from '@/lib/db/mongodb';

// Rate limiter configuration
const MAX_ATTEMPTS = 5; // Maximum 5 attempts per day

/**
 * Extracts the IP address from the request
 */
export const getIpAddress = (request: NextRequest): string => {
  // Get IP from X-Forwarded-For header or directly from the connection
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs separated by commas
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  // If no X-Forwarded-For, try to get IP from 'ip' property
  // If not available, use a default string
  return '0.0.0.0';
};

/**
 * Records a login attempt in the database
 */
export const recordLoginAttempt = async (
  email: string, 
  ipAddress: string, 
  successful: boolean
): Promise<void> => {
  await connectToDatabase();
  
  await LoginAttempt.create({
    email,
    ipAddress,
    timestamp: new Date(),
    successful
  });
};

/**
 * Gets the start of the current day in local timezone
 */
export const getStartOfDay = (): Date => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  return startOfDay;
};

/**
 * Checks if a user has exceeded the maximum number of failed attempts
 * Returns true if the limit has been exceeded, false otherwise
 */
export const hasExceededMaxAttempts = async (
  email: string, 
  ipAddress: string
): Promise<boolean> => {
  await connectToDatabase();
  
  // Get the start of the current day
  const startOfDay = getStartOfDay();
  
  // Count failed attempts within the current calendar day
  const failedAttempts = await LoginAttempt.countDocuments({
    email,
    ipAddress,
    timestamp: { $gte: startOfDay },
    successful: false
  });
  
  return failedAttempts >= MAX_ATTEMPTS;
};

/**
 * Gets the number of failed attempts and reset time
 */
export const getAttemptsInfo = async (
  email: string, 
  ipAddress: string
): Promise<{ attemptsRemaining: number; nextResetTime: Date }> => {
  await connectToDatabase();
  
  // Get the start of the current day
  const startOfDay = getStartOfDay();
  
  // Count failed attempts within the current calendar day
  const failedAttempts = await LoginAttempt.countDocuments({
    email,
    ipAddress,
    timestamp: { $gte: startOfDay },
    successful: false
  });
  
  // Calculate next reset time (start of next day)
  const tomorrow = new Date(startOfDay);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - failedAttempts),
    nextResetTime: tomorrow
  };
};
