'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const scrollToSection = (id: string) => {
    setIsOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => scrollToSection('hero')} className="text-2xl font-display font-bold text-accent hover:text-accent/80 transition-colors">
              WalkEnd
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('next-run')} className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Next Run
            </button>
            <button onClick={() => scrollToSection('gallery')} className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Gallery
            </button>
            <button onClick={() => scrollToSection('merchandise')} className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Merch
            </button>
            <button onClick={() => scrollToSection('footer')} className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Contact
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-card rounded-lg transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
            <button onClick={() => scrollToSection('next-run')} className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Next Run
            </button>
            <button onClick={() => scrollToSection('gallery')} className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Gallery
            </button>
            <button onClick={() => scrollToSection('merchandise')} className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Merch
            </button>
            <button onClick={() => scrollToSection('footer')} className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Contact
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
