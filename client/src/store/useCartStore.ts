import { create } from 'zustand';
import type { CartItem, OrderType, CartState, AppliedPromo } from '@/types';

export type { CartItem, OrderType, CartState, AppliedPromo };

const getStoredPromo = (): AppliedPromo | null => {
  try {
    const saved = localStorage.getItem('velvet_applied_promo');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine-in',
  tableNumber: 'Table 1',
  deliveryAddress: '',
  isCartDrawerOpen: false,
  isNotificationOpen: false,
  hasUnreadNotification: false,
  activeOffer: null,
  appliedPromo: getStoredPromo(),

  addItem: (item) => set((state) => {
    const key = item.cartItemId || item.id;
    const existingItem = state.items.find((i) => (i.cartItemId || i.id) === key);
    let newItems;
    if (existingItem) {
      newItems = state.items.map((i) =>
        (i.cartItemId || i.id) === key ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      newItems = [...state.items, { ...item, cartItemId: key }];
    }
    return { items: newItems, isCartDrawerOpen: true };
  }),

  removeItem: (key) => set((state) => ({
    items: state.items.filter((i) => (i.cartItemId || i.id) !== key),
  })),

  updateQuantity: (key, quantity) => set((state) => ({
    items: state.items.map((i) => ((i.cartItemId || i.id) === key ? { ...i, quantity } : i)),
  })),

  clearCart: () => set({ items: [] }),

  getRawSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const rawSubtotal = get().getRawSubtotal();
    const promo = get().appliedPromo;
    if (!promo || !promo.discountPercent || promo.discountPercent <= 0) return 0;
    return Math.round((rawSubtotal * promo.discountPercent) / 100);
  },

  getTotalPrice: () => {
    const rawSubtotal = get().getRawSubtotal();
    const discount = get().getDiscountAmount();
    const deliveryFee = get().orderType === 'delivery' ? 30 : 0;
    return Math.max(0, rawSubtotal - discount) + deliveryFee;
  },

  applyPromoCode: (code, discountPercent, title) => {
    const promo: AppliedPromo = {
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent) || 0,
      title
    };
    try {
      localStorage.setItem('velvet_applied_promo', JSON.stringify(promo));
    } catch {}
    set({ appliedPromo: promo });
  },

  removePromoCode: () => {
    try {
      localStorage.removeItem('velvet_applied_promo');
    } catch {}
    set({ appliedPromo: null });
  },

  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (table) => set({ tableNumber: table }),
  setDeliveryAddress: (address) => set({ deliveryAddress: address }),
  setCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),
  setNotificationOpen: (open) => set({ isNotificationOpen: open }),
  setHasUnreadNotification: (unread) => set({ hasUnreadNotification: unread }),
  setActiveOffer: (offer) => set({ activeOffer: offer, hasUnreadNotification: !!offer }),
}));
