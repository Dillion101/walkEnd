'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name: string | null
  phone_number?: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function handleSession(currentSession: Session | null) {
      setSession(currentSession)

      if (currentSession?.user) {
        // 1. OPTIMISTIC UI: Check cache for instant load
        const cached = localStorage.getItem(`walkend_user_${currentSession.user.id}`)
        if (cached) {
          try {
            setUser(JSON.parse(cached))
          } catch (e) {
            console.error('Cache parse error', e)
          }
        }

        // 2. SOURCE OF TRUTH: Fetch fresh data from DB
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, email, role, full_name, phone_number')
            .eq('id', currentSession.user.id)
            .single()

          if (error) {
            console.error('Error fetching user profile:', error)
            // Optional: if fetch fails but we have cache, we might want to keep cache
            // or we might want to clear it. Usually, if DB fails, keep cache or show error.
          } else if (data && mounted) {
            const userData: User = {
              id: data.id,
              email: data.email,
              role: data.role,
              full_name: data.full_name,
              phone_number: data.phone_number,
            }
            setUser(userData)
            // Update cache
            localStorage.setItem(`walkend_user_${currentSession.user.id}`, JSON.stringify(userData))
          }
        } catch (err) {
          console.error('Unexpected error fetching user:', err)
        }
      } else {
        // No session = No user. Clear everything.
        setUser(null)
      }

      if (mounted) setLoading(false)
    }

    // Initialize: Get current session and listen for changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) handleSession(session)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email: string, password: string) {
    // REFACTORED: Removed manual API call. 
    // The Postgres Trigger handles profile creation automatically now.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // If you collect name during signup, pass it here so the Trigger can pick it up:
      // options: { data: { full_name: 'John Doe' } } 
    })

    if (error) throw error
    
    // If auto-confirm is off, data.user is null until they click the email link.
    // If auto-confirm is on, data.user is populated.
    if (!data.user && !data.session) {
      // Handle the case where email confirmation is required
      console.log('Signup successful, awaiting email confirmation')
    }
  }

  async function signIn(email: string, password: string) {
    // REFACTORED: Removed custom timeout. Let Supabase handle network retries.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    // Optional: Clear specific user cache on logout
    // localStorage.removeItem('walkend_user_...') 
  }

  const value: AuthContextType = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}