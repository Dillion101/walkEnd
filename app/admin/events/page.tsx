'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { uploadToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary'
import { MapPicker } from './map-picker'
import 'leaflet/dist/leaflet.css'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location_name: string
  latitude: number | null
  longitude: number | null
  image_url: string
  created_at: string
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [useMapPicker, setUseMapPicker] = useState(true)
  const [showMapPicker, setShowMapPicker] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location_name: '',
    latitude: null as number | null,
    longitude: null as number | null,
    image_url: '',
  })
  const [locationPickedFromMap, setLocationPickedFromMap] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.id) {
      alert('You must be logged in')
      return
    }

    setUploading(true)

    try {
      let imageUrl = formData.image_url

      // Upload image if selected
      if (imageFile) {
        // If updating and there's an old image, delete it
        if (editingId && formData.image_url) {
          await deleteImageFromCloudinary(formData.image_url)
        }
        const { url } = await uploadToCloudinary(imageFile)
        imageUrl = url
      }

      if (editingId) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            location_name: formData.location_name,
            latitude: formData.latitude,
            longitude: formData.longitude,
            image_url: imageUrl,
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new event
        const eventData: any = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          location_name: formData.location_name,
          image_url: imageUrl,
          created_by: user.id,
          // Use default Ghana coordinates if not picked from map (5.6037, -0.1870 = Accra, Ghana)
          latitude: formData.latitude ?? 5.6037,
          longitude: formData.longitude ?? -0.1870,
        }

        const { error } = await supabase.from('events').insert(eventData)

        if (error) throw error

        // Send event notification emails via API
        try {
          const response = await fetch('/api/emails/send-event-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventTitle: formData.title,
              eventDate: formData.date,
              eventLocation: formData.location_name,
              eventDescription: formData.description,
              imageUrl: imageUrl,
            }),
          })

          if (!response.ok) {
            console.error('Failed to send event notifications')
          }
        } catch (emailError) {
          console.error('Error sending event notifications:', emailError)
          // Don't fail the event creation if email fails
        }
      }

      // Reset form and refresh
      resetForm()
      setIsOpen(false)
      await fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setUploading(false)
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      // Find event to get image URL
      const event = events.find(e => e.id === id)
      if (event && event.image_url) {
        await deleteImageFromCloudinary(event.image_url)
      }

      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete event')
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      date: '',
      location_name: '',
      latitude: null,
      longitude: null,
      image_url: '',
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
    setLocationPickedFromMap(false)
  }

  function editEvent(event: Event) {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location_name: event.location_name,
      latitude: event.latitude,
      longitude: event.longitude,
      image_url: event.image_url,
    })
    setImagePreview(event.image_url)
    setEditingId(event.id)
    setIsOpen(true)
  }

  if (loading) {
    return <div>Loading events...</div>
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
            <h2 className="text-2xl sm:text-3xl font-bold">Events Management</h2>
            <p className="text-muted-foreground text-sm">Create and manage running events</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update event details' : 'Add a new running event'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Weekend 5K Run"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Event details..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location Name *</label>
                  <Input
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="Central Park"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Location Selection Method</label>
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={useMapPicker ? 'default' : 'outline'}
                    onClick={() => setUseMapPicker(true)}
                    className={useMapPicker ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    Search on Map
                  </Button>
                  <Button
                    type="button"
                    variant={!useMapPicker ? 'default' : 'outline'}
                    onClick={() => setUseMapPicker(false)}
                    className={!useMapPicker ? 'bg-orange-500 hover:bg-orange-600' : ''}
                  >
                    Manual Entry
                  </Button>
                </div>
              </div>

              {useMapPicker ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMapPicker(!showMapPicker)}
                    className="w-full mb-2"
                  >
                    {showMapPicker ? 'Hide Map' : 'Open Map Picker'}
                  </Button>
                  {showMapPicker && (
                    <MapPicker
                      initialLat={formData.latitude || 5.6037}
                      initialLng={formData.longitude || -0.1870}
                      initialLocationName={formData.location_name}
                      onLocationSelect={(lat, lng, name) => {
                        setFormData({ ...formData, latitude: lat, longitude: lng, location_name: name })
                        setLocationPickedFromMap(true)
                        setShowMapPicker(false)
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="40.785091 (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="-73.968285 (optional)"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Event Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={uploading}>
                  {uploading ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No events yet. Create your first event!</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-24 h-24 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(event.date).toLocaleString()}
                    </p>
                    <p className="text-sm mb-2">{event.description}</p>
                    <p className="text-xs text-muted-foreground">
                      📍 {event.location_name} 
                      {event.latitude && event.longitude ? ` (${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)})` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editEvent(event)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
