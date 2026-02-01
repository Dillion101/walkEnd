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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-6 h-6" />
              </div>
              <span className="text-2xl font-display font-bold text-accent hover:text-accent/80 transition-colors hidden sm:inline">
                WalkEnd
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Home
            </Link>
            <Link href="/event-calendar" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Events
            </Link>
            <Link href="/join-run" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Join Run
            </Link>
            <Link href="/gallery" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Gallery
            </Link>
            <Link href="/blog" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Blog
            </Link>
            <Link href="/training-tips" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Tips
            </Link>
            <Link href="/faq" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              FAQ
            </Link>
            <Link href="/merchandise" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/about" className="text-sm uppercase tracking-wider hover:text-accent transition-colors">
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 hidden sm:flex">
                {isAdmin && (
                  <Link href="/admin" className="text-sm text-orange-500 hover:text-orange-600">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-3 border-l border-border">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user.full_name || user.email}</p>
                    <p className="text-xs text-gray-400">{isAdmin ? 'Admin' : 'User'}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/50 flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-500">
                      {(user.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="ml-2 text-sm text-gray-400 hover:text-accent transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 hidden sm:flex">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="text-sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
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
            <Link href="/" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Home
            </Link>
            <Link href="/event-calendar" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Events
            </Link>
            <Link href="/join-run" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Join Run
            </Link>
            <Link href="/gallery" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Gallery
            </Link>
            <Link href="/blog" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Blog
            </Link>
            <Link href="/training-tips" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Tips
            </Link>
            <Link href="/faq" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              FAQ
            </Link>
            <Link href="/merchandise" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
              Shop
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="block w-full text-left px-4 py-2 text-sm text-orange-500">
                    Admin
                  </Link>
                )}
                <div className="px-4 py-2 border-t border-border">
                  <p className="text-sm font-medium text-white">{user.full_name || user.email}</p>
                  <p className="text-xs text-gray-400 mb-2">{isAdmin ? 'Admin' : 'User'}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="block w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-card rounded transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
