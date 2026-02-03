'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Menu, X, Home, Calendar, ShoppingBag, Image as ImageIcon, BookOpen, HelpCircle, Lightbulb } from 'lucide-react'
import Image from 'next/image'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only redirect if loading is complete and user is not admin
    if (mounted && !loading && !isAdmin) {
      router.push('/')
    }
  }, [mounted, loading, isAdmin, router])

  // Don't render anything until mounted and auth is checked
  if (!mounted || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  const adminLinks = [
    { label: 'Dashboard', href: '/admin', icon: Home },
    { label: 'Events', href: '/admin/events', icon: Calendar },
    { label: 'Merchandise', href: '/admin/merchandise', icon: ShoppingBag },
    { label: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
    { label: 'Blog Posts', href: '/admin/blog', icon: BookOpen },
    { label: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { label: 'Training Tips', href: '/admin/training-tips', icon: Lightbulb },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between gap-3">
          {sidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2 flex-1 min-w-0">
              <Image
                src="/icon.svg"
                alt="Logo"
                width={32}
                height={32}
              />
              <span className="font-bold truncate">WalkEnd</span>
            </Link>
          )}
          {!sidebarOpen && (
            <Link href="/admin">
              <Image
                src="/icon.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-background rounded shrink-0"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {adminLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded hover:bg-background transition-colors text-sm"
                title={link.label}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          {sidebarOpen && <p>Logged in as Admin</p>}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage WalkEnd WeekEnd content</p>
        </header>

        <main className={`flex-1 overflow-auto p-4 sm:p-6 transition-all duration-300 `}>
          {children}
        </main>
      </div>
    </div>
  )
}
