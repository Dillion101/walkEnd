import { CldUploadWidget } from 'next-cloudinary'

export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  upload_preset: 'walkend_weekend', // Create this in Cloudinary Dashboard
}

export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Extract public_id from Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v{version}/{public_id}.{extension}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^.]+$/)
    return match ? match[1] : null
  } catch (error) {
    console.error('Error extracting public ID:', error)
    return null
  }
}

export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'walkend_weekend')

    console.log('Uploading to Cloudinary with cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) {
      const errorData = await res.json()
      console.error('Cloudinary upload failed:', res.status, errorData)
      throw new Error(`Upload failed: ${errorData.error?.message || res.statusText}`)
    }

    const data = await res.json()
    console.log('Cloudinary upload successful:', data)
    
    if (!data.secure_url || !data.public_id) {
      console.error('Missing required fields in Cloudinary response:', data)
      throw new Error('Missing URL or public ID in Cloudinary response')
    }

    return { url: data.secure_url, publicId: data.public_id }
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error)
    throw error
  }
}

/** Client-side: delete by URL (extracts public_id) or by public_id directly */
export async function deleteImageFromCloudinary(imageUrlOrPublicId: string): Promise<void> {
  try {
    let publicId = imageUrlOrPublicId
    if (imageUrlOrPublicId.startsWith('http')) {
      publicId = extractPublicIdFromUrl(imageUrlOrPublicId) || ''
    }
    if (!publicId) {
      console.warn('Could not get public ID:', imageUrlOrPublicId)
      return
    }

    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to delete image from Cloudinary:', error)
      throw new Error(error.message || 'Failed to delete image')
    }

    console.log('Successfully deleted image from Cloudinary:', publicId)
  } catch (error) {
    console.error('Error in deleteImageFromCloudinary:', error)
  }
}


/**
 * Transforms a Cloudinary URL with optimizations to prevent memory crashes
 * Reduces image size significantly without quality loss
 */
export function optimizeCloudinaryUrl(
  url: string,
  options?: {
    width?: number
    height?: number
    quality?: 'auto' | number
    format?: 'auto' | 'webp' | 'jpg'
  }
): string {
  if (!url || !url.includes('cloudinary.com')) return url

  const {
    width = 1200,
    height = undefined,
    quality = 'auto',
    format = 'auto',
  } = options || {}

  // Insert transformation BEFORE the filename
  // From: https://res.cloudinary.com/cloud_name/image/upload/v1234/image.jpg
  // To:   https://res.cloudinary.com/cloud_name/image/upload/w_1200,q_auto,f_auto/v1234/image.jpg

  const transformations = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `q_${quality}`,
    `f_${format}`,
    'c_fill', // Consistent sizing
  ]
    .filter(Boolean)
    .join(',')

  return url.replace(/\/image\/upload\//, `/image/upload/${transformations}/`)
}
