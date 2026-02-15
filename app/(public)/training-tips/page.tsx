'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/navigation';
import Footer from '@/components/sections/footer';
import { supabase } from '@/lib/supabase';
import { optimizeCloudinaryUrl } from '@/lib/cloudinary';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Tag, TrendingUp } from 'lucide-react';

interface TrainingTip {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image: string;
  created_at: string;
}

const CATEGORIES = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Nutrition',
  'Recovery',
  'Injury Prevention',
  'Race Strategy'
];

export default function TrainingTipsPage() {
  const [tips, setTips] = useState<TrainingTip[]>([]);
  const [filteredTips, setFilteredTips] = useState<TrainingTip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch training tips
  useEffect(() => {
    const fetchTips = async () => {
      try {
        const { data, error } = await supabase
          .from('training_tips')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTips(data || []);
        setFilteredTips(data || []);
      } catch (error) {
        console.error('Error fetching training tips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  // Handle filtering
  useEffect(() => {
    let filtered = tips;

    if (selectedCategory) {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(tip =>
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTips(filtered);
  }, [searchQuery, selectedCategory, tips]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training tips...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 sm:mb-12">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <img src="/icon.svg" alt="WalkEnd WeekEnd" className="w-8 h-8" />
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-0">Training Tips</h1>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">Expert guidance to improve your running performance</p>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Filter by Category</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('')}
                  className={selectedCategory === '' ? 'bg-orange-500 text-white' : ''}
                >
                  All
                </Button>
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-orange-500 text-white' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips Grid */}
          {filteredTips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {searchQuery || selectedCategory ? 'No tips found matching your filters' : 'No training tips yet'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTips.map((tip) => (
                <Card
                  key={tip.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  {tip.image && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={optimizeCloudinaryUrl(tip.image, {
                          width: 400,
                          height: 250,
                          quality: 'auto',
                          format: 'auto'
                        })}
                        alt={tip.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col grow">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        {tip.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {tip.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 grow line-clamp-3">
                      {tip.description}
                    </p>

                    {/* Read More Button */}
                    <Link href={`/training-tips/${tip.id}`}>
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </Card>
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
