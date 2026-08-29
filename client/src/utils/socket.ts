import { io } from 'socket.io-client';

export const getApiHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const getSocketURL = () => {
  if (typeof window !== 'undefined') {
    // If running in development on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return `http://${window.location.hostname}:5000`;
    }
    // If running over HTTPS in production
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.host}`;
  }
  return 'http://localhost:5000';
};

export const socket = io(getSocketURL(), {
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  timeout: 10000
});

