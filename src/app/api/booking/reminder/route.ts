import { NextRequest, NextResponse } from 'next/server';
import { sendReminderEmails } from '@/lib/utils/scheduler';

/**
 * API route to manually trigger sending reminder emails to clients with bookings scheduled for the next day
 * 
 * Note: Reminder emails are automatically sent daily at 10:05 PM by the scheduler
 * This API endpoint can be used to manually trigger the sending of reminder emails if needed
 * 
 * @returns {NextResponse} Response with the result of the operation
 */
export async function GET(req: NextRequest) {
  try {
    console.log('Manual trigger: Sending reminder emails via API');
    
    // Use the same function that the scheduler uses
    const result = await sendReminderEmails();
    
    return NextResponse.json({ 
      ...result,
      note: 'Reminder emails are automatically sent daily at 10:05 PM'
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder emails' },
      { status: 500 }
    );
  }
}