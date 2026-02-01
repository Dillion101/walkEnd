'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ShoppingCart, MessageCircle } from 'lucide-react'
import WhatsAppLink from '@/components/whatsapp-link'

export default function Merchandise() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.product-card').forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate-slide-in')
            }, index * 100)
          })
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const products = [
    {
      id: 1,
      name: 'Performance Tee',
      price: '$24.99',
      image: '/merch-shirt.jpg',
      description: 'Lightweight & breathable',
      colors: ['Orange', 'Navy', 'Black'],
    },
    {
      id: 2,
      name: 'Runner Cap',
      price: '$19.99',
      image: '/merch-cap.jpg',
      description: 'UV protection & comfort',
      colors: ['Orange', 'Navy'],
    },
    {
      id: 3,
      name: 'Water Bottle',
      price: '$29.99',
      image: '/merch-bottle.jpg',
      description: 'Insulated 600ml bottle',
      colors: ['Stainless'],
    },
    {
      id: 4,
      name: 'Hoodie',
      price: '$54.99',
      image: '/merch-hoodie.jpg',
      description: 'Premium comfort fit',
      colors: ['Navy', 'Black'],
    },
  ]

  return (
    <section id="merchandise" ref={sectionRef} className="w-full py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <span className="text-accent uppercase text-sm tracking-widest font-semibold">Gear Up</span>
          <h2 className="text-5xl sm:text-6xl font-bold font-display mt-2">Merchandise</h2>
          <p className="text-gray-400 text-lg mt-4 max-w-2xl">
            Sport our official WalkEnd WeekEnd collection and show your support for the running community.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {products.map((product) => (
            <div
              key={product.id}
              className="product-card group relative bg-card border border-border overflow-hidden opacity-0 hover:border-accent transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-900">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <button className="bg-accent text-background px-4 py-2 font-semibold text-sm uppercase tracking-wider hover:bg-accent/90 transition-colors flex items-center gap-2">
                    <ShoppingCart size={16} />
                    Order Now
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold font-display mb-1">{product.name}</h3>
                <p className="text-accent text-xl font-semibold mb-2">{product.price}</p>
                <p className="text-gray-400 text-sm mb-4">{product.description}</p>

                {/* Colors */}
                <div className="flex gap-2 mb-4">
                  {product.colors.map((color, idx) => (
                    <span key={idx} className="text-xs bg-card-foreground/10 px-2 py-1 rounded text-gray-300">
                      {color}
                    </span>
                  ))}
                </div>

                {/* Bottom border */}
                <div className="border-t border-border pt-3">
                  <button className="text-accent text-xs font-semibold uppercase tracking-wider hover:text-accent/80 transition-colors w-full">
                    View Details
                  </button>
                </div>
              </div>

              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Order Section */}
        <div className="max-w-2xl mx-auto bg-card border border-border p-8 sm:p-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold font-display mb-2">Order on WhatsApp</h3>
            <p className="text-gray-400">
              Send us a message with your order details and we'll get back to you within 24 hours.
            </p>
          </div>

          <WhatsAppLink />

          <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-gray-400">
            <div>
              <p className="font-semibold text-foreground mb-1">Fast Shipping</p>
              <p>Delivered within 3-5 days</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Quality Guaranteed</p>
              <p>Premium athletic wear</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Easy Returns</p>
              <p>30-day money back</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  )
}
