# Event Route Viewer - Setup Guide

A complete event management system with interactive route viewing. Users can see the route between event start and end locations, explore alternative routes, and toggle 3D map views.

## Database Setup

Add these columns to the `events` table in Supabase:

```sql
ALTER TABLE events 
ADD COLUMN end_location_name VARCHAR(255),
ADD COLUMN end_latitude DECIMAL(10, 8),
ADD COLUMN end_longitude DECIMAL(11, 8);
```

**Or using Supabase UI:** Add 3 columns to the `events` table:
- `end_location_name` (text, optional)
- `end_latitude` (numeric, optional)
- `end_longitude` (numeric, optional)

---

## Admin Panel: Creating/Editing Events

### Step 1: Basic Event Details
1. Go to `/admin/events`
2. Click **"Create Event"** or click edit on an existing event
3. Fill in:
   - **Title** - Event name
   - **Description** - Event details
   - **Date & Time** - When the run happens
   - **Location Name** - Where it starts (e.g., "Central Park")

### Step 2: Start Location Coordinates
1. Open [Google Maps](https://maps.google.com)
2. Search for the start location
3. Right-click the location pin
4. Copy the coordinates shown in the popup
5. Paste into **Latitude** and **Longitude** fields

### Step 3: End Location (Enables Route Viewing)
1. **End Location Name** - Where the run ends (e.g., "Jubilee Park")
2. **End Latitude & Longitude** - Use Google Maps same as above
3. Once set, the "View Route" button will appear for users

### Step 4: Review Route (as Admin)
1. After setting end location, a **"View Route"** button appears
2. Click it to preview the route users will see
3. Button shows multiple route options and 3D map controls

---

## User Experience: Event Calendar

### Browsing Events
1. Users visit `/event-calendar`
2. Click on events to see details in sidebar
3. See event date, location, and description

### Viewing Routes (if End Location is Set)
1. Click **"Route"** button on the event
2. Interactive map modal opens showing:
   - Multiple route options (fastest, alternatives)
   - Distance and estimated duration
   - Start (green marker) and end (red marker) locations
3. Click any route to highlight it
4. Use **"3D View"** button for perspective visualization
5. Click **"Reset"** to return to 2D map

### Booking Rides
- **Route button** - View the route (only if end location set)
- **Uber button** - Book via Uber (requires coordinates)
- **Yango button** - Book via Yango (requires coordinates)

---

## Components

### 1. Map Component (`components/ui/map.tsx`)
Base map container with markers and routes. Provides:
- MapLibre GL powered rendering
- Drag/zoom/rotate controls
- Marker and route rendering
- `useMap()` hook for child components

### 2. Event Route Viewer (`components/event-route-viewer.tsx`)
Full-featured modal dialog with:
- OpenRouteService API integration for walking routes
- Multiple route calculation
- Interactive route selection
- 3D map toggle and reset
- Route information card
- Loading/error states

### 3. Admin Route Button (`components/admin-event-route-button.tsx`)
Simple button for admin panel:
- Only shows if end location is valid
- Opens route viewer modal
- Used in event list

---

## Key Features

✅ **Walking Routes** - Accurate estimated times for running/walking
✅ **Multiple Routes** - Shows alternative route options
✅ **Route Selection** - Click to highlight and compare routes
✅ **3D Map View** - Tilt and rotate map for perspective visualization
✅ **Smart Buttons** - Route button only shows when end location is configured
✅ **Mobile Responsive** - Full functionality on phones and tablets
✅ **Admin Preview** - Admins can test routes before users see them

---

## Flow Diagram

```
Admin Creates Event
  ↓
Sets: title, date, location, coordinates
  ↓
Sets: end_location_name, end_latitude, end_longitude
  ↓
Clicks "View Route" button to preview
  ↓
Event saved to database
  ↓
Users see "Route" button on calendar
  ↓
Users click "Route" → Interactive map modal opens
  ↓
Maps OSRM service calculates routes
  ↓
Users see alternatives, select preferred route
  ↓
Users can click "3D View" or book via Uber/Yango
```

---

## Customization

### Change Map Style
Edit [components/ui/map.tsx](components/ui/map.tsx) line 39:
```tsx
style: "https://demotiles.maplibre.org/style.json",
```

### Change Route Colors
Edit [components/event-route-viewer.tsx](components/event-route-viewer.tsx) line 196:
```tsx
color={isSelected ? "#6366f1" : "#94a3b8"} // Indigo → Slate
```

### Adjust 3D View Angles
Edit [components/event-route-viewer.tsx](components/event-route-viewer.tsx) line 105:
```tsx
map?.easeTo({
  pitch: 60,      // Tilt angle (0-60)
  bearing: -20,   // Compass bearing (-180 to 180)
  duration: 1000, // Animation time (ms)
});
```

---

## Troubleshooting

### Route button not showing for users
- ✅ Admin must set **end_location_name**
- ✅ Both **end_latitude** and **end_longitude** must be non-zero
- ✅ Coordinates must be valid (not 0,0)

### Map not rendering
- ✅ Check browser console for JavaScript errors
- ✅ Verify map container has height (h-125)
- ✅ Ensure browser supports WebGL
- ✅ Check MapLibre GL CSS is loaded

### Routes not calculating
- ✅ Verify API key is set: `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY` in `.env.local`
- ✅ Verify coordinates are correct [longitude, latitude] order
- ✅ Try with different locations (some routes have no paths)
- ✅ Check network tab in browser dev tools for API errors

---

## API Details

**OpenRouteService**
- **Endpoint:** `https://api.openrouteservice.org/v2/directions/foot-walking`
- **Auth:** Requires `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY` in `.env.local`
- **Response:** Walking routes with distance and duration for accurate running times
- **Cost:** Free tier available
- **Note:** Get API key at https://openrouteservice.org/dev/#/login

---

## Files Structure

```
components/
  ├── ui/
  │   └── map.tsx                 # Map foundation component
  ├── event-route-viewer.tsx      # Main route viewer modal
  └── admin-event-route-button.tsx # Admin preview button

app/
  ├── admin/
  │   └── events/
  │       └── page.tsx            # Admin event editor (with end location fields)
  └── (public)/
      └── event-calendar/
          └── page.tsx            # Event calendar (with Route button)
```

---

## Quick Reference

**For Admins:**
- Set event details + start coordinates
- Set end location name + end coordinates
- Click "View Route" to preview
- Save event

**For Users:**
- Browse events on `/event-calendar`
- Click event to see details
- Click "Route" to see planned path
- Click "Uber" or "Yango" to book ride

---

## Next Steps (Optional)

Consider adding:
- User's current location as auto-detected start point
- Route preference filters (fastest vs shortest)
- Elevation profile visualization
- Turn-by-turn navigation
- Route sharing via URL
- Offline route caching
