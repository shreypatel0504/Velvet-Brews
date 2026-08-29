import { create } from 'zustand';
import { CartItem, MenuItem, CustomizationOptions, OrderType } from '../types';

export interface AppliedPromo {
  code: string;
  discountPercent: number;
  title?: string;
}

interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  deliveryAddress: string;
  specialInstructions: string;
  appliedPromo: AppliedPromo | null;
  addItem: (item: MenuItem, customization?: CustomizationOptions, quantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: string) => void;
  setDeliveryAddress: (address: string) => void;
  setSpecialInstructions: (notes: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string, discountPercent: number, title?: string) => void;
  removePromoCode: () => void;
  getDiscountAmount: () => number;
  getCartTotal: () => { subtotal: number; discount: number; deliveryFee: number; tax: number; total: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'dine-in',
  tableNumber: 'Table 4 (Cozy Window)',
  deliveryAddress: '742 Evergreen Terrace, Sector 18',
  specialInstructions: '',
  appliedPromo: null,

  addItem: (menuItem, customization = {}, quantity = 1) => {
    set((state) => {
      const extraPrice = (customization.extraShots || 0) * 40 +
        (customization.size === 'Large' ? 50 : customization.size === 'Medium' ? 20 : 0);
      const unitPrice = menuItem.price + extraPrice;
      const cartItemId = `${menuItem.id}-${JSON.stringify(customization)}`;

      const existingIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...state.items];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * unitPrice;
        return { items: updated };
      }

      const newItem: CartItem = {
        cartItemId,
        menuItem,
        quantity,
        customization,
        unitPrice,
        totalPrice: unitPrice * quantity
      };

      return { items: [...state.items, newItem] };
    });
  },

  removeItem: (cartItemId) => {
    set((state) => ({ items: state.items.filter((item) => item.cartItemId !== cartItemId) }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity
          };
        }
        return item;
      })
    }));
  },

  setOrderType: (type) => set({ orderType: type }),
  setTableNumber: (tableNumber) => set({ tableNumber }),
  setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),
  setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),
  clearCart: () => set({ items: [] }),

  applyPromoCode: (code, discountPercent, title) => {
    set({
      appliedPromo: {
        code: code.toUpperCase().trim(),
        discountPercent: Number(discountPercent) || 0,
        title
      }
    });
  },

  removePromoCode: () => set({ appliedPromo: null }),

  getDiscountAmount: () => {
    const items = get().items;
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const promo = get().appliedPromo;
    if (!promo || !promo.discountPercent) return 0;
    return Math.round((subtotal * promo.discountPercent) / 100);
  },

  getCartTotal: () => {
    const items = get().items;
    const orderType = get().orderType;
    const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
    const discount = get().getDiscountAmount();
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const deliveryFee = orderType === 'delivery' && subtotal > 0 ? 40 : 0;
    const tax = Math.round(subtotalAfterDiscount * 0.05); // 5% GST
    return {
      subtotal,
      discount,
      deliveryFee,
      tax,
      total: subtotalAfterDiscount + deliveryFee + tax
    };
  }
}));
