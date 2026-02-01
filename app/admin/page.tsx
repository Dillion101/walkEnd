'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface Stats {
  events: number
  merchandise: number
  gallery: number
  blogPosts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    events: 0,
    merchandise: 0,
    gallery: 0,
    blogPosts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [eventsRes, merchandiseRes, galleryRes, blogRes] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('merchandise').select('id', { count: 'exact', head: true }),
        supabase.from('gallery_images').select('id', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        events: eventsRes.count || 0,
        merchandise: merchandiseRes.count || 0,
        gallery: galleryRes.count || 0,
        blogPosts: blogRes.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Events', value: stats.events, href: '/admin/events' },
    { label: 'Merchandise', value: stats.merchandise, href: '/admin/merchandise' },
    { label: 'Gallery Items', value: stats.gallery, href: '/admin/gallery' },
    { label: 'Blog Posts', value: stats.blogPosts, href: '/admin/blog' },
  ]

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/icon.svg"
            alt="WalkEnd WeekEnd Logo"
            width={40}
            height={40}
            className="text-primary"
          />
          <h2 className="text-3xl font-bold">Welcome to Admin Panel</h2>
        </div>
        <p className="text-muted-foreground">Manage all WalkEnd WeekEnd content from here</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : stat.value}</div>
              <Link href={stat.href}>
                <Button variant="ghost" className="mt-4 w-full text-xs">
                  Manage →
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with managing your content</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/events">
            <Button variant="outline" className="w-full justify-start">
              + Create Event
            </Button>
          </Link>
          <Link href="/admin/merchandise">
            <Button variant="outline" className="w-full justify-start">
              + Add Merchandise
            </Button>
          </Link>
          <Link href="/admin/gallery">
            <Button variant="outline" className="w-full justify-start">
              + Upload Gallery
            </Button>
          </Link>
          <Link href="/admin/blog">
            <Button variant="outline" className="w-full justify-start">
              + Write Blog Post
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
