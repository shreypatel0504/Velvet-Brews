import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Navigation, MapPin, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { reverseGeocodeApi, CAFE_LOCATION, type GeocodedAddress } from "@/services/locationService";

interface LocationMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationConfirmed: (location: GeocodedAddress) => void;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  initialLat = CAFE_LOCATION.lat,
  initialLng = CAFE_LOCATION.lng,
  onLocationConfirmed,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [addressDetails, setAddressDetails] = useState<GeocodedAddress | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(false);
  const [isLocatingGps, setIsLocatingGps] = useState<boolean>(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Custom Swiggy/Zomato Style Pin Icon
    const pinIcon = L.divIcon({
      className: "custom-map-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-12 h-12 bg-amber-500/30 rounded-full animate-ping"></div>
          <div class="absolute w-8 h-8 bg-amber-600/40 rounded-full"></div>
          <div class="relative z-10 p-2 bg-gradient-to-br from-amber-700 to-amber-950 text-amber-200 rounded-full shadow-2xl border-2 border-white scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    // Cafe Base Location Marker (Velvet Brews Outlet)
    const cafeIcon = L.divIcon({
      className: "cafe-store-pin",
      html: `
        <div class="flex items-center gap-1.5 bg-amber-950 text-amber-100 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-lg border border-amber-400">
          ☕ Velvet Brews (Store)
        </div>
      `,
      iconSize: [120, 24],
      iconAnchor: [60, 12],
    });
    L.marker([CAFE_LOCATION.lat, CAFE_LOCATION.lng], { icon: cafeIcon }).addTo(map);

    // Draggable Delivery Pin Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Fetch initial reverse geocode
    handleUpdateCoords(initialLat, initialLng);

    // Event: Marker Drag End
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      handleUpdateCoords(pos.lat, pos.lng);
    });

    // Event: Map Click (Move pin to clicked position)
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      handleUpdateCoords(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan map when external initialLat/initialLng changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([initialLat, initialLng], 16, { animate: true });
      markerRef.current.setLatLng([initialLat, initialLng]);
      handleUpdateCoords(initialLat, initialLng);
    }
  }, [initialLat, initialLng]);

  // Reverse geocode API call trigger
  const handleUpdateCoords = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    const data = await reverseGeocodeApi(lat, lng);
    setIsLoadingAddress(false);
    if (data) {
      setAddressDetails(data);
    }
  };

  // High Accuracy Browser GPS Trigger
  const handleDetectGps = () => {
    if (!("geolocation" in navigator)) return;
    setIsLocatingGps(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setIsLocatingGps(false);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 17, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
          handleUpdateCoords(lat, lng);
        }
      },
      (err) => {
        console.warn("GPS detection error", err);
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Map Header Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-amber-950/90 text-amber-100 border-b border-amber-800/40 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Move marker or click map to set delivery pin
        </span>
        <button
          onClick={handleDetectGps}
          disabled={isLocatingGps}
          className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          <Navigation className={`h-3.5 w-3.5 ${isLocatingGps ? "animate-spin" : ""}`} />
          <span>{isLocatingGps ? "Scanning..." : "Current Location"}</span>
        </button>
      </div>

      {/* Interactive Map Box */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-gray-100 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Badge */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-amber-900/10 text-[11px] font-extrabold text-amber-950 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[var(--color-cafe-primary)]" />
          <span>Drag pin to exact door / gate</span>
        </div>
      </div>

      {/* Address Confirmation Drawer Bar */}
      <div className="p-4 bg-white border-t border-gray-100 shadow-xl space-y-3">
        {isLoadingAddress ? (
          <div className="flex items-center justify-center py-4 gap-2 text-amber-900 text-sm font-semibold">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-cafe-primary)]" />
            <span>Fetching live satellite location details...</span>
          </div>
        ) : addressDetails ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl shrink-0 mt-0.5 shadow-2xs">
                  <MapPin className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1">
                    {addressDetails.road}, {addressDetails.area}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-0.5">
                    {addressDetails.formattedAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Distance & Delivery Time Meta Badges */}
            <div className="flex items-center justify-between p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">
                  📍 {addressDetails.distanceKm} km away
                </span>
                <span className="font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  ⏱️ {addressDetails.estimatedTime}
                </span>
              </div>
              <span className={`font-bold px-2.5 py-0.5 rounded-md ${addressDetails.deliveryFee === 0 ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-950'}`}>
                {addressDetails.deliveryFee === 0 ? 'FREE Delivery' : `₹${addressDetails.deliveryFee} Fee`}
              </span>
            </div>

            {!addressDetails.isDeliverable && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Selected location is beyond our 18km delivery range. Please pick a closer location.</span>
              </div>
            )}

            {/* Confirm Pin Button */}
            <button
              onClick={() => onLocationConfirmed(addressDetails)}
              disabled={!addressDetails.isDeliverable}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                addressDetails.isDeliverable
                  ? "bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-black text-white hover:scale-[1.01]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>Confirm Location & Proceed →</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-gray-500 font-medium">
            Select a point on the map to view location details.
          </div>
        )}
      </div>
    </div>
  );
};
