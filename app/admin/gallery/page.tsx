'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus } from 'lucide-react'
import { uploadToCloudinary, optimizeCloudinaryUrl } from '@/lib/cloudinary'

interface GalleryImage {
  id: string
  image_url: string
  event_id: string | null
  caption: string
  image_date: string
  created_at: string
}

interface Event {
  id: string
  title: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [formData, setFormData] = useState({
    event_id: '',
    caption: '',
    image_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [imagesRes, eventsRes] = await Promise.all([
        supabase.from('gallery_images').select('*').order('image_date', { ascending: false }),
        supabase.from('events').select('id, title').order('date', { ascending: false }),
      ])

      if (imagesRes.error) throw imagesRes.error
      if (eventsRes.error) throw eventsRes.error

      setImages(imagesRes.data || [])
      setEvents(eventsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setImageFiles([...imageFiles, ...newFiles])

      // Create previews
      const newPreviews: string[] = []
      newFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPreviews.push(reader.result as string)
          if (newPreviews.length === newFiles.length) {
            setImagePreviews([...imagePreviews, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (imageFiles.length === 0) {
      alert('Please select at least one image')
      return
    }

    setUploading(true)

    try {
      // Upload all images
      for (const file of imageFiles) {
        const { url, publicId } = await uploadToCloudinary(file)

        // Insert into gallery
        const { error } = await supabase.from('gallery_images').insert({
          image_url: url,
          image_public_id: publicId,
          event_id: formData.event_id || null,
          caption: formData.caption,
          image_date: formData.image_date,
        })

        if (error) throw error
      }

      resetForm()
      setIsOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const res = await fetch('/api/gallery/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete image')
      await fetchData()
    } catch (error) {
      console.error('Error deleting image:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete image')
    }
  }

  function resetForm() {
    setFormData({
      event_id: '',
      caption: '',
      image_date: new Date().toISOString().split('T')[0],
    })
    setImageFiles([])
    setImagePreviews([])
  }

  function removePreview(index: number) {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  if (loading) {
    return <div>Loading gallery...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="WalkEnd WeekEnd Logo"
            width={40}
            height={40}
          />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Gallery Management</h2>
            <p className="text-muted-foreground text-sm">Upload and manage event photos</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Gallery Images</DialogTitle>
              <DialogDescription>Add multiple images from an event</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Images *</label>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                <p className="text-xs text-muted-foreground">
                  Selected: {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''}
                </p>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${idx}`}
                        className="w-full h-20 rounded object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded p-0.5 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Event (Optional)</label>
                <select
                  aria-label="Select an event"
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded bg-background"
                >
                  <option value="">Select an event</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Photo Date</label>
                <Input
                  type="date"
                  value={formData.image_date}
                  onChange={(e) => setFormData({ ...formData, image_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Caption (Optional)</label>
                <Textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Photo description..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={uploading || imageFiles.length === 0}>
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No gallery images yet. Upload some photos!</p>
            </CardContent>
          </Card>
        ) : (
          images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0 relative group">
                <img
                  src={optimizeCloudinaryUrl(image.image_url, {
                    width: 400,
                    quality: 'auto',
                    format: 'auto'
                  })}
                  alt={image.caption}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                  <div className="text-white text-xs">
                    <p className="font-semibold">{image.image_date}</p>
                    {image.caption && <p className="line-clamp-1">{image.caption}</p>}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImage(image.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
