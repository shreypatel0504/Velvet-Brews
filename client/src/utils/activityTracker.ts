import { socket } from './socket';
import { sharedSync } from './sharedSync';

export const trackWebsiteActivity = async (type: string, user: string, details: string, location: string = 'Surat, Gujarat') => {
  const activityPayload = {
    id: 'ACT' + Math.floor(1000 + Math.random() * 9000),
    type,
    user: user || 'Website Visitor',
    location,
    details,
    timestamp: new Date().toISOString()
  };

  // 1. Local storage & cross-tab sync
  sharedSync.saveActivity(activityPayload);

  // 2. Emit socket
  try {
    socket.connect();
    socket.emit('user-activity', activityPayload);
  } catch {
    // Socket silent catch
  }

  // 3. Server API endpoint
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityPayload)
    });
  } catch {
    // API silent catch
  }
};
