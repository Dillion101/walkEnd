'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'

interface GalleryImage {
  id: string
  image_url: string
  caption: string
  event_id: string | null
  image_date: string
}

interface Event {
  id: string
  title: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [imagesRes, eventsRes] = await Promise.all([
        supabase.from('gallery_images').select('*').order('image_date', { ascending: false }),
        supabase.from('events').select('id, title'),
      ])

      if (imagesRes.error) throw imagesRes.error
      if (eventsRes.error) throw eventsRes.error

      setImages(imagesRes.data || [])
      setEvents(eventsRes.data || [])
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredImages = selectedEvent === 'all' 
    ? images 
    : images.filter(img => img.event_id === selectedEvent)

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black pt-20 py-12">
          <div className="flex items-center justify-center">
            <div className="text-white text-lg">Loading gallery...</div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <img src="/icon.svg" alt="Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Gallery</h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Memories from our runs and events. Relive the moments!
              </p>
            </div>

            {/* Filters */}
            {events.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedEvent === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedEvent('all')}
                  className={selectedEvent === 'all' ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-900'}
                >
                  All ({images.length})
                </Button>
                {events.map(event => (
                  <Button
                    key={event.id}
                    variant={selectedEvent === event.id ? 'default' : 'outline'}
                    onClick={() => setSelectedEvent(event.id)}
                    className={selectedEvent === event.id ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-gray-600 text-gray-300 hover:bg-gray-900'}
                  >
                    {event.title} ({images.filter(i => i.event_id === event.id).length})
                  </Button>
                ))}
              </div>
            )}

            {/* Gallery Grid */}
            {filteredImages.length === 0 ? (
              <Card className="p-12 text-center bg-gray-900 border-gray-800">
                <p className="text-gray-400 text-lg">No images yet. Check back soon!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImages.map(image => (
                  <Card key={image.id} className="overflow-hidden hover:shadow-xl hover:shadow-orange-500/20 transition-all bg-gray-900 border-gray-800">
                    <div className="relative h-64 bg-gray-800">
                      <img
                        src={image.image_url}
                        alt={image.caption || 'Gallery image'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                    {image.caption && (
                      <div className="p-4">
                        <p className="text-sm text-gray-300">{image.caption}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(image.image_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
