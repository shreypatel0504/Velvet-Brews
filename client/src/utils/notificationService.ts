// Web Audio API Synthesizer Notification Chime
export const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Uplifting Velvet Cafe chime C5 -> E5 -> G5 -> C6
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
    osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.24);
    osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.36);

    osc2.frequency.setValueAtTime(261.63, now);
    osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(392.00, now + 0.24);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);
  } catch (e) {
    console.debug('Audio chime play prevented by browser policy', e);
  }
};

// Mobile phone vibration
export const triggerDeviceVibration = (pattern: number[] = [150, 75, 200, 75, 250]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
};

// Check if browser notifications are supported
export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

// Request Notification Permission from User
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
};

export interface DeviceNotificationPayload {
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  discountPercent?: number;
  imageUrl?: string;
  actionUrl?: string;
  badge?: string;
}

// Show OS/Browser-level Notification
export const showDeviceNotification = async (
  payload: DeviceNotificationPayload,
  onNotificationClick?: (url: string, code?: string) => void
) => {
  playNotificationChime();
  triggerDeviceVibration();

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  const notificationTitle = payload.title || '🎉 Velvet Brews Cafe Offer!';
  const notificationBody = `${payload.subtitle || 'Special discount waiting for you!'}${
    payload.code ? `\n🎟️ Code: ${payload.code} • Tap to Claim Deal!` : ''
  }`;

  const iconUrl = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=192&q=80';
  const targetUrl = payload.actionUrl || '/menu';

  try {
    // If Service Worker registration exists (PWA), use showNotification
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(notificationTitle, {
          body: notificationBody,
          icon: iconUrl,
          badge: iconUrl,
          tag: `velvet-offer-${payload.id}`,
          vibrate: [200, 100, 200],
          data: { url: targetUrl, code: payload.code }
        } as any);
        return;
      }
    }

    // Standard Window Notification fallback
    const notification = new Notification(notificationTitle, {
      body: notificationBody,
      icon: iconUrl,
      badge: iconUrl,
      tag: `velvet-offer-${payload.id}`,
      requireInteraction: true
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      if (onNotificationClick) {
        onNotificationClick(targetUrl, payload.code);
      } else {
        window.location.href = targetUrl;
      }
    };
  } catch (error) {
    console.debug('Standard notification creation fallback:', error);
  }
};
