// This is a server component that initializes the scheduler when the app starts
import { headers } from 'next/headers';

async function initScheduler() {
  try {
    // Get the host from the headers
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // Call the API route to initialize the scheduler
    const response = await fetch(`${protocol}://${host}/api/init-scheduler`, {
      cache: 'no-store' // Ensure the request is not cached
    });
    
    if (!response.ok) {
      throw new Error('Failed to initialize scheduler');
    }
    
    const data = await response.json();
    console.log('Scheduler initialization response:', data);
  } catch (error) {
    console.error('Error initializing scheduler:', error);
  }
  
  return null;
}

export default async function InitScheduler() {
  // Call the initialization function
  await initScheduler();
  
  // Return null as this component doesn't render anything
  return null;
}