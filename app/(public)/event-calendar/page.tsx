'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  meetup_point: string;
}

interface CalendarDay {
  date: number;
  hasEvent: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export default function EventCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

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

        if (error) throw error;
        setEvents(data || []);

        // Extract unique months
        const months = new Set<string>();
        data?.forEach((event) => {
          const date = new Date(event.date);
          months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        });
        setAvailableMonths(Array.from(months).sort());
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Generate calendar days
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
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
        hasEvent: false,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      dayDate.setHours(0, 0, 0, 0);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const hasEvent = events.some(e => e.date.startsWith(dateStr));
      const isToday = dayDate.getTime() === today.getTime();

      days.push({
        date: i,
        hasEvent,
        isCurrentMonth: true,
        isToday
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        hasEvent: false,
        isCurrentMonth: false,
        isToday: false
      });
    }

    setCalendarDays(days);
  }, [currentMonth, events]);

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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [year, month] = e.target.value.split('-');
    setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1));
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
              <h1 className="text-4xl font-bold text-white mb-0">Event Calendar</h1>
            </div>
            <p className="text-gray-400">Browse and register for upcoming runs</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{monthName}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Previous month"
                    >
                      ←
                    </button>
                    {availableMonths.length > 0 && (
                      <select
                        value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`}
                        onChange={handleMonthChange}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        aria-label="Select month"
                      >
                        {availableMonths.map(month => {
                          const [year, monthNum] = month.split('-');
                          const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                          return (
                            <option key={month} value={month}>
                              {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </option>
                          );
                        })}
                      </select>
                    )}
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Next month"
                    >
                      →
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="space-y-2">
                  {/* Week days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => (
                      <div
                        key={idx}
                        className={`
                          aspect-square flex items-center justify-center rounded-lg font-medium text-sm cursor-default
                          transition-colors
                          ${day.isCurrentMonth ? 'bg-white border border-gray-200' : 'bg-gray-100 text-gray-400'}
                          ${day.isToday ? 'bg-orange-100 text-orange-900 border-orange-300 border-2' : ''}
                          ${day.hasEvent && day.isCurrentMonth ? 'bg-blue-50 border-2 border-blue-400' : ''}
                          ${day.isCurrentMonth && !day.isToday && !day.hasEvent ? 'hover:bg-gray-50' : ''}
                        `}
                      >
                        {day.date}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 pt-6 border-t space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 border-2 border-blue-400 rounded"></div>
                    <span className="text-gray-600">Event scheduled</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Events List Section */}
            <div>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Events in {monthName}
                </h3>

                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No events scheduled this month</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition"
                      >
                        <h4 className="font-medium text-white text-sm mb-2">{event.title}</h4>
                        
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        </div>

                        <Link href={`/join-run?event=${event.id}`}>
                          <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs">
                            Register
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
