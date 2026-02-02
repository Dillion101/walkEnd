import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SendEventNotificationRequest {
  eventTitle: string
  eventDate: string
  eventLocation?: string
  eventDescription?: string
  imageUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendEventNotificationRequest = await request.json()

    // Validate required fields
    if (!body.eventTitle || !body.eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields: eventTitle, eventDate' },
        { status: 400 }
      )
    }

    // Fetch all users from Supabase
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('email_confirmed_at', 'not.is.null')

    if (usersError) {
      console.error('Error fetching users:', usersError)
      // Continue anyway - try to send at least
    }

    const userEmails = users?.map((u: any) => u.email) || []

    if (userEmails.length === 0) {
      return NextResponse.json(
        { message: 'No users found to notify', sent: 0 },
        { status: 200 }
      )
    }

    // Send emails to all users
    const promises = userEmails.map((email: string) =>
      resend.emails.send({
        from: 'WalkEnd WeekEnd <onboarding@resend.dev>',
        to: email,
        subject: `New Run Scheduled: ${body.eventTitle} 🏃`,
        html: generateEventEmailHTML(
          body.eventTitle,
          body.eventDate,
          body.eventLocation,
          body.eventDescription,
          body.imageUrl
        ),
      })
    )

    const results = await Promise.allSettled(promises)
    const successful = results.filter((r) => r.status === 'fulfilled').length

    console.log(`Event notification sent to ${successful}/${userEmails.length} users`)

    return NextResponse.json(
      { message: 'Event notifications sent', sent: successful, total: userEmails.length },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending event notifications:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

function generateEventEmailHTML(
  eventTitle: string,
  eventDate: string,
  eventLocation?: string,
  eventDescription?: string,
  imageUrl?: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .event-image { width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0; display: block; }
          .event-preview { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FF8C00; }
          .event-preview h3 { margin: 0 0 10px 0; color: #333; }
          .event-detail { margin: 8px 0; }
          .event-detail strong { color: #FF8C00; }
          .button { background: #FF8C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Run Scheduled! 🏃</h1>
          </div>
          <div class="content">
            <p>Hey runner,</p>
            <p>We have a new run coming up that you might want to join:</p>
            ${imageUrl ? `<img src="${imageUrl}" alt="${eventTitle}" class="event-image" />` : ''}
            <div class="event-preview">
              <h3>${eventTitle}</h3>
              <div class="event-detail"><strong>Date:</strong> ${eventDate}</div>
              ${eventLocation ? `<div class="event-detail"><strong>Location:</strong> ${eventLocation}</div>` : ''}
              ${eventDescription ? `<div class="event-detail"><strong>Description:</strong> ${eventDescription}</div>` : ''}
            </div>
            <p>Mark your calendar and join us!</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com'}/event-calendar" class="button">
                View & Register
              </a>
            </p>
          </div>
          <div class="footer">
            <p>© 2026 WalkEnd WeekEnd. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
