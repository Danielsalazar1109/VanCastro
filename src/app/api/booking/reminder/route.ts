import { NextRequest, NextResponse } from 'next/server';
import { sendReminderEmails } from '@/lib/utils/scheduler';
import { sendEmail } from '@/lib/utils/emailService';

/**
 * API route to manually trigger sending reminder emails to clients with bookings scheduled for the next day
 * 
 * Note: Reminder emails are automatically sent every 5 seconds by the scheduler for testing
 * This API endpoint can be used to manually trigger the sending of reminder emails if needed
 * 
 * Query parameters:
 * - test=true: Send a test email to the specified email address
 * - email: Email address to send the test email to (required if test=true)
 * 
 * @returns {NextResponse} Response with the result of the operation
 */
export async function GET(req: NextRequest) {
  try {
    // Check if this is a test email request
    const url = new URL(req.url);
    const isTest = url.searchParams.get('test') === 'true';
    const testEmail = url.searchParams.get('email');
    
    if (isTest) {
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Email parameter is required for test emails' },
          { status: 400 }
        );
      }
      
      console.log(`Sending test email to ${testEmail}`);
      
      // Send a test email
      const result = await sendEmail(testEmail, 'bookingReminder', {
        studentName: 'Test User',
        instructorName: 'Test Instructor',
        date: 'Tomorrow',
        startTime: '10:00 AM',
        location: 'Test Location',
        classType: 'class 7',
      });
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${testEmail}`,
          messageId: result.messageId,
          note: 'This is a test email to verify the email service is working correctly'
        });
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to send test email',
          details: result.error,
        }, { status: 500 });
      }
    }
    
    // Regular reminder email sending
    console.log('Manual trigger: Sending reminder emails via API');
    
    // Use the same function that the scheduler uses
    const result = await sendReminderEmails();
    
    return NextResponse.json({ 
      ...result,
      note: 'Reminder emails are automatically sent every 5 seconds for testing'
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return NextResponse.json(
      { error: 'Failed to send reminder emails' },
      { status: 500 }
    );
  }
}