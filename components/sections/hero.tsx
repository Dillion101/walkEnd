'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const heroRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      },
      { threshold: 0.3 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="hero" ref={heroRef} className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-runner.jpg"
          alt="Runner in action"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-start justify-center min-h-[calc(100vh-64px)]">
        <div className="space-y-6 max-w-2xl animate-fade-up">
          <div className="inline-block">
            <span className="text-accent uppercase text-sm tracking-widest font-semibold">Weekly Running Community</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-tight text-white">
            WalkEnd
            <br />
            WeekEnd
          </h1>

          <p className="text-lg sm:text-xl text-gray-200 font-light max-w-xl leading-relaxed">
            Experience the thrill of running with our vibrant community. Join weekly runs, build friendships, and push your limits together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <button className="bg-accent text-background px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-accent/90 transition-colors">
              Join Next Run
            </button>
            <button className="border-2 border-white text-white px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="text-white" size={24} />
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 0.8s ease-out;
        }
      `}</style>
    </section>
  )
}
