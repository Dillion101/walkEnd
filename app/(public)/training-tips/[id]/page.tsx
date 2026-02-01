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
import { Calendar, Tag, ArrowLeft } from 'lucide-react';

interface TrainingTip {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image: string;
  created_at: string;
}

export default function TrainingTipDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tip, setTip] = useState<TrainingTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const { data, error } = await supabase
          .from('training_tips')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          setNotFound(true);
          throw error;
        }
        setTip(data);
      } catch (error) {
        console.error('Error fetching training tip:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTip();
  }, [id]);

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

  if (notFound || !tip) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/training-tips">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Training Tips
            </Button>
          </Link>
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Tip Not Found</h1>
            <p className="text-gray-400">The training tip you&apos;re looking for doesn&apos;t exist.</p>
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
        <Link href="/training-tips">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Training Tips
          </Button>
        </Link>

        {/* Featured Image */}
        {tip.image && (
          <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={tip.image}
              alt={tip.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <Card className="p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">{tip.title}</h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              <span className="font-medium text-orange-600">{tip.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(tip.created_at)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-900 font-medium">{tip.description}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-6">
            {tip.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tips CTA */}
          <div className="mt-12 pt-8 border-t">
            <div className="bg-orange-500/10 rounded-lg p-6 border border-orange-500/20">
              <h3 className="font-semibold text-white mb-2">Want to improve your running?</h3>
              <p className="text-gray-400 mb-4">Explore more tips and strategies from our community.</p>
              <Link href="/training-tips">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  View All Tips
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
