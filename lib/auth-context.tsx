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

// Utility to add timeout to async functions
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    ),
  ])
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to load cached user data first to reduce loading time
    const cachedUser = localStorage.getItem('walkend_user')
    if (cachedUser) {
      try {
        const cacheData = JSON.parse(cachedUser)
        const cacheAge = Date.now() - (cacheData.timestamp || 0)
        const oneHour = 60 * 60 * 1000
        
        // Use cache if less than 1 hour old
        if (cacheAge < oneHour) {
          setUser(cacheData)
        } else {
          localStorage.removeItem('walkend_user')
        }
      } catch (e) {
        console.error('Failed to parse cached user:', e)
        localStorage.removeItem('walkend_user')
      }
    }

    // Get initial session with timeout
    let timeoutId: NodeJS.Timeout
    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          5000
        )
        setSession(session)
        if (session?.user) {
          await fetchUserRole(session.user.id)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUser(null)
        localStorage.removeItem('walkend_user')
        setLoading(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('users')
          .select('id, email, role, full_name, phone_number')
          .eq('id', userId)
          .single(),
        5000 // 5 second timeout
      )

      if (error) throw error

      const userData = {
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
        phone_number: data.phone_number,
      }
      setUser(userData)
      // Cache user data for faster loading on next refresh (1 hour TTL)
      const cacheData = {
        ...userData,
        timestamp: Date.now(),
      }
      localStorage.setItem('walkend_user', JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUser(null)
      localStorage.removeItem('walkend_user')
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string) {
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Step 2: Ensure we have the user ID
      if (!authData.user?.id) {
        throw new Error('Failed to create user account')
      }

      // Step 3: Call API to create user profile (server-side with service role)
      const res = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          email: authData.user.email || email,
          fullName: authData.user.user_metadata?.full_name || null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error('Failed to create user profile:', errorData)
        throw new Error(errorData.error || 'Failed to create user profile')
      }

      console.log('User signup successful with profile created')
    } catch (error) {
      throw error
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        5000
      )

      if (error) throw error

      // fetchUserRole will be called automatically by onAuthStateChange listener
      // No need for double query here
    } catch (error) {
      throw error
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
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
