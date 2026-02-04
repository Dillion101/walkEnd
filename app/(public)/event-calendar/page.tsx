'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Calendar, MapPin, ChevronLeft, ChevronRight, Copy, CheckCircle, Check } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  image_url: string;
}

interface CalendarDay {
  date: number;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string;
  hasRegisteredEvent: boolean;
}

export default function EventCalendarPage() {
  const { user, session } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());

  // Check if user is registered for an event
  const isRegistered = (eventId: string) => registeredEventIds.has(eventId);

  // Copy: coordinates first if admin added them (and not 0,0), else location name
  const hasValidCoords = (lat: number, lng: number) =>
    lat != null && lng != null && !(lat === 0 && lng === 0);

  const copyEventLocation = (event: Event) => {
    const locationText = hasValidCoords(event.latitude, event.longitude)
      ? `${event.latitude}, ${event.longitude}`
      : event.location_name;
    navigator.clipboard.writeText(locationText).then(() => {
      setCopiedEventId(event.id);
      setTimeout(() => setCopiedEventId(null), 2000);
    });
  };

  // Uber: only works with valid coordinates (not 0,0)
  const openUber = (event: Event) => {
    if (!hasValidCoords(event.latitude, event.longitude)) return;
    const nickname = encodeURIComponent(event.title);
    const formattedAddress = encodeURIComponent(event.location_name);
    const webFallback = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${event.latitude}&dropoff[longitude]=${event.longitude}&dropoff[nickname]=${nickname}&dropoff[formatted_address]=${formattedAddress}`;
    window.open(webFallback, '_blank');
  };

  // Yango: gto param is longitude,latitude. Fallback to location name when no valid coords
  const openYango = (event: Event) => {
    if (hasValidCoords(event.latitude, event.longitude)) {
      window.open(`https://yango.com/en_int/order/?gto=${event.longitude},${event.latitude}&ref=walkend`, '_blank');
    } else {
      const encoded = encodeURIComponent(event.location_name);
      window.open(`https://yango.com/en_int/order/?gto=${encoded}&ref=walkend`, '_blank');
    }
  };

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch user registrations (use session.user.id for reliable auth.uid() match)
  useEffect(() => {
    const fetchUserRegistrations = async () => {
      const userId = session?.user?.id ?? user?.id;
      if (!userId) {
        setRegisteredEventIds(new Set());
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', userId)
          .eq('status', 'registered');

        if (error) {
          console.error('Error fetching registrations:', error);
          return;
        }

        const eventIds = new Set(data?.map(r => r.event_id) || []);
        setRegisteredEventIds(eventIds);
      } catch (error) {
        console.error('Error fetching user registrations:', error);
      }
    };

    fetchUserRegistrations();
  }, [session?.user?.id, user?.id]);

  // Generate calendar days
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        events: [],
        isCurrentMonth: false,
        isToday: false,
        dateString: '',
        hasRegisteredEvent: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const isToday = dayDate.getTime() === today.getTime();
      const hasRegisteredEvent = dayEvents.some(e => registeredEventIds.has(e.id));

      days.push({
        date: i,
        events: dayEvents,
        isCurrentMonth: true,
        isToday,
        dateString: dateStr,
        hasRegisteredEvent
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        events: [],
        isCurrentMonth: false,
        isToday: false,
        dateString: '',
        hasRegisteredEvent: false
      });
    }

    setCalendarDays(days);
  }, [currentMonth, events, registeredEventIds]);

  // Filter events for selected month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`;

    const filtered = events.filter(event => event.date.startsWith(monthStr));
    setFilteredEvents(filtered);
  }, [currentMonth, events]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-black pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading events...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date.startsWith(dateStr));
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-bold font-display text-white mb-4 animate-slide-up">Event Calendar</h1>
            <p className="text-gray-400 text-lg max-w-2xl animate-slide-up animation-delay-100">
              Discover and register for upcoming running events. All skill levels welcome.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8 bg-card border-border hover:border-accent/50 transition-all">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold font-display text-white">{monthName}</h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-accent/20 rounded-lg transition-all text-gray-400 hover:text-accent"
                      aria-label="Previous month"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-accent/20 rounded-lg transition-all text-gray-400 hover:text-accent"
                      aria-label="Next month"
                      title="Next month"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div>
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map(day => (
                      <div key={day} className="text-center font-semibold text-xs text-gray-400 py-3">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (day.isCurrentMonth && day.dateString) {
                            setSelectedDate(day.dateString);
                          }
                        }}
                        className={`
                          aspect-square flex flex-col items-center justify-center rounded-lg font-semibold text-sm
                          transition-all duration-200 relative group
                          ${!day.isCurrentMonth ? 'bg-card/50 text-gray-600 cursor-default' : ''}
                          ${day.isCurrentMonth && !day.isToday && !day.events.length ? 'bg-card border border-border hover:border-accent hover:bg-card/80 text-white cursor-pointer' : ''}
                          ${day.isToday ? 'bg-gradient-to-br from-accent to-accent/80 text-background font-bold shadow-lg shadow-accent/50 ring-2 ring-accent/30' : ''}
                          ${day.isCurrentMonth && day.events.length > 0 && !day.isToday && day.hasRegisteredEvent ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-400 text-white hover:from-green-500/30 hover:to-green-600/30 cursor-pointer' : ''}
                          ${day.isCurrentMonth && day.events.length > 0 && !day.isToday && !day.hasRegisteredEvent ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400 text-white hover:from-blue-500/30 hover:to-blue-600/30 cursor-pointer' : ''}
                        `}
                      >
                        <span>{day.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-8 pt-6 border-t border-border space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Legend</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-accent to-accent/80 rounded text-white flex items-center justify-center text-xs">✓</div>
                      <span className="text-gray-300">Today</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-400 rounded flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">Registered</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400 rounded"></div>
                      <span className="text-gray-300">Events scheduled</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sm:p-8 bg-card border-border sticky top-24">
                <h3 className="text-xl font-bold font-display text-white mb-2">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : `Events in ${monthName}`}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {selectedDate && getEventsForDate(selectedDate).length === 0 ? 'No events scheduled for this day' : 'Register for upcoming runs'}
                </p>

                {filteredEvents.length === 0 && !selectedDate ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No events scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border border-border bg-background/50 rounded-lg hover:border-accent hover:bg-background/80 transition-all duration-200 group"
                      >
                        <h4 className="font-bold text-white text-sm mb-3 group-hover:text-accent transition-colors">
                          {event.title}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="line-clamp-2">{event.location_name}</span>
                          </div>

                          {event.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mt-2">{event.description}</p>
                          )}
                        </div>

                        {isRegistered(event.id) ? (
                          <div className="w-full bg-green-500/20 border border-green-500 text-green-400 text-xs font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Registered
                          </div>
                        ) : (
                          <Link href={`/join-run?event=${event.id}`} className="block">
                            <Button className="w-full bg-accent hover:bg-accent/90 text-background text-xs font-semibold group-hover:shadow-lg group-hover:shadow-accent/50 transition-all">
                              Register Now
                            </Button>
                          </Link>
                        )}

                        {/* Copy Location Button */}
                        <Button
                          variant="outline"
                          className="w-full mt-2 text-xs border-gray-600 hover:border-accent hover:bg-accent/10"
                          onClick={() => copyEventLocation(event)}
                        >
                          {copiedEventId === event.id ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                              <span className="text-green-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy Location
                            </>
                          )}
                        </Button>

                        {hasValidCoords(event.latitude, event.longitude) && (
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1"
                              onClick={() => openUber(event)}
                            >
                              <Image src="/uber.jpg" alt="Uber" width={32} height={16} className="h-4 w-auto object-contain" />
                              Uber
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1"
                              onClick={() => openYango(event)}
                            >
                              <Image src="/yango.png" alt="Yango" width={32} height={16} className="h-4 w-auto object-contain" />
                              Yango
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
