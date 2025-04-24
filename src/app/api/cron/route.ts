import { NextRequest, NextResponse } from 'next/server';
import { sendReminderEmails } from '@/lib/utils/scheduler';

/**
 * API route for Vercel Cron to trigger reminder emails
 * This is called by Vercel's cron service based on the schedule defined in vercel.json
 * 
 * @param req The incoming request
 */
export async function GET(req: NextRequest) {
  console.log('Vercel Cron: Reminder email job triggered', new Date().toISOString());
  
  // Check for proper authorization
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized access attempt to cron endpoint');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Call the sendReminderEmails function directly
    const result = await sendReminderEmails();
    
    console.log('Vercel Cron: Reminder email job completed successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Reminder emails sent successfully',
      result
    });
  } catch (error) {
    console.error('Vercel Cron: Error sending reminder emails:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send reminder emails',
      error: (error as Error).message
    }, { status: 500 });
  }
}