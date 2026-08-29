import { getApiHost } from './socket';

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // If backend URL is provided via environment variable
  const backendBase = import.meta.env.VITE_API_URL;
  if (backendBase) {
    const cleanBase = backendBase.endsWith('/') ? backendBase.slice(0, -1) : backendBase;
    return `${cleanBase}${cleanEndpoint}`;
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `http://localhost:5000${cleanEndpoint}`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (window.location.protocol === 'https:' && !window.location.port) {
      return `http://localhost:5000${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
};
