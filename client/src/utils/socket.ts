import { io } from 'socket.io-client';

export const getApiHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const getSocketURL = () => {
  if (typeof window !== 'undefined') {
    if (import.meta.env.VITE_SOCKET_URL) {
      return import.meta.env.VITE_SOCKET_URL;
    }
    // If running in development on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:5000`;
    }
    // Live Render backend
    return 'https://velvet-brews.onrender.com';
  }
  return 'https://velvet-brews.onrender.com';
};

export const socket = io(getSocketURL(), {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  timeout: 10000
});

