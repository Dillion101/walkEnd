import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { deleteImageByPublicId } from '@/lib/cloudinary-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing gallery image id' },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { data: item, error: fetchError } = await supabase
      .from('gallery_images')
      .select('id, image_url, image_public_id')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    let publicId = item.image_public_id
    if (!publicId && item.image_url) {
      const match = item.image_url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/)
      publicId = match ? match[1] : null
    }

    if (publicId) {
      await deleteImageByPublicId(publicId)
    }

    const { error: deleteError } = await supabase
      .from('gallery_images')
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
    console.error('Gallery delete API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
