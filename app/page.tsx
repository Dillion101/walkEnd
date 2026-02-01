'use client'

import { useEffect, useRef } from 'react'
import Hero from '@/components/sections/hero'
import NextRun from '@/components/sections/next-run'
import Gallery from '@/components/sections/gallery'
import Merchandise from '@/components/sections/merchandise'
import Footer from '@/components/sections/footer'
import Navigation from '@/components/navigation'

export default function Home() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navigation />
      <Hero />
      <NextRun />
      <Gallery />
      <Merchandise />
      <Footer />
    </div>
  )
}
