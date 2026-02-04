import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase'
import { deleteImageByPublicId } from '@/lib/cloudinary-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing blog post id' },
        { status: 400 }
      )
    }

    const supabase = supabaseServer()

    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('id, featured_image')
      .eq('id', id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.featured_image) {
      const match = post.featured_image.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/)
      const publicId = match ? match[1] : null
      if (publicId) {
        await deleteImageByPublicId(publicId)
      }
    }

    const { error: deleteError } = await supabase
      .from('blog_posts')
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
    console.error('Blog delete API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 }
    )
  }
}
