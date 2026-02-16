import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (safe to use anywhere)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'walkend_session',
  },
})

// Server-side client with service role key
// ⚠️ ONLY use this in API routes or Server Components
// NEVER import this in Client Components
export const supabaseServer = () => {
  // Add safety check to prevent accidental client-side usage
  if (typeof window !== 'undefined') {
    throw new Error(
      'supabaseServer() should only be called on the server side. ' +
      'Use the regular supabase client in client components.'
    )
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
      'Make sure it exists in your .env.local file without the NEXT_PUBLIC_ prefix.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}