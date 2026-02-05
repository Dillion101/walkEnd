"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Navigation2 } from "lucide-react";
import { EventRouteViewer } from "@/components/event-route-viewer";

interface AdminEventRouteButtonProps {
  event: {
    id: string;
    title: string;
    location_name: string;
    latitude: number | null;
    longitude: number | null;
    end_location_name?: string | null;
    end_latitude?: number | null;
    end_longitude?: number | null;
    date: string;
  };
}

/**
 * A simple button component for the admin panel that opens the event route viewer
 * Only shows if event has valid end location coordinates (not 0,0 or null)
 */
export function AdminEventRouteButton({ event }: AdminEventRouteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check for valid end location (if set) or fall back to location
  const hasValidEndCoords =
    event.end_latitude != null &&
    event.end_longitude != null &&
    !(event.end_latitude === 0 && event.end_longitude === 0) &&
    event.end_location_name;

  if (!hasValidEndCoords) {
    return null;
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        title="View route on map"
        className="gap-2"
      >
        <Navigation2 className="w-4 h-4" />
        View Route
      </Button>

      <EventRouteViewer
        event={event}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
