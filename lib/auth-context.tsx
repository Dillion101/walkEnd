'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name: string | null
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, full_name')
        .eq('id', userId)
        .single()

      if (error) throw error

      setUser({
        id: data.id,
        email: data.email,
        role: data.role,
        full_name: data.full_name,
      })
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUser(null)
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ensure user profile exists
    const authUser = (await supabase.auth.getUser()).data.user
    if (authUser) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUser.id)
        .single()

      if (!existingUser) {
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email,
          role: 'user',
        })
      }
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
