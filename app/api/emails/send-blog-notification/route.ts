import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { EMAIL_CONFIG } from '@/lib/email-config'

const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface SendBlogNotificationRequest {
  postTitle: string
  postExcerpt: string
  postUrl?: string
  featuredImageUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SendBlogNotificationRequest = await request.json()

    if (!body.postTitle || !body.postExcerpt) {
      return NextResponse.json(
        { error: 'Missing required fields: postTitle, postExcerpt' },
        { status: 400 }
      )
    }

    // Fetch all user emails from the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email')
      .not('email', 'is', null)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch user emails' },
        { status: 500 }
      )
    }

    const userEmails = users?.map((u: any) => u.email).filter((email: string) => email) || []

    if (userEmails.length === 0) {
      return NextResponse.json(
        { message: 'No users found to notify', sent: 0 },
        { status: 200 }
      )
    }

    // Send emails to all users
    const promises = userEmails.map((email: string) =>
      resend.emails.send({
        from: EMAIL_CONFIG.FROM_ADDRESS,
        to: email,
        subject: `New Blog Post: ${body.postTitle} 📝`,
        html: generateBlogEmailHTML(body),
      }).then(result => {
        console.log(`✓ Blog email sent to ${email}:`, result)
        return result
      }).catch(err => {
        console.error(`✗ Failed to send blog email to ${email}:`, err)
        throw err
      })
    )

    const results = await Promise.allSettled(promises)
    const successful = results.filter((r) => r.status === 'fulfilled').length

    console.log(`Blog notification sent to ${successful}/${userEmails.length} users`)

    return NextResponse.json(
      { message: 'Blog notifications sent', sent: successful, total: userEmails.length },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending blog notifications:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send notifications' },
      { status: 500 }
    )
  }
}

function generateBlogEmailHTML(data: SendBlogNotificationRequest): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .blog-image { width: 100%; max-width: 600px; height: auto; border-radius: 8px; margin: 20px 0; display: block; }
          .blog-preview { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #FF8C00; }
          .blog-preview h3 { margin: 0 0 10px 0; color: #333; }
          .button { background: #FF8C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Blog Post! 📝</h1>
          </div>
          <div class="content">
            <p>Hey there,</p>
            <p>Check out our latest blog post:</p>
            ${data.featuredImageUrl ? `<img src="${data.featuredImageUrl}" alt="${data.postTitle}" class="blog-image" />` : ''}
            <div class="blog-preview">
              <h3>${data.postTitle}</h3>
              <p>${data.postExcerpt}</p>
            </div>
            <p>
              <a href="${data.postUrl || (process.env.NEXT_PUBLIC_APP_URL || 'https://walkendweekend.com') + '/blog'}" class="button">
                Read Full Post
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
