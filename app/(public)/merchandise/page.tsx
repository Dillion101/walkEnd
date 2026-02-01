'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/sections/footer'

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
    const message = `Hi, I'm interested in ordering: ${item.name} (${item.price})`
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black pt-20 py-12">
          <div className="flex items-center justify-center">
            <div className="text-white text-lg">Loading merchandise...</div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-black pt-20 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center py-12">
              <div className="flex justify-center mb-6">
                <img src="/icon.svg" alt="Logo" className="h-16 w-16" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Shop</h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Support the community with exclusive WalkEnd WeekEnd merchandise
              </p>
            </div>

            {/* Products Grid */}
            {items.length === 0 ? (
              <Card className="p-12 text-center bg-gray-900 border-gray-800">
                <p className="text-gray-400 text-lg">No merchandise available yet. Check back soon!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-xl hover:shadow-orange-500/20 transition-all flex flex-col bg-gray-900 border-gray-800">
                    <div className="relative h-48 bg-gray-800 overflow-hidden">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    <CardHeader className="flex-1">
                      <CardTitle className="text-white">{item.name}</CardTitle>
                      <CardDescription className="text-gray-400">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-orange-500">${item.price}</span>
                      </div>
                      <Button
                        onClick={() => handleWhatsAppOrder(item)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Order on WhatsApp
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Info Box */}
            <Card className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 mt-12">
              <h3 className="font-bold text-orange-400 mb-2">💬 How to Order</h3>
              <p className="text-gray-300">
                Click the "Order on WhatsApp" button on any item and our team will help you complete your purchase. We'll confirm availability, discuss shipping options, and finalize payment.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
