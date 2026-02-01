'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          throw error
        }

        if (!data.session) {
          console.error('No session found after auth')
          throw new Error('No session available')
        }

        const user = data.session.user

        if (!user?.id || !user?.email) {
          console.error('Invalid user data:', user)
          throw new Error('Invalid user data from session')
        }

        console.log('Creating user profile for:', user.id, user.email)

        // Check if user profile exists
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (fetchError) {
          console.error('Error fetching user:', fetchError)
          throw fetchError
        }

        const isNewUser = !userData

        if (!userData) {
          // Create user profile with all client details via API
          console.log('Creating user profile for:', user.id)

          const res = await fetch('/api/auth/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || null,
            }),
          })

          if (!res.ok) {
            const errorData = await res.json()
            console.error('Failed to create user profile:', errorData)
            throw new Error(errorData.error || 'Failed to create user profile')
          }

          console.log('User profile created successfully')
        } else {
          console.log('User profile already exists')
        }

        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('phone_number, role')
          .eq('id', user.id)
          .single()

        // For new Google OAuth users without phone number, go to onboarding (only on signup)
        if (isNewUser && userProfile?.role === 'user' && !userProfile?.phone_number && user.app_metadata?.provider === 'google') {
          console.log('Redirecting to onboarding for new Google OAuth user')
          router.push('/onboarding')
          return
        }

        // Redirect based on role
        if (userProfile?.role === 'admin') {
          console.log('Redirecting admin to /admin')
          router.push('/admin')
        } else {
          console.log('Redirecting user to /event-calendar')
          router.push('/event-calendar')
        }
      } catch (err) {
        console.error('Callback error:', err)
        const errorMsg = err instanceof Error ? err.message : String(err)
        router.push(`/auth/login?error=callback_failed&details=${encodeURIComponent(errorMsg)}`)
      }
    }

    handleCallback()
  }, [router])

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-black pt-32 pb-20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Completing sign in...</h1>
          <p className="text-gray-400">Please wait while we redirect you.</p>
        </Card>
      </div>
      <Footer />
    </>
  )
}
