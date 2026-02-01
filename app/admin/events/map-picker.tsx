'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialLocationName?: string;
}

// Accra, Ghana coordinates
const ACCRA_LAT = 5.6037;
const ACCRA_LNG = -0.1870;

export function MapPicker({
  onLocationSelect,
  initialLat = ACCRA_LAT,
  initialLng = ACCRA_LNG,
  initialLocationName = 'Accra, Ghana'
}: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
    name: initialLocationName
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Only initialize once
    if (map.current) return;

    // Fix Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });

    // Create map
    map.current = L.map(mapContainer.current).setView([selectedLocation.lat, selectedLocation.lng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map.current);

    // Add initial marker
    marker.current = L.marker([selectedLocation.lat, selectedLocation.lng], {
      icon: new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map.current).bindPopup(`<div class="text-sm"><p class="font-semibold">${selectedLocation.name}</p><p class="text-gray-600">${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}</p></div>`);

    // Handle map clicks
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Remove old marker
      if (marker.current) {
        map.current?.removeLayer(marker.current);
      }

      // Add new marker
      marker.current = L.marker([lat, lng], {
        icon: new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map.current!).bindPopup(`<div class="text-sm"><p class="font-semibold">Selected Location</p><p class="text-gray-600">${lat.toFixed(4)}, ${lng.toFixed(4)}</p></div>`).openPopup();

      const newLocation = {
        lat,
        lng,
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
      setSelectedLocation(newLocation);
      onLocationSelect(lat, lng, newLocation.name);
    });

    return () => {
      // Don't destroy map on unmount - keep it persistent
    };
  }, []);

  // Handle search for locations
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use OpenStreetMap Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&countrycodes=gh`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const results = data.map((item: any) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFromSearch = (result: { name: string; lat: number; lng: number }) => {
    const { lat, lng, name } = result;

    if (map.current) {
      map.current.setView([lat, lng], 15);
    }

    // Remove old marker
    if (marker.current && map.current) {
      map.current.removeLayer(marker.current);
    }

    // Add new marker
    if (map.current) {
      marker.current = L.marker([lat, lng], {
        icon: new L.Icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map.current).bindPopup(`<div class="text-sm"><p class="font-semibold">${name}</p><p class="text-gray-600">${lat.toFixed(4)}, ${lng.toFixed(4)}</p></div>`).openPopup();
    }

    const newLocation = { lat, lng, name };
    setSelectedLocation(newLocation);
    setSearchResults([]);
    setSearchQuery('');
    onLocationSelect(lat, lng, name);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Location</label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search for a location (e.g., 'Tetteh Quarshie Interchange')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectFromSearch(result)}
                      className="w-full text-left px-3 py-2 hover:bg-orange-50 border-b last:border-b-0 text-sm"
                    >
                      <p className="font-medium text-gray-900">{result.name.split(',')[0]}</p>
                      <p className="text-xs text-gray-500">{result.lat.toFixed(4)}, {result.lng.toFixed(4)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={isSearching} size="sm">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </form>
          <p className="text-xs text-gray-500">Or click on the map to select a location</p>
        </div>
      </Card>

      <div ref={mapContainer} className="w-full h-96 rounded-lg border shadow-sm" />

      <Card className="p-4 bg-orange-50 border-orange-200">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-medium text-gray-900">{selectedLocation.name}</p>
            <p className="text-sm text-gray-600">
              Latitude: {selectedLocation.lat.toFixed(6)} | Longitude: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
