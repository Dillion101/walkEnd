import { supabaseServer } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userId, email, fullName } = await req.json()

    if (!userId || !email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role to insert user (bypasses RLS)
    const { error } = await supabaseServer()
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: fullName || null,
        role: 'user',
      })
      .select()
      .single()

    if (error) {
      console.error('Server: Failed to create user profile:', error)
      return Response.json(
        { error: error.message || 'Failed to create profile' },
        { status: 500 }
      )
    }

    console.log('Server: User profile created successfully for:', userId)
    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Server: Unexpected error in user creation:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
