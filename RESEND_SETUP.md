# Resend Email Setup Guide

## Problem
Emails show as "sent" (200 status) in console but recipients don't receive them. This is because Resend is in **sandbox mode** by default.

## Solution: Verify Your Domain

### Option 1: Use Your Own Domain (Recommended for Production)
1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `walkendweekend.com`)
4. Follow DNS verification steps (add CNAME/MX records)
5. Once verified, update `.env.local`:
   ```
   NEXT_PUBLIC_SENDER_EMAIL=noreply@walkendweekend.com
   ```

### Option 2: Use Resend's Test Domain (For Testing Only)
If you don't have a domain yet:
1. In `.env.local`, change to:
   ```
   NEXT_PUBLIC_SENDER_EMAIL=noreply@resend.dev
   ```
2. This works but has limitations - use only for testing

### Option 3: Test with Your Own Email (Sandbox Mode)
While testing without domain verification:
1. Keep using `onboarding@resend.dev`
2. Add YOUR email as a test recipient first to verify it works:
   - Go to [Resend Dashboard](https://resend.com)
   - Check API logs to see if emails are being sent
   - Check "Audiences" to add test emails
3. Only registered test emails receive emails in sandbox mode

## Current Configuration
- **API Key**: Already set in `.env.local` ✓
- **From Email**: Controlled by `NEXT_PUBLIC_SENDER_EMAIL` env var
- **Email Config File**: `/lib/email-config.ts` - Update `FROM_EMAIL` there

## Steps to Fix Email Delivery

1. **For Production:**
   ```bash
   # Step 1: Add your domain to Resend
   # Step 2: Verify DNS records (Resend shows exact records to add)
   # Step 3: Update .env.local
   NEXT_PUBLIC_SENDER_EMAIL=noreply@yourdomain.com
   
   # Step 4: Redeploy and test
   npm run dev
   ```

2. **For Development/Testing:**
   ```bash
   # Add your email to Resend dashboard as a test recipient
   # Create a test event
   # Check email - it should now arrive
   ```

## Check Email Sending Status

Look at server console logs:
```
✓ Email sent to user@example.com: { id: 'xxx', from: 'noreply@...', ... }
✗ Failed to send email to user@example.com: Error message
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No emails received | Verify your email is in Resend sandbox test list OR verify domain |
| "From" domain shows generic | Update `NEXT_PUBLIC_SENDER_EMAIL` env var and redeploy |
| 200 status but no emails | Domain not verified - add to test list or verify domain |

## Contact Resend Support
If issues persist: https://resend.com/support
