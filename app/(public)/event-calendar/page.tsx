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
import { Calendar, MapPin, ChevronLeft, ChevronRight, Copy, CheckCircle, Check, Navigation2 } from 'lucide-react';
import { EventRouteViewer } from '@/components/event-route-viewer';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  end_location_name?: string;
  end_latitude?: number;
  end_longitude?: number;
  image_url: string;
}

interface CalendarDay {
  date: number;
  events: Event[];
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string;
  hasRegisteredEvent: boolean;
  hasPastEvent: boolean;
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
  const [isMobile, setIsMobile] = useState(false);
  const [routeViewerOpen, setRouteViewerOpen] = useState(false);
  const [selectedEventForRoute, setSelectedEventForRoute] = useState<Event | null>(null);

  // Check if user is registered for an event
  const isRegistered = (eventId: string) => registeredEventIds.has(eventId);

  // Check if an event is in the past
  const isPastEvent = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDay = new Date(eventDate);
    eventDay.setHours(0, 0, 0, 0);
    return eventDay < today;
  };

  // Detect mobile device
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/i.test(ua));
  }, []);

  // Copy: coordinates first if admin added them (and not 0,0), else location name
  const hasValidCoords = (lat: number, lng: number) =>
    lat != null && lng != null && !(lat === 0 && lng === 0);

  // Check if event has valid end location for route viewing
  const hasValidEndLocation = (event: Event) =>
    event.end_location_name &&
    event.end_latitude != null &&
    event.end_longitude != null &&
    !(event.end_latitude === 0 && event.end_longitude === 0);

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

  // Yango: handles both mobile app and web
  const openYango = (event: Event) => {
    if (!hasValidCoords(event.latitude, event.longitude)) return;
    const yangoUniversalLink = `https://yango.go.link/route?end-lat=${event.latitude}&end-lon=${event.longitude}&app_launch_method=detect&ref=walkend`;
    window.open(yangoUniversalLink, '_blank');
  };

  // Fetch ALL events (past and future) - removed date filter
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
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
      console.log('Fetching registrations for user:', userId);
      if (!userId) {
        console.log('No user ID found');
        setRegisteredEventIds(new Set());
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_registrations')
          .select('event_id')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching registrations:', error);
          return;
        }

        const eventIds = new Set(data?.map(r => r.event_id) || []);
        console.log('Registered event IDs:', Array.from(eventIds));
        setRegisteredEventIds(eventIds);
      } catch (error) {
        console.error('Error fetching user registrations:', error);
      }
    };

    if (session?.user?.id || user?.id) {
      fetchUserRegistrations();
    }
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
        hasRegisteredEvent: false,
        hasPastEvent: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const dayEvents = events.filter(e => e.date.startsWith(dateStr));
      const isToday = dayDate.getTime() === today.getTime();
      const hasRegisteredEvent = dayEvents.some(e => {
        const isReg = registeredEventIds.has(e.id);
        if (isReg) {
          console.log(`Event ${e.id} (${e.title}) on ${dateStr} is registered`);
        }
        return isReg;
      });
      const hasPastEvent = dayEvents.some(e => isPastEvent(e.date)) && dayEvents.length > 0;

      days.push({
        date: i,
        events: dayEvents,
        isCurrentMonth: true,
        isToday,
        dateString: dateStr,
        hasRegisteredEvent,
        hasPastEvent
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
        hasRegisteredEvent: false,
        hasPastEvent: false
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
          <div className="mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-display text-white mb-4 animate-slide-up leading-tight">Event Calendar</h1>
            <p className="text-gray-400 text-sm sm:text-lg max-w-2xl animate-slide-up animation-delay-100">
              Discover and register for upcoming running events. All skill levels welcome.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6 lg:p-8 bg-card border-border hover:border-accent/50 transition-all">
                {/* Month Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-white break-words flex-1">{monthName}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-accent/20 rounded-lg transition-all text-gray-400 hover:text-accent"
                      aria-label="Previous month"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-accent/20 rounded-lg transition-all text-gray-400 hover:text-accent"
                      aria-label="Next month"
                      title="Next month"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div>
                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {weekDays.map(day => (
                      <div key={day} className="text-center font-semibold text-xs sm:text-sm text-gray-400 py-2 sm:py-3">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map((day, idx) => {
                      // Determine the day style based on priority
                      let dayStyle = '';
                      
                      if (!day.isCurrentMonth) {
                        dayStyle = 'bg-card/50 text-gray-600 cursor-default';
                      } else if (day.isToday) {
                        dayStyle = 'bg-linear-to-br from-accent to-accent/80 text-background font-bold shadow-lg shadow-accent/50 ring-2 ring-accent/30';
                      } else if (day.hasPastEvent) {
                        // Past events - gray/muted color
                        dayStyle = 'bg-linear-to-br from-gray-500/20 to-gray-600/20 border-2 border-gray-500 text-gray-400 hover:from-gray-500/30 hover:to-gray-600/30 cursor-pointer';
                      } else if (day.hasRegisteredEvent) {
                        // Registered future events - green
                        dayStyle = 'bg-linear-to-br from-green-500/20 to-green-600/20 border-2 border-green-400 text-white hover:from-green-500/30 hover:to-green-600/30 cursor-pointer';
                      } else if (day.events.length > 0) {
                        // Unregistered future events - blue
                        dayStyle = 'bg-linear-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400 text-white hover:from-blue-500/30 hover:to-blue-600/30 cursor-pointer';
                      } else {
                        // Empty day
                        dayStyle = 'bg-card border border-border hover:border-accent hover:bg-card/80 text-white cursor-pointer';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (day.isCurrentMonth && day.dateString) {
                              setSelectedDate(day.dateString);
                            }
                          }}
                          className={`
                            aspect-square flex flex-col items-center justify-center rounded-lg font-semibold text-xs sm:text-sm
                            transition-all duration-200 relative group
                            ${dayStyle}
                          `}
                        >
                          <span>{day.date}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border space-y-2 sm:space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Legend</p>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-accent to-accent/80 rounded text-white flex items-center justify-center text-xs flex-shrink-0">✓</div>
                      <span className="text-gray-300">Today</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-green-500/20 to-green-600/20 border-2 border-green-400 rounded flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300">Registered (upcoming)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-blue-500/20 to-blue-600/20 border-2 border-blue-400 rounded flex-shrink-0"></div>
                      <span className="text-gray-300">Events scheduled</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-linear-to-br from-gray-500/20 to-gray-600/20 border-2 border-gray-500 rounded flex-shrink-0"></div>
                      <span className="text-gray-400">Past events</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:p-8 bg-card border-border lg:sticky lg:top-24 max-h-max">
                <h3 className="text-lg sm:text-xl font-bold font-display text-white mb-2 break-words">
                  {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : `Events in ${monthName}`}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">
                  {selectedDate && getEventsForDate(selectedDate).length === 0 ? 'No events scheduled for this day' : 'Register for upcoming runs'}
                </p>

                {filteredEvents.length === 0 && !selectedDate ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-400 text-sm">No events scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto pr-1 sm:pr-2">
                    {(selectedDate ? getEventsForDate(selectedDate) : filteredEvents).map((event) => {
                      const isEventPast = isPastEvent(event.date);
                      
                      return (
                        <div
                          key={event.id}
                          className={`p-3 sm:p-4 border rounded-lg transition-all duration-200 group ${
                            isEventPast 
                              ? 'border-gray-600 bg-gray-900/30 opacity-75' 
                              : 'border-border bg-background/50 hover:border-accent hover:bg-background/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`font-bold text-xs sm:text-sm mb-2 sm:mb-3 transition-colors line-clamp-2 flex-1 ${
                              isEventPast ? 'text-gray-400' : 'text-white group-hover:text-accent'
                            }`}>
                              {event.title}
                            </h4>
                            {isEventPast && (
                              <span className="text-[10px] sm:text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                                Past
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-accent shrink-0" />
                              <span className="text-xs">{new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                weekday: 'short'
                              })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-accent shrink-0" />
                              <span className="line-clamp-2 text-xs">{event.location_name}</span>
                            </div>

                            {event.description && (
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                            )}
                          </div>

                          {!isEventPast && (
                            <>
                              {isRegistered(event.id) ? (
                                <div className="w-full bg-green-500/20 border border-green-500 text-green-400 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-2">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="text-xs">Registered</span>
                                </div>
                              ) : (
                                <Link href={`/join-run?event=${event.id}`} className="block">
                                  <Button className="w-full bg-accent hover:bg-accent/90 text-background text-xs font-semibold group-hover:shadow-lg group-hover:shadow-accent/50 transition-all py-2">
                                    Register Now
                                  </Button>
                                </Link>
                              )}
                            </>
                          )}

                          {/* Copy Location Button - available for all events */}
                          <Button
                            variant="outline"
                            className={`w-full mt-2 text-xs py-2 ${
                              isEventPast 
                                ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50' 
                                : 'border-gray-600 hover:border-accent hover:bg-accent/10'
                            }`}
                            onClick={() => copyEventLocation(event)}
                          >
                            {copiedEventId === event.id ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                <span className="text-green-400 text-xs">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                <span className="text-xs">Copy Location</span>
                              </>
                            )}
                          </Button>

                          {/* Show route + ride options if end location is set AND user is registered - only for future events */}
                          {!isEventPast && hasValidEndLocation(event) && isRegistered(event.id) && (
                            <div className="mt-2 grid grid-cols-3 gap-1 sm:gap-2">
                              <Button 
                                variant="outline" 
                                className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1 py-2" 
                                onClick={() => {
                                  setSelectedEventForRoute(event);
                                  setRouteViewerOpen(true);
                                }}
                                title="View route on map"
                              >
                                <Navigation2 className="w-3 h-3" />
                                <span className="hidden sm:inline">Route</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1 py-2"
                                onClick={() => openUber(event)}
                              >
                                <Image src="/uber.jpg" alt="Uber" width={32} height={16} className="h-3 sm:h-4 w-auto object-contain" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1 py-2"
                                onClick={() => openYango(event)}
                              >
                                <Image src="/yango.png" alt="Yango" width={32} height={16} className="h-3 sm:h-4 w-auto object-contain" />
                              </Button>
                            </div>
                          )}

                          {/* Show only ride options if end location not set but start location is valid AND user is registered - only for future events */}
                          {!isEventPast && !hasValidEndLocation(event) && hasValidCoords(event.latitude, event.longitude) && isRegistered(event.id) && (
                            <div className="mt-2 grid grid-cols-2 gap-1 sm:gap-2">
                              <Button 
                                variant="outline" 
                                className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1 py-2"
                                onClick={() => openUber(event)}
                              >
                                <Image src="/uber.jpg" alt="Uber" width={32} height={16} className="h-3 sm:h-4 w-auto object-contain" />
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full text-xs border-accent/30 hover:border-accent/60 hover:bg-accent/10 text-accent flex items-center justify-center gap-1 py-2"
                                onClick={() => openYango(event)}
                              >
                                <Image src="/yango.png" alt="Yango" width={32} height={16} className="h-3 sm:h-4 w-auto object-contain" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {selectedEventForRoute && (
            <EventRouteViewer 
              event={selectedEventForRoute}
              isOpen={routeViewerOpen}
              onClose={() => {
                setRouteViewerOpen(false);
                setSelectedEventForRoute(null);
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}