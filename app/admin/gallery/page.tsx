'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus, SortAsc, SortDesc, Grid3x3, List } from 'lucide-react'
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

type SortField = 'image_date' | 'created_at'
type SortOrder = 'asc' | 'desc'
type GroupBy = 'none' | 'event' | 'date'

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  // Filter and Sort state
  const [sortField, setSortField] = useState<SortField>('image_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [groupBy, setGroupBy] = useState<GroupBy>('none')
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    event_id: '',
    caption: '',
    image_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  // Apply filters, sorting, and grouping
  useEffect(() => {
    let result = [...images]

    // Apply event filter
    if (selectedEventFilter !== 'all') {
      if (selectedEventFilter === 'no-event') {
        result = result.filter(img => !img.event_id)
      } else {
        result = result.filter(img => img.event_id === selectedEventFilter)
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareA: any
      let compareB: any

      switch (sortField) {
        case 'image_date':
          compareA = new Date(a.image_date).getTime()
          compareB = new Date(b.image_date).getTime()
          break
        case 'created_at':
          compareA = new Date(a.created_at).getTime()
          compareB = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredImages(result)
  }, [images, sortField, sortOrder, selectedEventFilter])

  // Toggle sort order for a field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Group images by selected criteria
  const getGroupedImages = () => {
    if (groupBy === 'none') {
      return [{ title: null, images: filteredImages }]
    }

    if (groupBy === 'event') {
      const grouped: { [key: string]: GalleryImage[] } = {}
      
      filteredImages.forEach(img => {
        const key = img.event_id || 'no-event'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(img)
      })

      return Object.entries(grouped).map(([key, imgs]) => {
        const eventTitle = key === 'no-event' 
          ? 'No Event Associated'
          : events.find(e => e.id === key)?.title || 'Unknown Event'
        
        return { title: eventTitle, images: imgs }
      })
    }

    if (groupBy === 'date') {
      const grouped: { [key: string]: GalleryImage[] } = {}
      
      filteredImages.forEach(img => {
        const date = new Date(img.image_date)
        const key = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(img)
      })

      return Object.entries(grouped)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([key, imgs]) => ({ title: key, images: imgs }))
    }

    return [{ title: null, images: filteredImages }]
  }

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

  const groupedImages = getGroupedImages()

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

      {/* Filter, Sort, and Group Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Event Filter */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Filter by Event</label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input rounded bg-background"
            >
              <option value="all">All Events ({images.length})</option>
              <option value="no-event">No Event ({images.filter(i => !i.event_id).length})</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} ({images.filter(i => i.event_id === event.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Sort by</label>
            <div className="flex gap-2">
              <Button
                variant={sortField === 'image_date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('image_date')}
                className={`flex-1 flex items-center justify-center gap-1 ${sortField === 'image_date' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                Photo Date
                {sortField === 'image_date' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
              </Button>
              <Button
                variant={sortField === 'created_at' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSort('created_at')}
                className={`flex-1 flex items-center justify-center gap-1 ${sortField === 'created_at' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                Upload Date
                {sortField === 'created_at' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
              </Button>
            </div>
          </div>

          {/* Group By */}
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Group by</label>
            <div className="flex gap-2">
              <Button
                variant={groupBy === 'none' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('none')}
                className={`flex-1 flex items-center justify-center gap-1 ${groupBy === 'none' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                <Grid3x3 className="w-3 h-3" />
                None
              </Button>
              <Button
                variant={groupBy === 'event' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('event')}
                className={`flex-1 flex items-center justify-center gap-1 ${groupBy === 'event' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                <List className="w-3 h-3" />
                Event
              </Button>
              <Button
                variant={groupBy === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setGroupBy('date')}
                className={`flex-1 flex items-center justify-center gap-1 ${groupBy === 'date' ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                <List className="w-3 h-3" />
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground mt-4">
          Showing {filteredImages.length} of {images.length} images
        </div>
      </Card>

      {/* Gallery Grid - Grouped or Flat */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {images.length === 0
                ? 'No gallery images yet. Upload some photos!'
                : 'No images match your filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedImages.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Group Header */}
              {group.title && (
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">{group.title}</h3>
                  <p className="text-sm text-muted-foreground">{group.images.length} image{group.images.length !== 1 ? 's' : ''}</p>
                </div>
              )}

              {/* Images Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.images.map((image) => (
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-50">
                        <div className="text-white text-xs">
                          <p className="font-semibold">{new Date(image.image_date).toLocaleDateString()}</p>
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
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}