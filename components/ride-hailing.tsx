'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy, CheckCircle, Smartphone } from 'lucide-react'

interface RideHailingProps {
  latitude: number | null
  longitude: number | null
  eventTitle: string
  eventLocation: string
}

// Treat 0,0 as "admin did not set" - use location name instead
const hasValidCoords = (lat: number | null, lng: number | null) =>
  lat != null && lng != null && !(lat === 0 && lng === 0)

export function RideHailing({ latitude, longitude, eventTitle, eventLocation }: RideHailingProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [copied, setCopied] = useState(false)

  const hasCoords = hasValidCoords(latitude, longitude)

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    setIsMobile(/android|iphone|ipad|ipod/i.test(ua))
  }, [])

  /** Copy: coordinates first if valid (not 0,0), else location name */
  const copyLocation = () => {
    const locationText = hasCoords
      ? `${latitude}, ${longitude}`
      : eventLocation
    navigator.clipboard.writeText(locationText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  /** Uber - only works with valid coordinates (not 0,0) */
  const openUber = () => {
    if (!hasCoords) return
    const nickname = encodeURIComponent(eventTitle)
    const formattedAddress = encodeURIComponent(eventLocation)
    const webFallback = `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[nickname]=${nickname}&dropoff[formatted_address]=${formattedAddress}`
    if (isMobile) {
      window.location.href = `uber://?action=setPickup&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}&dropoff[formatted_address]=${formattedAddress}`
      setTimeout(() => window.open(webFallback, '_blank'), 1500)
    } else {
      window.open(webFallback, '_blank')
    }
  }

  /** Yango - handles both mobile app and web */
  const openYango = () => {
    if (!hasCoords) return
    
    // For Ghana: use Yango web as primary, but try app on mobile
    const address = encodeURIComponent(eventLocation)
    
    if (isMobile) {
      // Try to open Yango app with coordinates
      // App scheme: com.yandex.taxi:// or yandex.taxi://
      const appDeepLink = `yandex.taxi://route?end_lat=${latitude}&end_lon=${longitude}`
      
      // Web fallback URL
      const webUrl = `https://yango.com/gh/order?gfrom=current&gto=${longitude},${latitude}&ref=walkend`
      
      // Try app first
      window.location.href = appDeepLink
      
      // If app doesn't open in 2 seconds, open web
      setTimeout(() => {
        window.open(webUrl, '_blank')
      }, 2000)
    } else {
      // Desktop: open web directly
      window.open(`https://yango.com/gh/order?gfrom=current&gto=${longitude},${latitude}&ref=walkend`, '_blank')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Book a ride to the event</p>

      {/* Copy Location - always shown (coords first if valid, else name) */}
      <button
        onClick={copyLocation}
        className="w-full bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-700"
      >
        {copied ? (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16} />
            <span>Copy Location</span>
          </>
        )}
      </button>

      {/* Uber - only when valid coordinates */}
      {hasCoords && (
        <div className="border border-gray-700 rounded-lg p-3 hover:border-orange-500 transition-colors">
          <div className="flex items-center justify-center h-8 mb-3 bg-black rounded">
            <Image src="/uber.jpg" alt="Uber" width={80} height={32} className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={openUber}
            className="w-full bg-black hover:bg-gray-900 text-white text-xs py-2 rounded transition-colors font-semibold flex items-center justify-center gap-1"
          >
            <Smartphone size={14} />
            Book Ride
          </button>
        </div>
      )}

      {/* Yango - only when valid coordinates */}
      {hasCoords && (
        <div className="border border-gray-700 rounded-lg p-3 hover:border-yellow-500 transition-colors">
          <div className="flex items-center justify-center h-8 mb-3 bg-yellow-400 rounded">
            <Image src="/yango.jpg" alt="Yango" width={80} height={32} className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={openYango}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 rounded transition-colors font-semibold flex items-center justify-center gap-1"
          >
            <Smartphone size={14} />
            Book Ride
          </button>
        </div>
      )}
    </div>
  )
}
