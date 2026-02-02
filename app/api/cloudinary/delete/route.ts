import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicId } = body

    if (!publicId) {
      return NextResponse.json(
        { message: 'Missing publicId parameter' },
        { status: 400 }
      )
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary environment variables')
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Prepare deletion request with signature
    const timestamp = Math.floor(Date.now() / 1000)
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
    
    // Create signature using SHA-1 hash
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`
    
    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('signature', signature)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Cloudinary delete error:', data)
      return NextResponse.json(
        { message: 'Failed to delete image from Cloudinary' },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { message: 'Image deleted successfully', data },
      { status: 200 }
    )
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
