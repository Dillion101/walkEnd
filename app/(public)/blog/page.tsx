'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User, Search, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author: string;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch blog posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
        setFilteredPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
              <h1 className="text-4xl font-bold text-white mb-0">Running Blog</h1>
            </div>
            <p className="text-gray-400 mb-6">Tips, stories, and inspiration from our running community</p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery ? 'No articles found matching your search' : 'No blog posts yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Featured Image */}
                      {post.featured_image && (
                        <div className="md:col-span-1 relative h-48 md:h-auto">
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className={`p-6 flex flex-col justify-between ${post.featured_image ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 border-t pt-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.created_at)}
                          </div>
                          <div className="ml-auto">
                            <ArrowRight className="w-4 h-4 text-orange-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
