'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, isAdmin } = useAuth()

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
          <div className="flex items-center gap-2">
            <Link href="/public/icon.svg" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="text-2xl font-display font-bold text-accent hover:text-accent/80 transition-colors hidden sm:inline">
                WalkEnd
              </span>
            </Link>
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
            <Link href="/about" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user && isAdmin && (
              <>
                <Link href="/admin" className="text-sm text-orange-500 hover:text-orange-600 hidden sm:inline">
                  Admin
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm uppercase tracking-wider hover:text-accent transition-colors hidden sm:inline"
                >
                  Logout
                </button>
              </>
            )}
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
            <Link href="/about" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              About
            </Link>
            {user && isAdmin && (
              <>
                <Link href="/admin" className="block w-full text-left px-4 py-2 text-sm text-orange-500">
                  Admin
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
