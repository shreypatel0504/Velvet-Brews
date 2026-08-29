export interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable?: boolean;
  tags?: string[];
  inStock?: boolean;
  calories?: number;
}

export type Category = 'All' | 'Signature Coffees' | 'Teas & Infusions' | 'Artisanal Bakery' | 'Gourmet Desserts';
