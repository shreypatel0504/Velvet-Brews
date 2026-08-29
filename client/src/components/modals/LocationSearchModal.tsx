import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  X,
  Navigation,
  Sparkles,
  Home,
  Briefcase,
  ArrowRight,
  Loader2,
  Map as MapIcon,
  Compass,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { POPULAR_LOCATIONS } from "@/data/locations";
import {
  searchPlacesApi,
  reverseGeocodeApi,
  getSavedAddressesFromStorage,
  saveAddressToStorage,
  type GeocodedAddress,
  type SavedAddressItem,
  CAFE_LOCATION
} from "@/services/locationService";
import { LocationMapPicker } from "@/components/modals/LocationMapPicker";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface LocationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalViewMode = "search" | "map" | "details";

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<ModalViewMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Live API Autocomplete results
  const [apiLocations, setApiLocations] = useState<GeocodedAddress[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);

  // Map Coordinates for Map Picker
  const [selectedLat, setSelectedLat] = useState<number>(CAFE_LOCATION.lat);
  const [selectedLng, setSelectedLng] = useState<number>(CAFE_LOCATION.lng);
  const [activeGeoAddress, setActiveGeoAddress] = useState<GeocodedAddress | null>(null);

  // Doorstep Form Details (Swiggy / Zomato Step 2)
  const [flatNo, setFlatNo] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [addressTag, setAddressTag] = useState<"home" | "work" | "other">("home");

  // Saved Addresses from localStorage
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>([]);

  const { setDeliveryAddress, setOrderType, deliveryAddress } = useCartStore();

  const popularTags = [
    "All",
    "Vesu",
    "VIP Road",
    "City Light",
    "Piplod",
    "Adajan",
    "Athwa",
    "Althan",
    "Bhatar",
    "Mumbai",
    "Delhi",
  ];

  // Load saved addresses from localStorage on mount/open
  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(getSavedAddressesFromStorage());
    }
  }, [isOpen]);

  // Debounced API Search (OpenStreetMap Nominatim API)
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setApiLocations([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const timer = setTimeout(async () => {
      const results = await searchPlacesApi(trimmed);
      setApiLocations(results);
      setIsSearchingApi(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // Handle GPS Current Location Button Click
  const handleDetectGpsLocation = () => {
    setIsLocatingGps(true);
    toast.loading("Scanning satellite GPS coordinates...", { id: "gps-loader" });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const geoData = await reverseGeocodeApi(lat, lng);
          toast.dismiss("gps-loader");
          setIsLocatingGps(false);

          if (geoData) {
            setSelectedLat(lat);
            setSelectedLng(lng);
            setActiveGeoAddress(geoData);
            setBuildingName(geoData.road || geoData.area);
            setViewMode("details");
            toast.success(`📡 GPS Locked: ${geoData.road}, ${geoData.area}`, { icon: "✨" });
          } else {
            const fallbackAddr = `Vesu Canal Road, Surat`;
            setDeliveryAddress(fallbackAddr);
            setOrderType("delivery");
            toast.success("📡 Location set to Vesu, Surat!");
            onClose();
          }
        },
        (error) => {
          setIsLocatingGps(false);
          toast.dismiss("gps-loader");
          console.warn("GPS error", error);
          // Fallback to Map View
          setViewMode("map");
          toast("Please pin your exact location on the map", { icon: "📍" });
        },
        { timeout: 8000 }
      );
    } else {
      setIsLocatingGps(false);
      toast.dismiss("gps-loader");
      setViewMode("map");
    }
  };

  // When user selects a place from search list or saved list
  const handleSelectSearchResult = (geo: GeocodedAddress) => {
    setSelectedLat(geo.lat);
    setSelectedLng(geo.lng);
    setActiveGeoAddress(geo);
    setBuildingName(geo.road || geo.area);
    setViewMode("details");
  };

  const handleSelectSavedAddress = (saved: SavedAddressItem) => {
    setDeliveryAddress(saved.fullAddress);
    setOrderType("delivery");
    toast.success(`🚚 Locked: ${saved.title} (${saved.area})`, {
      icon: saved.type === "home" ? "🏠" : saved.type === "work" ? "💼" : "📍",
      duration: 3000,
    });
    onClose();
  };

  // When map location is confirmed
  const handleMapLocationConfirmed = (geo: GeocodedAddress) => {
    setActiveGeoAddress(geo);
    setBuildingName(geo.road || geo.area);
    setViewMode("details");
  };

  // Submit final doorstep address details (Swiggy / Zomato Final Step)
  const handleSaveDoorstepDetails = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeGeoAddress) {
      if (buildingName.trim()) {
        const customAddr = `${buildingName.trim()}, Surat`;
        setDeliveryAddress(customAddr);
        setOrderType("delivery");
        toast.success(`📍 Delivery address set: ${customAddr}`);
        onClose();
      }
      return;
    }

    const flatPart = flatNo.trim() ? `Flat/House ${flatNo.trim()}, ` : "";
    const bldgPart = buildingName.trim() ? `${buildingName.trim()}, ` : "";
    const landmarkPart = landmark.trim() ? `Near ${landmark.trim()}, ` : "";

    const fullDoorstepAddress = `${flatPart}${bldgPart}${landmarkPart}${activeGeoAddress.area}, ${activeGeoAddress.city} (${activeGeoAddress.zipCode})`;

    // Save into localStorage for future quick access
    saveAddressToStorage({
      type: addressTag,
      title: addressTag === "home" ? "Home" : addressTag === "work" ? "Work" : "Other",
      flatNo: flatNo.trim(),
      building: buildingName.trim(),
      landmark: landmark.trim(),
      fullAddress: fullDoorstepAddress,
      area: activeGeoAddress.area,
      lat: activeGeoAddress.lat,
      lng: activeGeoAddress.lng,
    });

    setDeliveryAddress(fullDoorstepAddress);
    setOrderType("delivery");

    toast.success(`🛵 Doorstep Location Saved! Delivering in ${activeGeoAddress.estimatedTime}`, {
      duration: 4000,
      icon: "✨",
    });

    onClose();
  };

  // Filter local static fallback locations
  const localFiltered = POPULAR_LOCATIONS.filter((loc) => {
    const matchesTag =
      !selectedTag || selectedTag === "All" || loc.area.toLowerCase().includes(selectedTag.toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      loc.name.toLowerCase().includes(query) ||
      loc.area.toLowerCase().includes(query) ||
      loc.city.toLowerCase().includes(query);
    return matchesTag && matchesQuery;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-0"
          />

          {/* Swiggy/Zomato Modern Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 25 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden z-20 border border-amber-900/10 flex flex-col max-h-[92vh]"
          >
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-[#1e130b] to-amber-900 text-white flex items-center justify-between border-b border-amber-700/20 shadow-md">
              <div className="flex items-center gap-3">
                {viewMode !== "search" && (
                  <button
                    onClick={() => setViewMode("search")}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer mr-1"
                    title="Back to search"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-400/30 shrink-0">
                  <MapPin className="h-5 w-5 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    {viewMode === "details"
                      ? "Complete Doorstep Details"
                      : viewMode === "map"
                      ? "Pin Location on Map"
                      : "Select Delivery Location"}
                    <span className="text-[9px] bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider hidden sm:inline-block">
                      Swiggy / Zomato Live API
                    </span>
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    {viewMode === "details"
                      ? "Enter flat/house no. & landmark for rider"
                      : viewMode === "map"
                      ? "Drag marker to exact building gate"
                      : "Live GPS, OpenStreetMap API search or saved addresses"}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-amber-200/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs (Search vs Interactive Map) */}
            {viewMode !== "details" && (
              <div className="flex border-b border-gray-100 bg-amber-50/50 p-1.5 gap-1">
                <button
                  onClick={() => setViewMode("search")}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === "search"
                      ? "bg-white text-amber-950 shadow-sm border border-amber-900/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search & Saved</span>
                </button>

                <button
                  onClick={() => setViewMode("map")}
                  className={`flex-1 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    viewMode === "map"
                      ? "bg-white text-amber-950 shadow-sm border border-amber-900/10"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <MapIcon className="h-3.5 w-3.5 text-amber-600" />
                  <span>Interactive Map Pin</span>
                </button>
              </div>
            )}

            {/* VIEW MODE 1: SEARCH & SAVED ADDRESSES */}
            {viewMode === "search" && (
              <div className="p-4 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                {/* Search Box */}
                <div className="relative group">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-5 w-5 text-amber-700 group-focus-within:text-[var(--color-cafe-primary)] transition-colors" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search building, street, area, landmark in Surat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border-2 border-amber-900/10 bg-amber-50/40 py-3.5 pl-11 pr-10 text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:border-[var(--color-cafe-primary)] focus:bg-white focus:outline-none transition-all shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-black cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* GPS Location Button */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDetectGpsLocation}
                  disabled={isLocatingGps}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-orange-500/10 border border-amber-400/40 text-amber-950 hover:bg-amber-100/80 transition-all cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--color-cafe-primary)] text-white rounded-xl group-hover:scale-110 transition-transform shadow-xs">
                      <Navigation className={`h-5 w-5 ${isLocatingGps ? "animate-spin" : ""}`} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        Use Current Location (GPS)
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                          Live Satellite
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 font-medium">Detect precise doorstep coordinates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-xs text-[var(--color-cafe-primary)] bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                    <span>{isLocatingGps ? "Locating..." : "Detect GPS"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </motion.button>

                {/* Saved Addresses Section */}
                {!searchQuery && savedAddresses.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Saved Addresses
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {savedAddresses.map((saved) => (
                        <motion.button
                          key={saved.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSelectSavedAddress(saved)}
                          className="flex flex-col text-left p-3 rounded-2xl border border-gray-200/80 bg-white hover:border-[var(--color-cafe-primary)] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1 text-[var(--color-cafe-primary)] font-bold text-xs">
                            <span className="flex items-center gap-1">
                              {saved.type === "home" ? (
                                <Home className="h-3.5 w-3.5 text-amber-600" />
                              ) : saved.type === "work" ? (
                                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                              ) : (
                                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                              <span>{saved.title}</span>
                            </span>
                            <span className="text-[9px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-extrabold">
                              SAVED
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-gray-800 line-clamp-1">
                            {saved.flatNo || saved.building || saved.fullAddress.split(",")[0]}
                          </p>
                          <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 font-medium">
                            {saved.fullAddress}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Area Chips */}
                {!searchQuery && (
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Popular Localities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            selectedTag === tag || (tag === "All" && !selectedTag)
                              ? "bg-[var(--color-cafe-primary)] text-white shadow-xs scale-105"
                              : "bg-gray-100 text-gray-600 hover:bg-amber-100/60 border border-gray-200/60"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* API Search Suggestions List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      {searchQuery
                        ? `Real-World API Results (${apiLocations.length})`
                        : "Nearby Delivery Hubs"}
                      {isSearchingApi && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-cafe-primary)]" />
                      )}
                    </span>
                    {deliveryAddress && (
                      <span className="text-[11px] text-[var(--color-cafe-primary)] font-bold truncate max-w-[180px]">
                        ✓ Current: {deliveryAddress.split(",")[0]}
                      </span>
                    )}
                  </div>

                  {/* Real-time API Results */}
                  {apiLocations.length > 0 ? (
                    <div className="space-y-2.5">
                      {apiLocations.map((geo, idx) => (
                        <motion.div
                          key={`api-${idx}-${geo.lat}`}
                          whileHover={{ scale: 1.01, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectSearchResult(geo)}
                          className="p-3.5 rounded-2xl border border-gray-100 bg-white hover:border-amber-400 hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="p-2.5 rounded-xl shrink-0 mt-0.5 bg-amber-100/70 text-amber-900">
                              <Compass className="h-4 w-4 text-[var(--color-cafe-primary)]" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-[var(--color-cafe-text-primary)] truncate">
                                {geo.road}, {geo.area}
                              </h4>
                              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                                {geo.formattedAddress}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                              📍 {geo.distanceKm} km
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                              ⏱️ {geo.estimatedTime}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    // Local static suggestions when API query is empty or loading
                    <div className="space-y-2.5">
                      {localFiltered.slice(0, 8).map((loc) => {
                        const isSelected = deliveryAddress && deliveryAddress.includes(loc.name);
                        return (
                          <motion.div
                            key={loc.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedLat(21.1458 + Math.random() * 0.02);
                              setSelectedLng(72.7744 + Math.random() * 0.02);
                              setActiveGeoAddress({
                                display_name: `${loc.name}, ${loc.city}`,
                                road: loc.name,
                                area: loc.area,
                                cityDistrict: loc.city,
                                zipCode: loc.zipCode,
                                formattedAddress: `${loc.name}, ${loc.area}, ${loc.city}`,
                                lat: 21.1458,
                                lng: 72.7744,
                                distanceKm: parseFloat(loc.distance || "1.5"),
                                estimatedTime: loc.estimatedTime,
                                deliveryFee: 0,
                                isDeliverable: true,
                              });
                              setBuildingName(loc.name);
                              setViewMode("details");
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-amber-50/80 border-[var(--color-cafe-primary)] shadow-sm"
                                : "bg-white border-gray-100 hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                  isSelected
                                    ? "bg-[var(--color-cafe-primary)] text-white shadow-xs"
                                    : "bg-amber-100/60 text-amber-900"
                                }`}
                              >
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-extrabold text-[var(--color-cafe-text-primary)] truncate">
                                  {loc.name}
                                </h4>
                                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                                  {loc.area}, {loc.city} • PIN {loc.zipCode}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {loc.distance && (
                                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                  📍 {loc.distance}
                                </span>
                              )}
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100">
                                ⏱️ {loc.estimatedTime}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW MODE 2: INTERACTIVE MAP PICKER */}
            {viewMode === "map" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <LocationMapPicker
                  initialLat={selectedLat}
                  initialLng={selectedLng}
                  onLocationConfirmed={handleMapLocationConfirmed}
                />
              </div>
            )}

            {/* VIEW MODE 3: DOORSTEP DETAILS FORM (Swiggy / Zomato Step 2) */}
            {viewMode === "details" && (
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                {/* Active Selected Location Banner */}
                {activeGeoAddress && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3">
                    <div className="p-2 bg-[var(--color-cafe-primary)] text-white rounded-xl shrink-0 mt-0.5">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900">
                        {activeGeoAddress.road}, {activeGeoAddress.area}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5 font-medium">
                        {activeGeoAddress.formattedAddress}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-bold text-amber-900">
                        <span>⏱️ Delivery: {activeGeoAddress.estimatedTime}</span>
                        <span>📍 Distance: {activeGeoAddress.distanceKm} km</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSaveDoorstepDetails} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      House / Flat / Floor / Office No. *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, 4th Floor"
                      value={flatNo}
                      onChange={(e) => setFlatNo(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold focus:border-[var(--color-cafe-primary)] focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Apartment / Building / Society Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Green Avenue Towers"
                      value={buildingName}
                      onChange={(e) => setBuildingName(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold focus:border-[var(--color-cafe-primary)] focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opp. Shoppers Plaza, Near Water Tank"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm font-semibold focus:border-[var(--color-cafe-primary)] focus:outline-none bg-gray-50/50"
                    />
                  </div>

                  {/* Save As Tag Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Save Location As
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setAddressTag("home")}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          addressTag === "home"
                            ? "bg-amber-950 text-white border-amber-950 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddressTag("work")}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          addressTag === "work"
                            ? "bg-amber-950 text-white border-amber-950 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Work</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddressTag("other")}
                        className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          addressTag === "other"
                            ? "bg-amber-950 text-white border-amber-950 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Other</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-800 to-amber-950 text-white font-extrabold text-sm shadow-xl hover:from-amber-900 hover:to-black transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Save Address & Proceed to Order</span>
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
