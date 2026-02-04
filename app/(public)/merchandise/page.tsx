'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'
import { Card } from '@/components/ui/card'

interface Merchandise {
  id: string
  name: string
  description: string
  price: number
  image_url: string
}

export default function MerchandisePage() {
  const [items, setItems] = useState<Merchandise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchandise()
  }, [])

  async function fetchMerchandise() {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching merchandise:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleWhatsAppOrder(item: Merchandise) {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
    const priceFormatted = typeof item.price === 'number' ? item.price.toFixed(2) : item.price
    const message = `Hi, I'm interested in ordering:

*${item.name}*
Price: $${priceFormatted}
${item.description ? `Description: ${item.description}\n` : ''}
Product Image: ${item.image_url || 'No image available'}

Please confirm availability and delivery options.`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-24 pb-20">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-gray-400">Loading merchandise...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-16 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl font-bold font-display mb-4 text-white animate-slide-up">Shop</h1>
            <p className="text-gray-400 text-lg max-w-2xl animate-slide-up animation-delay-100">
              Support the community with exclusive WalkEnd WeekEnd merchandise
            </p>
          </div>

          {/* Products Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No merchandise available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item, idx) => (
                <Card
                  key={item.id}
                  className="overflow-hidden bg-card border border-border hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 flex flex-col animate-slide-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold font-display text-white mb-2">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 flex-1">{item.description}</p>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-accent">${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}</span>
                    </div>

                    {/* WhatsApp Button */}
                    <Button
                      onClick={() => handleWhatsAppOrder(item)}
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
      </main>
      <Footer />

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
      `}</style>
    </>
  )
}

