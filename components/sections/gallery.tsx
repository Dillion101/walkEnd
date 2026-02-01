'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Gallery() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const images = [
    { src: '/gallery-1.jpg', alt: 'Community runners together', title: 'Community Spirit' },
    { src: '/gallery-2.jpg', alt: 'Runner sprinting', title: 'Full Sprint' },
    { src: '/gallery-3.jpg', alt: 'Running in motion', title: 'Motion & Power' },
    { src: '/gallery-4.jpg', alt: 'Celebration at finish', title: 'Victory Moment' },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <section id="gallery" ref={sectionRef} className="w-full py-20 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-accent uppercase text-sm tracking-widest font-semibold">Moments</span>
          <h2 className="text-5xl sm:text-6xl font-bold font-display mt-2">Gallery</h2>
          <p className="text-gray-400 text-lg mt-4">
            Capture the energy and passion of our running community.
          </p>
        </div>

        {/* Main Gallery */}
        <div className="relative">
          {/* Featured Image */}
          <div className="relative aspect-video overflow-hidden mb-8 group">
            <Image
              src={images[activeIndex].src || "/placeholder.svg"}
              alt={images[activeIndex].alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            {/* Slide Label */}
            <div className="absolute bottom-6 left-6 bg-accent text-background px-4 py-2">
              <p className="text-sm font-semibold uppercase tracking-wider">{images[activeIndex].title}</p>
            </div>

            {/* Counter */}
            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-2 rounded-sm text-xs font-mono">
              {activeIndex + 1} / {images.length}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              className="group p-2 hover:bg-accent transition-colors rounded-lg"
              aria-label="Previous slide"
            >
              <ChevronLeft className="text-foreground group-hover:text-background transition-colors" size={28} />
            </button>

            {/* Thumbnails */}
            <div className="flex gap-2 flex-1 mx-4">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`relative flex-1 aspect-video overflow-hidden transition-all duration-300 ${
                    activeIndex === index ? 'ring-2 ring-accent' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="group p-2 hover:bg-accent transition-colors rounded-lg"
              aria-label="Next slide"
            >
              <ChevronRight className="text-foreground group-hover:text-background transition-colors" size={28} />
            </button>
          </div>

          {/* Masonry Grid - Additional Images */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div
                key={index}
                className={`relative aspect-square overflow-hidden cursor-pointer group transform transition-all duration-300 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : '0',
                }}
              >
                <Image
                  src={img.src || "/placeholder.svg"}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white font-bold font-display text-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
