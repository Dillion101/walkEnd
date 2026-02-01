'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function OnboardingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // If user already has phone number, redirect to home
    if (!loading && user && user.phone_number) {
      router.push('/')
      return
    }

    // If not authenticated, redirect to login
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Validate phone number (basic validation)
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
      if (!phoneRegex.test(phoneNumber)) {
        setError('Please enter a valid phone number')
        return
      }

      // Update user profile with phone number
      const { error: updateError } = await supabase
        .from('users')
        .update({ phone_number: phoneNumber })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Update local user state
      const updatedUser = { ...user, phone_number: phoneNumber }
      localStorage.setItem('walkend_user', JSON.stringify({
        ...updatedUser,
        timestamp: Date.now(),
      }))

      // Redirect to home
      router.push('/')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to save phone number')
    } finally {
      setSaving(false)
    }
  }

  function handleSkip() {
    // Allow skipping but remind later
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/icon.svg"
              alt="WalkEnd WeekEnd"
              width={48}
              height={48}
            />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to WalkEnd WeekEnd!</CardTitle>
            <CardDescription className="mt-2 text-base">
              Complete your profile to get started
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-900">
              📱 We need your phone number so admins can contact you about runs and send you WhatsApp updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                We'll use this for event notifications and admin contact only
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={saving || !phoneNumber.trim()}
              >
                {saving ? 'Saving...' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip for now
              </Button>
            </div>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            You can update this anytime in your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
