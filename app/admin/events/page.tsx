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
import { Trash2, Edit2, Plus, AlertCircle, Users, Download, X } from 'lucide-react'
import { uploadToCloudinary, deleteImageFromCloudinary } from '@/lib/cloudinary'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminEventRouteButton } from '@/components/admin-event-route-button'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location_name: string
  latitude: number | null
  longitude: number | null
  end_location_name?: string | null
  end_latitude?: number | null
  end_longitude?: number | null
  image_url: string
  created_at: string
}

interface Registration {
  id: string
  user_id: string
  event_id: string
  status: string
  registered_at: string
  users: {
    full_name: string
    email: string
    phone_number?: string
  }
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
  const [error, setError] = useState<string | null>(null)
  
  // Registrations state
  const [registrationsOpen, setRegistrationsOpen] = useState(false)
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loadingRegistrations, setLoadingRegistrations] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location_name: '',
    latitude: null as number | null,
    longitude: null as number | null,
    end_location_name: '' as string | null,
    end_latitude: null as number | null,
    end_longitude: null as number | null,
    image_url: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  // Fetch registrations for an event
  async function fetchRegistrations(eventId: string) {
    setLoadingRegistrations(true)
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, users(full_name, email, phone_number)')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setRegistrations([])
    } finally {
      setLoadingRegistrations(false)
    }
  }

  // Open registrations dialog
  function viewRegistrations(event: Event) {
    setSelectedEventForRegistrations(event)
    setRegistrationsOpen(true)
    fetchRegistrations(event.id)
  }

  // Export registrations to CSV
  function exportRegistrationsCSV() {
    if (!selectedEventForRegistrations || registrations.length === 0) return

    const headers = ['Name', 'Email', 'Phone', 'Status', 'Registered At']
    const rows = registrations.map(r => [
      r.users?.full_name || 'N/A',
      r.users?.email || 'N/A',
      r.users?.phone_number || 'N/A',
      r.status,
      new Date(r.registered_at).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedEventForRegistrations.title.replace(/\s+/g, '_')}_registrations.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
      setError('You must be logged in')
      return
    }

    setUploading(true)
    setError(null)

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
            end_location_name: formData.end_location_name || null,
            end_latitude: formData.end_latitude,
            end_longitude: formData.end_longitude,
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
          // Use default Ghana coordinates if not provided
          latitude: formData.latitude ?? 5.6037,
          longitude: formData.longitude ?? -0.1870,
        }

        const { error } = await supabase.from('events').insert(eventData)

        if (error) throw error

        // Send event notification emails via API - MUST succeed
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
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to send event notifications')
          }
        } catch (emailError) {
          // Delete the event if email fails
          await supabase.from('events').delete().eq('title', formData.title)
          throw new Error(`Event created but failed to notify users: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`)
        }
      }

      // Reset form and refresh
      resetForm()
      setIsOpen(false)
      await fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      setError(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setUploading(false)
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const res = await fetch('/api/events/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete event')
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
      end_location_name: '' as string | null,
      end_latitude: null,
      end_longitude: null,
      image_url: '',
    })
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
  }

  function editEvent(event: Event) {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location_name: event.location_name,
      latitude: event.latitude,
      longitude: event.longitude,
      end_location_name: event.end_location_name || '',
      end_latitude: event.end_latitude || null,
      end_longitude: event.end_longitude || null,
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
          <DialogContent className="w-[95vw] max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update event details' : 'Add a new running event'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

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
                <label className="block text-sm font-medium mb-1">Event Location Coordinates</label>
                <p className="text-xs text-gray-600 mb-3">
                  Use <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Google Maps</a> to find coordinates. Click the location, then copy the latitude and longitude from the popup.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.latitude || ''}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., 5.6037 (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.longitude || ''}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., -0.1870 (optional)"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Location Name</label>
                <Input
                  value={formData.end_location_name || ''}
                  onChange={(e) => setFormData({ ...formData, end_location_name: e.target.value })}
                  placeholder="Where the run ends (e.g., Jubilee Park)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Location Coordinates</label>
                <p className="text-xs text-gray-600 mb-3">
                  Set this to enable route viewing for users. Use <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Google Maps</a> to find coordinates.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">End Latitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.end_latitude || ''}
                      onChange={(e) => setFormData({ ...formData, end_latitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., 5.6037 (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">End Longitude</label>
                    <Input
                      type="number"
                      step="0.00001"
                      value={formData.end_longitude || ''}
                      onChange={(e) => setFormData({ ...formData, end_longitude: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="e.g., -0.1870 (optional)"
                    />
                  </div>
                </div>
              </div>

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
                <div className="flex flex-col sm:flex-row gap-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full sm:w-24 sm:h-24 h-auto rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg break-words">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(event.date).toLocaleString()}
                    </p>
                    <p className="text-sm mb-2 line-clamp-2">{event.description}</p>
                    <p className="text-xs text-muted-foreground break-words">
                      📍 {event.location_name} 
                      {event.latitude && event.longitude ? ` (${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)})` : ''}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewRegistrations(event)}
                      className="flex items-center gap-1 justify-center sm:justify-start"
                    >
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Registrations</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                    <div className="flex gap-2 flex-wrap sm:flex-col">
                      <AdminEventRouteButton event={event} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editEvent(event)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Registrations Dialog */}
      <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}>
        <DialogContent className="w-[95vw] max-w-[calc(100vw-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5" />
              <span className="truncate">Registrations for {selectedEventForRegistrations?.title}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedEventForRegistrations && new Date(selectedEventForRegistrations.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          {loadingRegistrations ? (
            <div className="py-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No registrations yet for this event.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <p className="text-sm font-medium">
                  Total: <span className="text-orange-500">{registrations.length}</span> registered
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportRegistrationsCSV}
                  className="flex items-center gap-1 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left px-2 sm:px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-2 sm:px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                      <th className="text-left px-2 sm:px-4 py-3 font-medium hidden md:table-cell">Phone</th>
                      <th className="text-left px-2 sm:px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-2 sm:px-4 py-3 font-medium hidden lg:table-cell">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-muted/50 text-xs sm:text-sm">
                        <td className="px-2 sm:px-4 py-3 font-medium break-words">{reg.users?.full_name || 'N/A'}</td>
                        <td className="px-2 sm:px-4 py-3 text-muted-foreground hidden sm:table-cell break-words text-xs">{reg.users?.email || 'N/A'}</td>
                        <td className="px-2 sm:px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{reg.users?.phone_number || '-'}</td>
                        <td className="px-2 sm:px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                            reg.status === 'registered' ? 'bg-green-100 text-green-700' :
                            reg.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">
                          {new Date(reg.registered_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
