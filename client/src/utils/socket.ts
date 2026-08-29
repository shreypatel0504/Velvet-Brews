import { io } from 'socket.io-client';

export const getApiHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const getSocketURL = () => {
  return `http://${getApiHost()}:5000`;
};

export const socket = io(getSocketURL(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

