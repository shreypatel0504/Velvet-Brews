export interface CartItem {
  id: string;
  cartItemId?: string; // unique ID for customized entries
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  customizations?: string[];
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface AppliedPromo {
  code: string;
  discountPercent: number;
  title?: string;
}

export interface CartState {
  items: CartItem[];
  orderType: OrderType;
  tableNumber: string;
  deliveryAddress: string;
  isCartDrawerOpen: boolean;
  isNotificationOpen: boolean;
  hasUnreadNotification: boolean;
  activeOffer: any | null;
  appliedPromo: AppliedPromo | null;
  
  addItem: (item: CartItem) => void;
  removeItem: (cartItemIdOrId: string) => void;
  updateQuantity: (cartItemIdOrId: string, quantity: number) => void;
  clearCart: () => void;
  getRawSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotalPrice: () => number;
  
  applyPromoCode: (code: string, discountPercent: number, title?: string) => void;
  removePromoCode: () => void;
  
  setOrderType: (type: OrderType) => void;
  setTableNumber: (table: string) => void;
  setDeliveryAddress: (address: string) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
  setHasUnreadNotification: (unread: boolean) => void;
  setActiveOffer: (offer: any | null) => void;
}
