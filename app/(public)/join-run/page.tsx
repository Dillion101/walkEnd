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
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
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
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
              <h1 className="text-4xl font-bold text-white mb-0">Join a Run</h1>
            </div>
            <p className="text-gray-400 text-lg">Register for upcoming runs and connect with our running community</p>
          </div>

          {message && (
            <Alert className={`mb-6 border-2 ${message.type === 'success' ? 'bg-emerald-950 border-emerald-700' : 'bg-red-950 border-red-700'}`}>
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-emerald-200' : 'text-red-200'}>
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card className="p-6 bg-gray-950 border border-gray-800 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-6">Register for an Event</h2>
              
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No upcoming events at this time.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Select Event *
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                      aria-label="Select an event to join"
                      required
                    >
                      <option value="">Choose an event...</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {new Date(event.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., +233 24 123 4567"
                      className="w-full bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-orange-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      We&apos;ll use this to send event updates and reminders
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !selectedEventId}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registering...' : 'Register for Event'}
                  </Button>
                </form>
              )}
            </Card>

            {/* Event Details Section */}
            <div className="space-y-4">
              {selectedEvent ? (
                <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 border border-orange-900/30 rounded-xl shadow-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">{selectedEvent.title}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                      <Calendar className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Date</p>
                        <p className="text-gray-200 font-medium">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                      <Clock className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Time</p>
                        <p className="text-gray-200 font-medium">{selectedEvent.time || new Date(selectedEvent.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pb-3 border-b border-gray-800">
                      <MapPin className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase">Location</p>
                        <p className="text-gray-200 font-medium">{selectedEvent.location_name}</p>
                      </div>
                    </div>

                    <div className="pt-3">
                      <p className="text-xs font-medium text-gray-400 uppercase mb-2">Description</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{selectedEvent.description}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-800">
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
                <Card className="p-6 text-center bg-gray-950 border border-gray-800 rounded-xl">
                  <p className="text-gray-400">Select an event to see details</p>
                </Card>
              )}

              <Card className="p-5 bg-gradient-to-br from-orange-950 to-orange-900 border border-orange-800 rounded-xl shadow-lg">
                <h4 className="font-semibold text-orange-100 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  After Registration
                </h4>
                <ul className="text-sm text-orange-100 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">✓</span>
                    Confirmation email sent to your inbox
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">✓</span>
                    Event updates and reminders via email
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">✓</span>
                    Add to your calendar
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">✓</span>
                    Connect with other runners
                  </li>
                </ul>
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
