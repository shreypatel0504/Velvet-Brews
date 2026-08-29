import { getApiHost } from './socket';

export const getApiUrl = (endpoint: string) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return `http://${getApiHost()}:5000${cleanEndpoint}`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    // When running inside Android Capacitor webview (https://localhost)
    if (window.location.protocol === 'https:' && !window.location.port) {
      return `http://${getApiHost()}:5000${cleanEndpoint}`;
    }
  }
  return cleanEndpoint;
};
