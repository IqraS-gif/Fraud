"use client"

import { useState, useEffect, useMemo } from "react"
import { GoogleMap, useLoadScript, HeatmapLayerF, MarkerF, InfoWindowF } from "@react-google-maps/api"
import { Card } from "@/components/ui/card"
import { Activity } from "lucide-react"

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
}

const center = {
  lat: 22.5937, // Center of India Approx
  lng: 78.9629,
}

// Dark Mode Map Style
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
    { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
  ],
}

interface PinData {
  location: google.maps.LatLngLiteral
  title: string
  description: string
  severity: number
  common_fraud_type?: string
}

interface IndiaMapProps {
  heatmapData: any[]
  pins: PinData[]
}

export const IndiaMap = ({ heatmapData, pins }: IndiaMapProps) => {
  // Viewport State
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)
  const [zoomLevel, setZoomLevel] = useState(5)
  const [visiblePins, setVisiblePins] = useState<PinData[]>([])

  const [activePin, setActivePin] = useState<PinData | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["visualization"],
  })

  // Sync visible pins with external pins when they load
  useEffect(() => {
    setVisiblePins(pins)
  }, [pins])

  // Map Event Handlers
  const onMapLoad = (map: google.maps.Map) => {
    setMapRef(map)
  }

  const handleCameraChange = () => {
    if (!mapRef) return

    // Update Zoom
    const newZoom = mapRef.getZoom() || 5
    setZoomLevel(newZoom)

    // Update Visible Stats
    const bounds = mapRef.getBounds()
    if (bounds) {
      const filtered = pins.filter(pin =>
        bounds.contains(new google.maps.LatLng(pin.location.lat, pin.location.lng))
      )
      setVisiblePins(filtered)
    }
  }

  // Heatmap Configuration (Memoized)
  const heatmapOptions = useMemo(() => ({
    radius: zoomLevel > 6 ? 50 : 30, // Slightly larger radius for the red glow
    opacity: zoomLevel < 6 ? 0 : 0.6, // Hide Heatmap completely when zoomed out
    gradient: [
      "rgba(255, 0, 0, 0)",     // Transparent
      "rgba(255, 0, 0, 0.2)",   // Very faint red
      "rgba(255, 69, 0, 0.5)",  // Orange Red
      "rgba(255, 0, 0, 0.8)",   // Red
      "rgba(139, 0, 0, 1)"      // Dark Red (Center)
    ]
  }), [zoomLevel])

  // Dynamic Calculated Stats (Based on Visible Viewport)
  const visibleRiskScore = useMemo(() => {
    return visiblePins.reduce((acc, curr) => acc + curr.severity, 0)
  }, [visiblePins])

  const maxSeverity = useMemo(() => {
    return Math.max(...pins.map(p => p.severity), 100)
  }, [pins])

  if (!isLoaded) return <div className="text-white text-center p-10">Loading Maps API...</div>

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={center}
        options={mapOptions}
        onLoad={onMapLoad}
        onBoundsChanged={handleCameraChange} // Triggers filtering
        onClick={() => setActivePin(null)}
      >
        {/* Heatmap Layer - Only visible on high zoom */}
        {heatmapData.length > 0 && zoomLevel >= 6 && (
          <HeatmapLayerF
            data={heatmapData}
            options={heatmapOptions}
          />
        )}

        {/* Markers Logic */}
        {visiblePins.map((pin, index) => (
          <MarkerF
            key={index}
            position={pin.location}
            onClick={() => setActivePin(pin)}
            // Simple Pin Emoji as requested
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="30">📍</text></svg>'),
              scaledSize: new google.maps.Size(40, 40)
            }}
          />
        ))}

        {/* Info Window */}
        {activePin && (
          <InfoWindowF
            position={activePin.location}
            onCloseClick={() => setActivePin(null)}
            options={{ pixelOffset: new google.maps.Size(0, zoomLevel < 6 ? -30 : -10) }}
          >
            <div className="p-2 text-slate-900 min-w-[200px]">
              <h3 className="font-bold text-base border-b border-slate-200 pb-1 mb-1">{activePin.title}</h3>
              <div className="flex flex-col gap-1 mb-2">
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200 w-fit">
                  SEVERITY: {activePin.severity}
                </span>
                {activePin.common_fraud_type && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 w-fit">
                    MOST COMMON: {activePin.common_fraud_type.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-tight">
                {activePin.description}
              </p>
            </div>
          </InfoWindowF>
        )}

      </GoogleMap>

      {/* Floating Info Panel - Viewport Aware Stats */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <h3 className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-md">Global Threat Map</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs text-red-500 font-mono font-bold drop-shadow-md">LIVE FRAUD FEED</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6">
        <Card className="bg-slate-900/90 backdrop-blur border-slate-700 p-4 w-72 shadow-2xl transition-all duration-300">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Visible Risk Score</span>
                <Activity className="h-3 w-3 text-red-500" />
              </div>
              <div className="text-2xl font-mono text-white font-bold leading-none" key={visibleRiskScore}>
                {visibleRiskScore.toLocaleString()}
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Active Zones in View</span>
                <span className="font-mono text-red-400 font-bold">{visiblePins.length}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min((visiblePins.length / 10) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 uppercase pt-1">
                <span>{zoomLevel < 6 ? "National View" : "Regional View"}</span>
                <span>{visiblePins.length > 5 ? "Critical" : "Stable"}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
