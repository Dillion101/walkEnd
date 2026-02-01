'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string;
  author: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          setNotFound(true);
          throw error;
        }
        setPost(data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
            <p className="text-gray-400">The blog post you&apos;re looking for doesn&apos;t exist.</p>
          </Card>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <Card className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6">
            {post.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Related Articles CTA */}
          <div className="mt-12 pt-8 border-t">
            <div className="bg-orange-500/10 rounded-lg p-6 border border-orange-500/20">
              <h3 className="font-semibold text-white mb-2">Enjoyed this article?</h3>
              <p className="text-gray-400 mb-4">Check out more tips and stories from our running community.</p>
              <Link href="/blog">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Read More Articles
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
    <Footer />
    </>
  );
}
