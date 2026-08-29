// Service for Swiggy/Zomato style location API calls & distance calculations

export interface GeocodedAddress {
  display_name: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  state?: string;
  postcode?: string;
  country?: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  area: string;
  cityDistrict: string;
  zipCode: string;
  distanceKm: number;
  estimatedTime: string;
  deliveryFee: number;
  isDeliverable: boolean;
}

export interface SavedAddressItem {
  id: string;
  type: "home" | "work" | "other";
  title: string;
  flatNo?: string;
  building?: string;
  landmark?: string;
  fullAddress: string;
  area: string;
  lat?: number;
  lng?: number;
}

// Cafe Store Base Location: Vesu, Surat (Latitude: 21.1458, Longitude: 72.7744)
export const CAFE_LOCATION = {
  lat: 21.1458,
  lng: 72.7744,
  name: "Velvet Brews Cafe",
  address: "Vesu Main Road, Near Shoppers Plaza, Surat, Gujarat 395007",
  maxDeliveryRadiusKm: 18, // Max delivery limit
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Compute Delivery Fee and Time Estimate based on distance
 */
export function getDeliveryEstimate(distanceKm: number) {
  if (distanceKm > CAFE_LOCATION.maxDeliveryRadiusKm) {
    return {
      estimatedTime: "Unserviceable",
      deliveryFee: 0,
      isDeliverable: false,
      statusText: "Out of Delivery Range (>18km)",
    };
  }

  // Base time 15-20 mins + ~3-4 mins per km
  const minTime = Math.max(15, Math.round(15 + distanceKm * 2.5));
  const maxTime = minTime + 7;
  const estimatedTime = `${minTime}-${maxTime} mins`;

  let deliveryFee = 0;
  if (distanceKm <= 2.5) {
    deliveryFee = 0; // Free delivery nearby
  } else if (distanceKm <= 6) {
    deliveryFee = 25;
  } else if (distanceKm <= 12) {
    deliveryFee = 45;
  } else {
    deliveryFee = 65;
  }

  return {
    estimatedTime,
    deliveryFee,
    isDeliverable: true,
    statusText: deliveryFee === 0 ? "FREE Delivery" : `₹${deliveryFee} Delivery Fee`,
  };
}

/**
 * API Call: Search places using OpenStreetMap Nominatim API (India scoped)
 */
export async function searchPlacesApi(query: string): Promise<GeocodedAddress[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // Scoped to Surat / Gujarat / India if no city specified
  const queryParam =
    trimmed.toLowerCase().includes("surat") ||
    trimmed.toLowerCase().includes("mumbai") ||
    trimmed.toLowerCase().includes("delhi") ||
    trimmed.toLowerCase().includes("ahmedabad")
      ? trimmed
      : `${trimmed}, Surat`;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    queryParam
  )}&addressdetails=1&countrycodes=in&limit=8`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "VelvetBrewsCafeWeb/1.0",
      },
    });

    if (!response.ok) return [];
    const data = await response.json();

    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);
      const addr = item.address || {};

      const road = addr.road || addr.pedestrian || addr.suburb || item.name || trimmed;
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || "Vesu";
      const city = addr.city || addr.town || addr.state_district || "Surat";
      const zipCode = addr.postcode || "395007";

      const distanceKm = calculateHaversineDistance(
        CAFE_LOCATION.lat,
        CAFE_LOCATION.lng,
        lat,
        lng
      );
      const estimate = getDeliveryEstimate(distanceKm);

      const formattedAddress = item.display_name;

      return {
        display_name: item.display_name,
        road,
        suburb,
        neighbourhood: addr.neighbourhood,
        city,
        state: addr.state,
        postcode: zipCode,
        country: addr.country,
        lat,
        lng,
        formattedAddress,
        area: suburb,
        cityDistrict: city,
        zipCode,
        distanceKm,
        estimatedTime: estimate.estimatedTime,
        deliveryFee: estimate.deliveryFee,
        isDeliverable: estimate.isDeliverable,
      };
    });
  } catch (error) {
    console.error("Location search API error:", error);
    return [];
  }
}

/**
 * API Call: Reverse Geocoding coordinates (lat, lng) to address using Nominatim API
 */
export async function reverseGeocodeApi(
  lat: number,
  lng: number
): Promise<GeocodedAddress | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "VelvetBrewsCafeWeb/1.0",
      },
    });

    if (!response.ok) return null;
    const data = await response.json();

    const addr = data.address || {};
    const road =
      addr.road ||
      addr.pedestrian ||
      addr.suburb ||
      addr.neighbourhood ||
      "Vesu Canal Road";
    const suburb =
      addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || "Vesu";
    const city = addr.city || addr.town || addr.state_district || "Surat";
    const zipCode = addr.postcode || "395007";

    const distanceKm = calculateHaversineDistance(
      CAFE_LOCATION.lat,
      CAFE_LOCATION.lng,
      lat,
      lng
    );
    const estimate = getDeliveryEstimate(distanceKm);

    // Formatted nice short doorstep address
    const formattedAddress = `${road}, ${suburb}, ${city}`;

    return {
      display_name: data.display_name || formattedAddress,
      road,
      suburb,
      neighbourhood: addr.neighbourhood,
      city,
      state: addr.state,
      postcode: zipCode,
      country: addr.country,
      lat,
      lng,
      formattedAddress,
      area: suburb,
      cityDistrict: city,
      zipCode,
      distanceKm,
      estimatedTime: estimate.estimatedTime,
      deliveryFee: estimate.deliveryFee,
      isDeliverable: estimate.isDeliverable,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * LocalStorage Helpers for Saved Addresses
 */
const STORAGE_KEY = "velvet_brews_saved_addresses";

export function getSavedAddressesFromStorage(): SavedAddressItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to read saved addresses", e);
  }

  // Default fallback addresses
  return [
    {
      id: "saved-1",
      type: "home",
      title: "Home",
      flatNo: "402, Green Avenue",
      building: "Green Avenue",
      landmark: "Near Vesu Canal",
      fullAddress: "Flat 402, Green Avenue, Vesu Canal Road, Surat",
      area: "Vesu",
      lat: 21.149,
      lng: 72.771,
    },
    {
      id: "saved-2",
      type: "work",
      title: "Work",
      flatNo: "Office 708",
      building: "Silicon Shoppers",
      landmark: "Opp. VR Mall",
      fullAddress: "Office 708, Silicon Shoppers, VIP Road, Vesu, Surat",
      area: "VIP Road",
      lat: 21.142,
      lng: 72.782,
    },
    {
      id: "saved-3",
      type: "other",
      title: "Gym / Science Centre",
      flatNo: "Villa 12",
      building: "Sunset Complex",
      landmark: "Science Centre Gate",
      fullAddress: "12 Sunset Villas, City Light Road, Surat",
      area: "City Light",
      lat: 21.168,
      lng: 72.789,
    },
  ];
}

export function saveAddressToStorage(address: Omit<SavedAddressItem, "id">): SavedAddressItem[] {
  const current = getSavedAddressesFromStorage();
  const newAddressItem: SavedAddressItem = {
    ...address,
    id: `saved-${Date.now()}`,
  };
  const updated = [newAddressItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save address", e);
  }
  return updated;
}
