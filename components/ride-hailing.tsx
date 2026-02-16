'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Copy, CheckCircle, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Get to the Event</p>

      {/* Copy Location - always shown (coords first if valid, else name) */}
      <Button
        type="button"
        variant="outline"
        onClick={copyLocation}
        className="w-full bg-background hover:bg-card border-border hover:border-accent/50 transition-all h-11 text-sm"
      >
        {copied ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            <span className="text-green-400">Location Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            <span>Copy Location</span>
          </>
        )}
      </Button>

      {/* Ride Options - only when valid coordinates */}
      {hasCoords && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Or book a ride</p>
          
          <div className="grid grid-cols-2 gap-2">
            {/* Uber */}
            <Button
              type="button"
              variant="outline"
              onClick={openUber}
              className="h-auto py-3 px-3 bg-background hover:bg-card border-border hover:border-accent/50 transition-all flex flex-col items-center gap-2"
            >
              <div className="w-full h-6 flex items-center justify-center">
                <Image 
                  src="/uber.jpg" 
                  alt="Uber" 
                  width={60} 
                  height={24} 
                  className="h-5 w-auto object-contain" 
                />
              </div>
              <span className="text-xs font-medium flex items-center gap-1">
                <Car className="w-3 h-3" />
                Book Ride
              </span>
            </Button>

            {/* Yango */}
            <Button
              type="button"
              variant="outline"
              onClick={openYango}
              className="h-auto py-3 px-3 bg-background hover:bg-card border-border hover:border-accent/50 transition-all flex flex-col items-center gap-2"
            >
              <div className="w-full h-6 flex items-center justify-center">
                <Image 
                  src="/yango.png" 
                  alt="Yango" 
                  width={60} 
                  height={24} 
                  className="h-5 w-auto object-contain" 
                />
              </div>
              <span className="text-xs font-medium flex items-center gap-1">
                <Car className="w-3 h-3" />
                Book Ride
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}