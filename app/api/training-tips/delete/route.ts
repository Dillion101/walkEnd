import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { deleteImageByPublicId } from '@/lib/cloudinary-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing training tip id' },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { data: tip, error: fetchError } = await supabase
      .from('training_tips')
      .select('id, image_url')
      .eq('id', id)
      .single()

    if (fetchError || !tip) {
      return NextResponse.json(
        { error: 'Training tip not found' },
        { status: 404 }
      )
    }

    if (tip.image_url) {
      const match = tip.image_url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/)
      const publicId = match ? match[1] : null
      if (publicId) {
        await deleteImageByPublicId(publicId)
      }
    }

    const { error: deleteError } = await supabase
      .from('training_tips')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Training tips delete API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
