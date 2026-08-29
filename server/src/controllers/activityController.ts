import { Request, Response } from 'express';
import { io } from '../app';

export interface ActivityItem {
  id: string;
  type: string; // 'page_view' | 'cart_add' | 'menu_view' | 'reservation_start' | 'checkout_start' | 'order_place'
  user: string;
  location: string;
  details: string;
  timestamp: string;
}

const inMemoryActivities: ActivityItem[] = [
  {
    id: 'ACT1',
    type: 'order_place',
    user: 'Rahul Sharma',
    location: 'Surat, Gujarat',
    details: 'Placed Order #ORD1026 for ₹540 (Margherita Pizza & Cappuccino)',
    timestamp: new Date(Date.now() - 120000).toISOString()
  },
  {
    id: 'ACT2',
    type: 'cart_add',
    user: 'Priya Patel',
    location: 'Vesu, Surat',
    details: 'Added Belgian Chocolate Waffle x1 to cart',
    timestamp: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'ACT3',
    type: 'reservation_start',
    user: 'Aarav Mehta',
    location: 'VIP Road, Surat',
    details: 'Booked Table for 4 Guests (07:30 PM)',
    timestamp: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'ACT4',
    type: 'menu_view',
    user: 'Visitor',
    location: 'Adajan, Surat',
    details: 'Browsing Pastries & Desserts menu category',
    timestamp: new Date(Date.now() - 900000).toISOString()
  }
];

export const logActivity = async (req: Request, res: Response) => {
  try {
    const { type, user, location, details } = req.body;

    const activity: ActivityItem = {
      id: 'ACT' + Math.floor(1000 + Math.random() * 9000),
      type: type || 'page_view',
      user: user || 'Website Visitor',
      location: location || 'Surat, India',
      details: details || 'Browsed Velvet Brews website',
      timestamp: new Date().toISOString()
    };

    inMemoryActivities.unshift(activity);
    if (inMemoryActivities.length > 50) {
      inMemoryActivities.pop();
    }

    // Broadcast live event stream to admin panel
    io.emit('user-activity', activity);

    res.status(201).json(activity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  res.json(inMemoryActivities);
};
