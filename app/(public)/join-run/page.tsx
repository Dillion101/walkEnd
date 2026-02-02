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
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  meetup_point: string;
}

export default function JoinRunPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
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

    if (!selectedEventId) {
      setMessage({ type: 'error', text: 'Please select an event' });
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setLoading(true);
    try {
      // Register for event
      const { error: registrationError } = await supabase
        .from('event_registrations')
        .insert([
          {
            user_id: user?.id,
            event_id: selectedEventId,
            registration_date: new Date().toISOString()
          }
        ]);

      if (registrationError) throw registrationError;

      // Update phone number if provided
      if (phoneNumber && phoneNumber !== user?.phone_number) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ phone_number: phoneNumber })
          .eq('id', user?.id);

        if (updateError) throw updateError;
      }

      setMessage({
        type: 'success',
        text: 'Successfully registered for the event! Check your email for confirmation.'
      });
      setSelectedEventId('');
      setSelectedEvent(null);

      // Clear form after success
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to register for event. Please try again.'
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
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
              <h1 className="text-4xl font-bold text-white mb-0">Join a Run</h1>
            </div>
            <p className="text-gray-400">Register for upcoming runs and connect with our running community</p>
          </div>

          {message && (
            <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Register for an Event</h2>
              
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No upcoming events at this time.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Event
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      aria-label="Select an event to join"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., +233 24 123 4567"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We&apos;ll use this to send event updates and reminders
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !selectedEventId}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {loading ? 'Registering...' : 'Register for Event'}
                  </Button>
                </form>
              )}
            </Card>

            {/* Event Details Section */}
            <div className="space-y-4">
              {selectedEvent ? (
                <Card className="p-6 bg-orange-50 border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedEvent.title}</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-gray-600">
                          {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Time</p>
                        <p className="text-gray-600">{selectedEvent.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-gray-600">{selectedEvent.location}</p>
                        <p className="text-sm text-gray-500 mt-1">Meetup: {selectedEvent.meetup_point}</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <p>Select an event to see details</p>
                </Card>
              )}

              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">After Registration</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Confirmation email sent to your inbox</li>
                  <li>✓ Event updates and reminders via email</li>
                  <li>✓ Add to your calendar</li>
                  <li>✓ Connect with other runners</li>
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
