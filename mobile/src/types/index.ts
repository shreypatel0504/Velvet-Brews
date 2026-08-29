export type MenuItemCategory = 'All' | 'Espresso' | 'Cold Brews' | 'Signatures' | 'Teas & Matcha' | 'Pastries' | 'Desserts';

export interface CustomizationOptions {
  size?: 'Small' | 'Medium' | 'Large';
  milk?: 'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Soy Milk' | 'No Milk';
  sweetness?: '0%' | '25%' | '50%' | '75%' | '100%';
  iceLevel?: 'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice';
  extraShots?: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  image: string;
  isPopular?: boolean;
  isNew?: boolean;
  calories?: number;
  prepTimeMinutes?: number;
  availableCustomizations?: {
    sizes?: boolean;
    milks?: boolean;
    sweetness?: boolean;
    ice?: boolean;
    extraShots?: boolean;
  };
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: CustomizationOptions;
  unitPrice: number;
  totalPrice: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export interface Order {
  id: string;
  items: CartItem[];
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  totalAmount: number;
  status: 'Received' | 'Brewing' | 'Quality Check' | 'Ready for Pickup' | 'Out for Delivery' | 'Completed';
  createdAt: string;
  estimatedDeliveryMinutes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  membershipTier: 'Silver' | 'Gold' | 'Velvet Platinum';
  avatar: string;
  addresses: string[];
}
