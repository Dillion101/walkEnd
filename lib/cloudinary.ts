import { CldUploadWidget } from 'next-cloudinary'
import 'next-cloudinary/dist/index.css'

export const cloudinaryConfig = {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  upload_preset: 'walkend_weekend', // Create this in Cloudinary Dashboard
}

export async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'walkend_weekend')

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  const data = await res.json()
  return { url: data.secure_url, publicId: data.public_id }
}