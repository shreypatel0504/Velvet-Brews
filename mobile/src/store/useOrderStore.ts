import { create } from 'zustand';
import { Order } from '../types';

interface OrderState {
  activeOrders: Order[];
  pastOrders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const INITIAL_ACTIVE_ORDER: Order = {
  id: 'VB-9482',
  items: [
    {
      cartItemId: 'item-1',
      menuItem: {
        id: 'vb-1',
        name: 'Velvet Vanilla Cold Brew',
        category: 'Cold Brews',
        price: 340,
        rating: 4.9,
        reviewsCount: 328,
        description: 'Slow-steeped 20-hour Ethiopian cold brew layered with Madagascar vanilla sweet cream.',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800'
      },
      quantity: 1,
      customization: { size: 'Large', milk: 'Oat Milk', sweetness: '50%' },
      unitPrice: 390,
      totalPrice: 390
    }
  ],
  orderType: 'dine-in',
  tableNumber: 'Table 4 (Cozy Window)',
  totalAmount: 410,
  status: 'Brewing',
  createdAt: 'Just now',
  estimatedDeliveryMinutes: 8
};

export const useOrderStore = create<OrderState>((set) => ({
  activeOrders: [INITIAL_ACTIVE_ORDER],
  pastOrders: [],

  addOrder: (order) => set((state) => ({ activeOrders: [order, ...state.activeOrders] })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    activeOrders: state.activeOrders.map((o) => o.id === orderId ? { ...o, status } : o)
  }))
}));
