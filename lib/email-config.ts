// Email Configuration for Resend
// NOTE: To send emails with Resend:
// 1. Go to https://resend.com/domains
// 2. Add your domain (e.g., noreply@yourdomain.com or support@yourdomain.com)
// 3. Verify the domain with DNS records
// 4. Update NEXT_PUBLIC_SENDER_EMAIL in .env.local with your verified domain

export const EMAIL_CONFIG = {
  // Uses env var set in .env.local
  // For testing: onboarding@resend.dev (sandboxed)
  // For production: noreply@yourdomain.com (verified domain required)
  FROM_EMAIL: process.env.NEXT_PUBLIC_SENDER_EMAIL || 'onboarding@resend.dev',
  FROM_NAME: 'WalkEnd WeekEnd',
  
  // Full from address
  get FROM_ADDRESS() {
    return `${this.FROM_NAME} <${this.FROM_EMAIL}>`
  }
}

// Verify Resend is configured
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set. Emails will not be sent.')
}

// Warn if using sandbox in production
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENDER_EMAIL?.includes('resend.dev')) {
  console.warn('⚠️  WARNING: Using Resend sandbox domain in production. Emails may not be delivered to real users.')
  console.warn('    Please verify your domain: https://resend.com/domains')
}
