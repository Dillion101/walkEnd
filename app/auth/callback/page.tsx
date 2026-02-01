'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

        // Redirect to admin
        console.log('Redirecting to /admin')
        router.push('/admin')
      } catch (err) {
        console.error('Callback error:', err)
        const errorMsg = err instanceof Error ? err.message : String(err)
        router.push(`/auth/login?error=callback_failed&details=${encodeURIComponent(errorMsg)}`)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Completing sign in...</h1>
        <p className="text-muted-foreground">Please wait while we redirect you.</p>
      </div>
    </div>
  )
}
