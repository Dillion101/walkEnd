"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  CSSProperties,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapContextType {
  map: maplibregl.Map | null;
  isLoaded: boolean;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within MapProvider");
  }
  return context;
}

interface MapProps {
  center?: [number, number];
  zoom?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  minZoom?: number;
  maxZoom?: number;
  pitch?: number;
  bearing?: number;
}

export function Map({
  center = [0, 0],
  zoom = 12,
  children,
  className = "",
  style,
  minZoom = 0,
  maxZoom = 20,
  pitch = 0,
  bearing = 0,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: center as [number, number],
      zoom: zoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      pitch: pitch,
      bearing: bearing,
    });

    map.current.on("load", () => {
      setIsLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <MapContext.Provider value={{ map: map.current, isLoaded }}>
      <div
        ref={mapContainer}
        className={`relative w-full h-full overflow-hidden ${className}`}
        style={style}
      />
      {isLoaded && children}
    </MapContext.Provider>
  );
}

interface MarkerContentProps {
  children?: ReactNode;
}

export function MarkerContent({ children }: MarkerContentProps) {
  return <>{children}</>;
}

interface MarkerLabelProps {
  children?: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function MarkerLabel({
  children,
  position = "top",
}: MarkerLabelProps) {
  const positionClasses = {
    top: "-top-8 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "-bottom-8 left-1/2 -translate-x-1/2 translate-y-full",
    left: "-left-2 top-1/2 -translate-y-1/2 -translate-x-full",
    right: "-right-2 top-1/2 -translate-y-1/2 translate-x-full",
  };

  return (
    <div
      className={`absolute whitespace-nowrap px-2 py-1 bg-black/80 text-white text-xs rounded pointer-events-none ${positionClasses[position]}`}
    >
      {children}
    </div>
  );
}

interface MapMarkerProps {
  longitude: number;
  latitude: number;
  children?: ReactNode;
}

export function MapMarker({
  longitude,
  latitude,
  children,
}: MapMarkerProps) {
  const { map, isLoaded } = useMap();
  const markerElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map || !isLoaded || !markerElement.current) return;

    const marker = new maplibregl.Marker({
      element: markerElement.current,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, isLoaded, longitude, latitude]);

  return (
    <div
      ref={markerElement}
      className="relative cursor-pointer"
      style={{ display: "none" }}
    >
      {children}
    </div>
  );
}

interface MapRouteProps {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  onClick?: () => void;
}

export function MapRoute({
  coordinates,
  color = "#6366f1",
  width = 4,
  opacity = 1,
  onClick,
}: MapRouteProps) {
  const { map, isLoaded } = useMap();
  const routeIdRef = useRef<string>(`route-${Math.random()}`);

  useEffect(() => {
    if (!map || !isLoaded || coordinates.length === 0) return;

    const routeId = routeIdRef.current;
    const sourceId = `${routeId}-source`;

    // Add source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });
    }

    // Add layer
    if (!map.getLayer(routeId)) {
      map.addLayer({
        id: routeId,
        type: "line",
        source: sourceId,
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": opacity,
        },
      });

      if (onClick) {
        map.on("click", routeId, onClick);
        map.getCanvas().style.cursor = "pointer";
      }
    } else {
      // Update existing layer
      map.setPaintProperty(routeId, "line-color", color);
      map.setPaintProperty(routeId, "line-width", width);
      map.setPaintProperty(routeId, "line-opacity", opacity);
    }

    return () => {
      // Check map exists before removing layers
      if (map && map.getLayer(routeId)) {
        map.removeLayer(routeId);
      }
      if (map && map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, isLoaded, coordinates, color, width, opacity, onClick]);

  return null;
}
