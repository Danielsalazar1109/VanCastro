import { NextResponse } from 'next/server';
import { initScheduler } from '@/lib/utils/scheduler';

// Initialize the scheduler when the module is loaded
console.log('Initializing scheduler from API route module...');
initScheduler();
console.log('Scheduler initialized from API route module');

// Flag to track that the scheduler has been initialized
let schedulerInitialized = true;

/**
 * API route to check if the scheduler is initialized
 * This ensures the reminder emails are sent every 5 seconds regardless of which page is open
 */
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Scheduler is initialized',
    isInitialized: schedulerInitialized
  });
}