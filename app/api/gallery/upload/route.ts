import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { uploadToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string
    const event_id = formData.get('event_id') as string | null
    const image_date = formData.get('image_date') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url, publicId } = await uploadToCloudinary(
      new File([buffer], file.name, { type: file.type })
    )

    // Save to database
    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        image_url: url,
        event_id: event_id || null,
        caption: caption || '',
        image_date: image_date || new Date().toISOString().split('T')[0],
      })
      .select()

    if (error) throw error

    return NextResponse.json({
      message: 'Image uploaded successfully',
      data: data[0],
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { imageId, imageUrl } = await request.json()

    if (!imageId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageId or imageUrl' },
        { status: 400 }
      )
    }

    // Delete from Cloudinary
    try {
      await deleteImageFromCloudinary(imageUrl)
    } catch (err) {
      console.error('Error deleting from Cloudinary:', err)
      // Continue anyway
    }

    // Delete from database
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId)

    if (error) throw error

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 }
    )
  }
}
