"use client";

import { useEffect, useState } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapRoute,
  MarkerLabel,
  useMap,
} from "@/components/ui/map";
import { Loader2, Clock, Route, RotateCcw, Mountain, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RouteData {
  coordinates: [number, number][];
  duration: number; // seconds
  distance: number; // meters
}

interface EventRouteViewerProps {
  event: {
    id: string;
    title: string;
    location_name: string;
    latitude: number;
    longitude: number;
    end_location_name?: string;
    end_latitude?: number;
    end_longitude?: number;
    date: string;
  };
  isOpen: boolean;
  onClose: () => void;
  startLocation?: { name: string; lng: number; lat: number };
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// Map controller component
function MapController({ selectedIndex }: { selectedIndex: number }) {
  const { map, isLoaded } = useMap();
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMove = () => {
      try {
        setPitch(Math.round(map.getPitch()));
        setBearing(Math.round(map.getBearing()));
      } catch (error) {
        // Map might be being destroyed
        console.debug("Error reading map state:", error);
      }
    };

    map.on("move", handleMove);
    return () => {
      try {
        if (map && typeof map.off === "function") {
          map.off("move", handleMove);
        }
      } catch (error) {
        // Map might be destroyed, silently fail
        console.debug("Error removing map listener:", error);
      }
    };
  }, [map, isLoaded]);

  const handle3DView = () => {
    try {
      if (map && typeof map.easeTo === "function") {
        map.easeTo({
          pitch: 60,
          bearing: -20,
          duration: 1000,
        });
      }
    } catch (error) {
      console.debug("Error setting 3D view:", error);
    }
  };

  const handleReset = () => {
    try {
      if (map && typeof map.easeTo === "function") {
        map.easeTo({
          pitch: 0,
          bearing: 0,
          center: map.getCenter(),
          zoom: map.getZoom(),
          duration: 1000,
        });
      }
    } catch (error) {
      console.debug("Error resetting view:", error);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={handle3DView}
          className="bg-black/40 border-0 hover:bg-black/60"
        >
          <Mountain className="size-4 mr-1.5" />
          3D
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReset}
          className="bg-black/40 border-0 hover:bg-black/60"
        >
          <RotateCcw className="size-4 mr-1.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

// Route display component
function RouteDisplay({
  event,
  startLocation,
}: {
  event: EventRouteViewerProps["event"];
  startLocation: EventRouteViewerProps["startLocation"];
}) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultStart = startLocation || {
    name: event.location_name,
    lng: event.longitude,
    lat: event.latitude,
  };

  const end = {
    name: event.end_location_name || event.location_name,
    lng: event.end_longitude ?? event.longitude,
    lat: event.end_latitude ?? event.latitude,
  };

  useEffect(() => {
    async function fetchRoutes() {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
        if (!apiKey) {
          throw new Error("OpenRouteService API key not configured");
        }

        // Use OpenRouteService for walking routes with accurate time estimates
        const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${apiKey}&start=${defaultStart.lng},${defaultStart.lat}&end=${end.lng},${end.lat}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(url, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, application/geo+json'
          }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const routeData: RouteData[] = data.features.map(
            (feature: {
              geometry: { coordinates: [number, number][] };
              properties: { summary: { duration: number; distance: number } };
            }) => ({
              coordinates: feature.geometry.coordinates,
              duration: feature.properties.summary.duration,
              distance: feature.properties.summary.distance,
            })
          );
          setRoutes(routeData);
        } else {
          setError("No walking route found between these locations");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          console.error("Route request timeout");
          setError("Request timeout. Please try again.");
        } else {
          console.error("Failed to fetch routes:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load routes"
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutes();
  }, [
    event.longitude,
    event.latitude,
    event.end_longitude,
    event.end_latitude,
    startLocation?.lng,
    startLocation?.lat,
    defaultStart.lng,
    defaultStart.lat,
    end.lng,
    end.lat
  ]);

  // Sort routes: non-selected first, selected last (renders on top)
  const sortedRoutes = routes
    .map((route, index) => ({ route, index }))
    .sort((a, b) => {
      if (a.index === selectedIndex) return 1;
      if (b.index === selectedIndex) return -1;
      return 0;
    });

  // Calculate map center
  const centerLng = (defaultStart.lng + end.lng) / 2;
  const centerLat = (defaultStart.lat + end.lat) / 2;

  return (
    <>
      <div className="h-125 w-full relative bg-gray-100 rounded-lg overflow-hidden">
        <Map center={[centerLng, centerLat]} zoom={12}>
          {sortedRoutes.map(({ route, index }) => {
            const isSelected = index === selectedIndex;
            return (
              <MapRoute
                key={index}
                coordinates={route.coordinates}
                color={isSelected ? "#6366f1" : "#94a3b8"}
                width={isSelected ? 6 : 5}
                opacity={isSelected ? 1 : 0.6}
                onClick={() => setSelectedIndex(index)}
              />
            );
          })}

          <MapMarker longitude={defaultStart.lng} latitude={defaultStart.lat}>
            <MarkerContent>
              <div className="relative">
                <div className="size-5 rounded-full bg-green-500 border-2 border-white shadow-lg" />
                <MarkerLabel position="top">{defaultStart.name}</MarkerLabel>
              </div>
            </MarkerContent>
          </MapMarker>

          <MapMarker longitude={end.lng} latitude={end.lat}>
            <MarkerContent>
              <div className="relative">
                <div className="size-5 rounded-full bg-red-500 border-2 border-white shadow-lg" />
                <MarkerLabel position="bottom">{end.name}</MarkerLabel>
              </div>
            </MarkerContent>
          </MapMarker>

          <MapController selectedIndex={selectedIndex} />
        </Map>

        {/* Routes list overlay */}
        {routes.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-2 max-h-120 overflow-y-auto">
            {routes.map((route, index) => {
              const isActive = index === selectedIndex;
              const isFastest = index === 0;
              return (
                <Button
                  key={index}
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedIndex(index)}
                  className="justify-start gap-3 min-w-60 bg-black/40 border-0 hover:bg-black/60 text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    <span className="font-medium">
                      {formatDuration(route.duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs opacity-80">
                    <Route className="size-3" />
                    {formatDistance(route.distance)}
                  </div>
                  {isFastest && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#10b981] text-white ml-auto">
                      Fastest
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex flex-col items-center gap-3 bg-white rounded-lg p-6 shadow-lg">
              <Loader2 className="size-6 animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-gray-700">
                Loading routes...
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-lg p-6 shadow-lg text-center">
              <p className="text-sm text-gray-700 mb-3">
                Could not load routes. Make sure coordinates are valid.
              </p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Event info card */}
      {routes.length > 0 && (
        <div className="mt-6 bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Distance
              </p>
              <p className="text-2xl font-bold mt-2">
                {routes[selectedIndex].distance > 1000
                  ? `${(routes[selectedIndex].distance / 1000).toFixed(1)} km`
                  : `${Math.round(routes[selectedIndex].distance)} m`}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estimated Time
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatDuration(routes[selectedIndex].duration)}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Start
              </p>
              <p className="text-base font-medium mt-1">{defaultStart.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                End
              </p>
              <p className="text-base font-medium mt-1">{end.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Event
              </p>
              <p className="text-base font-medium mt-1">{event.title}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function EventRouteViewer({
  event,
  isOpen,
  onClose,
  startLocation,
}: EventRouteViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Event Route</DialogTitle>
            <DialogDescription>
              View the route to {event.location_name}
            </DialogDescription>
          </div>
        </DialogHeader>

        <RouteDisplay event={event} startLocation={startLocation} />
      </DialogContent>
    </Dialog>
  );
}
