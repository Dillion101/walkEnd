'use client'

import { useEffect, useRef } from 'react'
import { MapPin, Users, Clock, ArrowRight } from 'lucide-react'

export default function NextRun() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.run-card').forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-slide-in')
            }, index * 100)
          })
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const runs = [
    {
      day: 'MON',
      date: '3 FEB',
      title: 'Urban Sprint',
      distance: '5K',
      location: 'Downtown Park',
      time: '6:30 PM',
      participants: 24,
      color: 'from-orange-500 to-orange-600',
    },
    {
      day: 'WED',
      date: '5 FEB',
      title: 'Tempo Run',
      distance: '8K',
      location: 'Riverside Trail',
      time: '6:00 PM',
      participants: 18,
      color: 'from-blue-600 to-blue-700',
    },
    {
      day: 'SAT',
      date: '8 FEB',
      title: 'Long Run',
      distance: '15K',
      location: 'Mountain Loop',
      time: '7:00 AM',
      participants: 32,
      color: 'from-purple-600 to-purple-700',
    },
  ]

  return (
    <section id="next-run" ref={sectionRef} className="w-full py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-accent uppercase text-sm tracking-widest font-semibold">This Week</span>
          <h2 className="text-5xl sm:text-6xl font-bold font-display mt-2">Upcoming Runs</h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl">
            Choose your pace and join our community on the streets. All levels welcome.
          </p>
        </div>

        {/* Runs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {runs.map((run, index) => (
            <div
              key={index}
              className="run-card group relative overflow-hidden bg-card border border-border p-6 hover:border-accent transition-all duration-300 opacity-0"
            >
              {/* Day Badge */}
              <div className={`inline-block mb-4 px-3 py-1 rounded-sm bg-gradient-to-r ${run.color} text-white text-xs font-bold uppercase tracking-wider`}>
                {run.day} {run.date}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold font-display mb-1">{run.title}</h3>
                  <p className="text-accent text-lg font-semibold">{run.distance}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-accent" />
                    <span>{run.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-accent" />
                    <span>{run.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-accent" />
                    <span>{run.participants} Runners</span>
                  </div>
                </div>

                {/* Join Button */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <button className="text-accent text-sm font-semibold uppercase tracking-wider hover:text-accent/80 transition-colors flex items-center gap-2">
                    Join Run
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <button className="bg-accent text-background px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-accent/90 transition-colors inline-flex items-center gap-2">
            View Full Schedule
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
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

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
