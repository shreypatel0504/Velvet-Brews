import { FALLBACK_MENU } from '@/data/fallbackMenu';
import type { MenuItem } from '@/types';

const MENU_CACHE_KEY = 'velvet_menu_cache';

/**
 * Reads menu items synchronously from localStorage cache with instant fallback.
 * Guarantees 0ms initial load time for customer and admin pages.
 */
export const getCachedMenu = (): MenuItem[] => {
  try {
    const cached = localStorage.getItem(MENU_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.debug('Menu cache read error:', e);
  }
  return FALLBACK_MENU;
};

/**
 * Saves fresh menu items to localStorage for instant subsequent loads.
 */
export const setCachedMenu = (items: MenuItem[]) => {
  try {
    if (Array.isArray(items) && items.length > 0) {
      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.debug('Menu cache write error:', e);
  }
};

let inFlightPrefetch: Promise<MenuItem[]> | null = null;

/**
 * Prefetches or revalidates menu data in the background.
 * Uses AbortController with a 6-second timeout to prevent stalling on cold starts.
 */
export const prefetchMenu = async (): Promise<MenuItem[]> => {
  if (inFlightPrefetch) return inFlightPrefetch;

  inFlightPrefetch = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch('/api/menu', { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCachedMenu(data);
        return data;
      }
    } catch (err: any) {
      console.debug('Menu background sync:', err?.message || err);
    } finally {
      clearTimeout(timer);
      inFlightPrefetch = null;
    }
    return getCachedMenu();
  })();

  return inFlightPrefetch;
};
