import { useEffect } from 'react';
import { socket } from '@/utils/socket';

export const useSocket = (event?: string, callback?: (...args: any[]) => void) => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (event && callback) {
      socket.on(event, callback);
    }

    return () => {
      if (event && callback) {
        socket.off(event, callback);
      }
    };
  }, [event, callback]);

  return socket;
};
