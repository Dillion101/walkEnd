'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, ArrowRight, MapIcon } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: string
  location_name: string
  latitude: number
  longitude: number
  image_url: string
}

export default function NextRuns() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  async function fetchUpcomingEvents() {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse py-20 bg-card/50">Loading...</div>
  }

  if (events.length === 0) {
    return (
      <section className="w-full py-20 bg-gradient-to-b from-background to-card/50 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 animate-slide-up">No Upcoming Runs</h2>
            <p className="text-gray-400 text-lg mb-8">Check back soon for our next scheduled event!</p>
            <Link href="/event-calendar">
              <Button className="bg-accent hover:bg-accent/90 text-background">View Full Calendar</Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-20 bg-gradient-to-b from-background to-card/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <span className="text-accent uppercase text-sm tracking-widest font-semibold block animate-slide-up">Coming Soon</span>
          <h2 className="text-5xl sm:text-6xl font-bold font-display mt-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Upcoming Runs
          </h2>
          <p className="text-gray-400 text-lg mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Join us for our next weekly community run experience.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {events.map((event, idx) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 animate-slide-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative h-48 bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center overflow-hidden group">
                <Calendar className="w-16 h-16 text-accent/30 group-hover:scale-110 transition-transform duration-300" />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold font-display text-white mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} className="text-accent" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin size={16} className="text-accent" />
                    <span className="line-clamp-1">{event.location_name}</span>
                  </div>
                </div>

                <Link href={`/event-calendar?event=${event.id}`}>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-background font-semibold group">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                {(event.latitude && event.longitude) && (
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`https://uber.com/dir?saddr=Current%20Location&daddr=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent">
                        <MapIcon className="w-3 h-3 mr-1" />
                        Uber
                      </Button>
                    </a>
                    <a href="https://yango.app/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent">
                        <MapIcon className="w-3 h-3 mr-1" />
                        Yango
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/event-calendar">
            <Button variant="outline" className="border-accent hover:bg-accent/10 text-accent">
              View All Events <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
