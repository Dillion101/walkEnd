import { CldUploadWidget } from 'next-cloudinary'

export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  upload_preset: 'walkend_weekend', // Create this in Cloudinary Dashboard
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