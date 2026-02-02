import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailTemplate {
  to: string
  subject: string
  html: string
}

// Email templates
export const emailTemplates = {
  welcome: (fullName: string, email: string): EmailTemplate => ({
    to: email,
    subject: 'Welcome to WalkEnd WeekEnd! 🏃',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .content { padding: 20px 0; }
            .button { background: #FF8C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to WalkEnd WeekEnd!</h1>
            </div>
            <div class="content">
              <p>Hi ${fullName || 'Runner'},</p>
              <p>Welcome to our running community! We're excited to have you join us.</p>
              <p>You can now:</p>
              <ul>
                <li>Join our upcoming runs and events</li>
                <li>Browse our gallery of past events</li>
                <li>Read training tips from experienced runners</li>
                <li>Shop our exclusive merchandise</li>
              </ul>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com'}" class="button">
                  Explore WalkEnd WeekEnd
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 WalkEnd WeekEnd. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  eventRegistration: (userName: string, userEmail: string, eventTitle: string, eventDate: string, eventLocation: string): EmailTemplate => ({
    to: userEmail,
    subject: `You're registered for ${eventTitle} 🏃`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .event-details { background: #f5f5f5; padding: 15px; border-left: 4px solid #FF8C00; margin: 20px 0; }
            .event-details p { margin: 8px 0; }
            .button { background: #FF8C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Confirmed! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Great! You're registered for our upcoming run. Here are the details:</p>
              <div class="event-details">
                <p><strong>Event:</strong> ${eventTitle}</p>
                <p><strong>Date & Time:</strong> ${eventDate}</p>
                <p><strong>Location:</strong> ${eventLocation}</p>
              </div>
              <p>We're looking forward to seeing you there! Bring your energy and let's run together!</p>
              <p>If you have any questions or need to cancel, reply to this email.</p>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com'}" class="button">
                  View Event Details
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 WalkEnd WeekEnd. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  newBlogPost: (userEmail: string, postTitle: string, postExcerpt: string): EmailTemplate => ({
    to: userEmail,
    subject: `New Blog Post: ${postTitle} 📝`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
            .post-preview { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .button { background: #FF8C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
            .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Blog Post Published! 📝</h1>
            </div>
            <div class="content">
              <p>Hey there,</p>
              <p>We just published a new blog post that might interest you:</p>
              <div class="post-preview">
                <h3>${postTitle}</h3>
                <p>${postExcerpt}</p>
              </div>
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com'}/blog" class="button">
                  Read Full Post
                </a>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 WalkEnd WeekEnd. All rights reserved.</p>
              <p>You're receiving this because you're subscribed to our updates.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  newEvent: (
    userEmail: string,
    eventTitle: string,
    eventDate: string,
    eventLocation?: string,
    eventDescription?: string,
    imageUrl?: string
  ): EmailTemplate => ({
    to: userEmail,
    subject: `New Run Scheduled: ${eventTitle} 🏃`,
    html: `
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
    `,
  }),
}

export async function sendEmail(template: EmailTemplate) {
  try {
    const response = await resend.emails.send({
      from: 'WalkEnd WeekEnd <onboarding@resend.dev>',
      to: template.to,
      subject: template.subject,
      html: template.html,
    })

    if (response.error) {
      console.error('Resend error:', response.error)
      throw new Error(response.error.message)
    }

    console.log('Email sent successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendWelcomeEmail(fullName: string, email: string) {
  const template = emailTemplates.welcome(fullName, email)
  return sendEmail(template)
}

export async function sendEventRegistrationEmail(
  userName: string,
  userEmail: string,
  eventTitle: string,
  eventDate: string,
  eventLocation: string
) {
  const template = emailTemplates.eventRegistration(userName, userEmail, eventTitle, eventDate, eventLocation)
  return sendEmail(template)
}

export async function sendNewBlogPostEmail(userEmail: string, postTitle: string, postExcerpt: string) {
  const template = emailTemplates.newBlogPost(userEmail, postTitle, postExcerpt)
  return sendEmail(template)
}

export async function sendNewEventEmail(
  userEmail: string,
  eventTitle: string,
  eventDate: string,
  eventLocation?: string,
  eventDescription?: string,
  imageUrl?: string
) {
  const template = emailTemplates.newEvent(userEmail, eventTitle, eventDate, eventLocation, eventDescription, imageUrl)
  return sendEmail(template)
}

export async function sendEventNotificationToAll(
  eventTitle: string,
  eventDate: string,
  userEmails: string[],
  eventLocation?: string,
  eventDescription?: string,
  imageUrl?: string
) {
  try {
    const promises = userEmails.map((email) =>
      sendNewEventEmail(email, eventTitle, eventDate, eventLocation, eventDescription, imageUrl).catch((err) => {
        console.error(`Failed to send email to ${email}:`, err)
        return null
      })
    )

    const results = await Promise.all(promises)
    const successful = results.filter((r) => r !== null)
    console.log(`Event notification sent to ${successful.length}/${userEmails.length} users`)
    return successful
  } catch (error) {
    console.error('Error sending event notifications:', error)
    throw error
  }
}
