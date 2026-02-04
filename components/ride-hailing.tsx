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
/** Yango - Handles App and Web automatically via Universal Link */
  const openYango = () => {
    if (!hasCoords) return
    
    // We replace the manual deep link + timeout logic with the Universal Link
    // found in your working ApartmentMap.tsx (data-proxy-url)
    const yangoUniversalLink = `https://yango.go.link/route?end-lat=${latitude}&end-lon=${longitude}&app_launch_method=detect&ref=walkend`
    
    // On mobile, this will try to open the app system-level. 
    // If not installed, it redirects to the web/store.
    window.open(yangoUniversalLink, '_blank')
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
