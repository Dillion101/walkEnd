'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RideHailing } from '@/components/ride-hailing';
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin, Info } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
}

export default function JoinRunPage() {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gt('date', today)
          .order('date', { ascending: true });

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage({ type: 'error', text: 'Failed to load events' });
      } finally {
        setEventsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Update selected event when dropdown changes
  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === selectedEventId);
      setSelectedEvent(event || null);
    }
  }, [selectedEventId, events]);

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId || !selectedEvent) {
      setMessage({ type: 'error', text: 'Please select an event' });
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      // Check if user already registered for this event
      const { data: existingReg } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('event_id', selectedEventId)
        .single();

      if (existingReg) {
        setMessage({ type: 'error', text: 'You have already registered for this event.' });
        setLoading(false);
        return;
      }

      // Register for event
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert([
          {
            user_id: user?.id,
            event_id: selectedEventId
          }
        ]);

      if (registrationError) {
        console.error('Registration error:', registrationError);
        throw new Error(registrationError.message || 'Failed to register for event');
      }

      // Update phone number if provided
      if (phoneNumber && phoneNumber !== user?.phone_number) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ phone_number: phoneNumber })
          .eq('id', user?.id);

        if (updateError) {
          console.error('Update error:', updateError);
          // Don't fail registration if phone update fails
        }
      }

      setMessage({
        type: 'success',
        text: `Successfully registered for ${selectedEvent.title}! Check your email for confirmation.`
      });
      setSelectedEventId('');
      setSelectedEvent(null);
      setPhoneNumber(user?.phone_number || '');

      // Clear form after success
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Registration error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to register for event. Please try again.';
      setMessage({
        type: 'error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white mb-3">
              Join a Run
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
              Register for upcoming runs and connect with our running community
            </p>
          </div>

          {/* Alert Messages */}
          {message && (
            <Alert 
              className={`mb-6 sm:mb-8 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : 'bg-red-500/10 border-red-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-200' : 'text-red-200'}>
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Registration Form - Left/Top */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8 bg-card border-border">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-6">
                  Event Registration
                </h2>
              
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No upcoming events</p>
                    <p className="text-gray-500 text-sm">Check back soon for new running events</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Event Selection */}
                    <div>
                      <label htmlFor="event-select" className="block text-sm font-medium text-gray-300 mb-2">
                        Select Event <span className="text-accent">*</span>
                      </label>
                      <select
                        id="event-select"
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                        required
                      >
                        <option value="">Choose an event...</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title} - {new Date(event.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone-input" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number <span className="text-gray-500">(Optional)</span>
                      </label>
                      <Input
                        id="phone-input"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g., +233 24 123 4567"
                        className="w-full bg-background border-border text-white placeholder-gray-500 focus:ring-accent focus:border-accent h-12"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        We&apos;ll use this to send event updates and reminders
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading || !selectedEventId}
                      className="w-full bg-accent hover:bg-accent/90 text-background font-semibold py-3 h-auto rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Registering...' : 'Register for Event'}
                    </Button>
                  </form>
                )}
              </Card>
            </div>

            {/* Event Details & Info - Right/Bottom */}
            <div className="lg:col-span-1 space-y-6">
              {/* Event Details Card */}
              {selectedEvent ? (
                <Card className="p-6 bg-card border-border">
                  <h3 className="text-lg font-bold text-white mb-4 line-clamp-2">
                    {selectedEvent.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Date</p>
                        <p className="text-gray-200 text-sm">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Time</p>
                        <p className="text-gray-200 text-sm">
                          {selectedEvent.time || new Date(selectedEvent.date).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-400 uppercase mb-1">Location</p>
                        <p className="text-gray-200 text-sm break-words">
                          {selectedEvent.location_name}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedEvent.description && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-xs font-medium text-gray-400 uppercase mb-2">Description</p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {selectedEvent.description}
                        </p>
                      </div>
                    )}

                    {/* Ride Hailing */}
                    <div className="pt-4 border-t border-border">
                      <RideHailing
                        latitude={selectedEvent.latitude ?? null}
                        longitude={selectedEvent.longitude ?? null}
                        eventTitle={selectedEvent.title}
                        eventLocation={selectedEvent.location_name}
                      />
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-8 text-center bg-card border-border">
                  <Info className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Select an event to see details</p>
                </Card>
              )}

              {/* What to Expect Card */}
              <Card className="p-6 bg-card border-border">
                <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  After Registration
                </h4>
                <ul className="text-sm text-gray-300 space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Confirmation email sent to your inbox</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Event updates and reminders via email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Add event to your calendar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>Connect with other runners</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}