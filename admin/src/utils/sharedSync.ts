// Shared Realtime & Fallback LocalStorage Synchronizer for Velvet Brews Admin

export interface SharedOrder {
  _id: string;
  id: string;
  table: string;
  customer: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  totalAmount: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface SharedReservation {
  _id: string;
  id: string;
  customerName: string;
  phone: string;
  email: string;
  guests: number;
  date: string;
  timeSlot: string;
  tableNumber: string;
  seatingArea: string;
  occasion?: string;
  specialRequest?: string;
  status: string;
  createdAt: string;
}

export interface SharedReview {
  _id: string;
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  category: string;
  createdAt: string;
  ownerReply?: string;
}

export interface SharedContact {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  reply?: string;
  createdAt: string;
}

export interface SharedSubscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export interface SharedActivity {
  id: string;
  type: string;
  user: string;
  location: string;
  details: string;
  timestamp: string;
}

const STORAGE_KEYS = {
  ORDERS: 'velvet_brews_orders',
  RESERVATIONS: 'velvet_brews_reservations',
  REVIEWS: 'velvet_brews_reviews',
  CONTACTS: 'velvet_brews_contacts',
  SUBSCRIBERS: 'velvet_brews_subscribers',
  ACTIVITIES: 'velvet_brews_activities',
};

// Broadcast Channel for instant same-browser cross-tab updates
const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('velvet_brews_sync_channel')
  : null;

export const sharedSync = {
  // --- ORDERS ---
  getOrders: (): SharedOrder[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveOrder: (order: SharedOrder) => {
    try {
      const existing = sharedSync.getOrders();
      const id = order._id || order.id;
      const index = existing.findIndex(o => (o._id === id || o.id === id));
      let updated;
      if (index >= 0) {
        existing[index] = { ...existing[index], ...order };
        updated = existing;
      } else {
        updated = [order, ...existing];
      }
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'ORDER_UPDATED', order });
    } catch (e) {
      console.warn("sharedSync saveOrder error", e);
    }
  },
  updateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'served') => {
    try {
      const existing = sharedSync.getOrders();
      const updated = existing.map(o => {
        if (o._id === orderId || o.id === orderId) {
          return { ...o, status };
        }
        return o;
      });
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'ORDER_STATUS_CHANGED', orderId, status });
    } catch (e) {
      console.warn("sharedSync updateOrderStatus error", e);
    }
  },

  // --- RESERVATIONS ---
  getReservations: (): SharedReservation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveReservation: (reservation: SharedReservation) => {
    try {
      const existing = sharedSync.getReservations();
      const id = reservation._id || reservation.id;
      const index = existing.findIndex(r => (r._id === id || r.id === id));
      let updated;
      if (index >= 0) {
        existing[index] = { ...existing[index], ...reservation };
        updated = existing;
      } else {
        updated = [reservation, ...existing];
      }
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'RESERVATION_UPDATED', reservation });
    } catch (e) {
      console.warn("sharedSync saveReservation error", e);
    }
  },

  // --- REVIEWS ---
  getReviews: (): SharedReview[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveReview: (review: SharedReview) => {
    try {
      const existing = sharedSync.getReviews();
      const id = review._id || review.id;
      const index = existing.findIndex(r => (r._id === id || r.id === id));
      let updated;
      if (index >= 0) {
        existing[index] = { ...existing[index], ...review };
        updated = existing;
      } else {
        updated = [review, ...existing];
      }
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'REVIEW_UPDATED', review });
    } catch (e) {
      console.warn("sharedSync saveReview error", e);
    }
  },

  // --- CONTACT MESSAGES ---
  getContacts: (): SharedContact[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveContact: (contact: SharedContact) => {
    try {
      const existing = sharedSync.getContacts();
      const id = contact._id;
      const index = existing.findIndex(c => c._id === id);
      let updated;
      if (index >= 0) {
        existing[index] = { ...existing[index], ...contact };
        updated = existing;
      } else {
        updated = [contact, ...existing];
      }
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'CONTACT_UPDATED', contact });
    } catch (e) {
      console.warn("sharedSync saveContact error", e);
    }
  },

  // --- SUBSCRIBERS ---
  getSubscribers: (): SharedSubscriber[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSubscriber: (sub: SharedSubscriber) => {
    try {
      const existing = sharedSync.getSubscribers();
      if (!existing.some(s => s.email.toLowerCase() === sub.email.toLowerCase())) {
        const updated = [sub, ...existing];
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(updated));
        broadcastChannel?.postMessage({ type: 'SUBSCRIBER_UPDATED', sub });
      }
    } catch (e) {
      console.warn("sharedSync saveSubscriber error", e);
    }
  },

  // --- ACTIVITIES ---
  getActivities: (): SharedActivity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveActivity: (activity: SharedActivity) => {
    try {
      const existing = sharedSync.getActivities();
      const updated = [activity, ...existing].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));
      broadcastChannel?.postMessage({ type: 'ACTIVITY_UPDATED', activity });
    } catch (e) {
      console.warn("sharedSync saveActivity error", e);
    }
  },

  // Subscribe to cross-tab updates
  subscribe: (callback: (data: { type: string; payload?: any }) => void) => {
    const handleBroadcast = (event: MessageEvent) => {
      callback({ type: event.data.type, payload: event.data });
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.ORDERS) {
        callback({ type: 'STORAGE_ORDERS_CHANGED' });
      } else if (event.key === STORAGE_KEYS.RESERVATIONS) {
        callback({ type: 'STORAGE_RESERVATIONS_CHANGED' });
      } else if (event.key === STORAGE_KEYS.REVIEWS) {
        callback({ type: 'STORAGE_REVIEWS_CHANGED' });
      } else if (event.key === STORAGE_KEYS.CONTACTS) {
        callback({ type: 'STORAGE_CONTACTS_CHANGED' });
      } else if (event.key === STORAGE_KEYS.SUBSCRIBERS) {
        callback({ type: 'STORAGE_SUBSCRIBERS_CHANGED' });
      } else if (event.key === STORAGE_KEYS.ACTIVITIES) {
        callback({ type: 'STORAGE_ACTIVITIES_CHANGED' });
      }
    };

    broadcastChannel?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);

    return () => {
      broadcastChannel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }
};
