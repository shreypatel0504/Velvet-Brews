import { io } from 'socket.io-client';

export const getApiHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.hostname;
  }
  return '192.168.29.33';
};

export const getApiBaseURL = () => {
  return `http://${getApiHost()}:5000`;
};

export const socket = io(getApiBaseURL(), {
  autoConnect: true,
  transports: ['websocket', 'polling']
});
