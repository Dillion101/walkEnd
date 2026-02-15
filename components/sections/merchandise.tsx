'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { optimizeCloudinaryUrl } from '@/lib/cloudinary'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  description: string
}

export default function Merchandise() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchandise()
  }, [])

  async function fetchMerchandise() {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('id, name, price, image_url, description')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching merchandise:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  function handleWhatsAppOrder(product: Product) {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
    const message = `Hi! I'm interested in: ${product.name} - $${product.price}`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }
  return (
    <section id="merchandise" className="w-full py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 animate-fade-in">
          <span className="text-accent uppercase text-sm tracking-widest font-semibold block animate-slide-up">Gear Up</span>
          <h2 className="text-5xl sm:text-6xl font-bold font-display mt-2 animate-slide-up animation-delay-100">Merchandise</h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl animate-slide-up animation-delay-200">
            Sport our official WalkEnd WeekEnd collection and show your support for the running community.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading merchandise...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No merchandise available at the moment</p>
          </div>
        ) : (
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <Card
                key={product.id}
                className="overflow-hidden bg-card border border-border hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 flex flex-col animate-slide-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-900">
                  <Image
                    src={optimizeCloudinaryUrl(product.image_url || "/placeholder.svg", {
                      width: 400,
                      height: 400,
                      quality: 'auto',
                      format: 'auto'
                    })}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold font-display text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-1">{product.description}</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-accent">₵{typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                  </div>

                  {/* WhatsApp Button */}
                  <Button
                    onClick={() => handleWhatsAppOrder(product)}
                    className="w-full bg-accent hover:bg-accent/90 text-background font-semibold"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Order via WhatsApp
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </section>
  )
}
