import { Router, Request, Response } from 'express';
import { io } from '../app';

const router = Router();

export interface BroadcastOffer {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountPercent?: number;
  imageUrl?: string;
  actionText?: string;
  actionUrl?: string;
  badge?: string;
  timestamp?: string;
}

// In-memory active offer and history (can sync with database or file store)
let currentActiveOffer: BroadcastOffer | null = {
  id: 'offer-monsoon-welcome',
  title: '☕ Monsoon Special: 30% OFF on Cold Brews!',
  subtitle: 'Beat the rain with icy smooth gourmet coffee. Valid on all orders above ₹299.',
  code: 'COLD30',
  discountPercent: 30,
  badge: 'Limited Time Deal',
  imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
  actionText: 'Claim 30% Discount ☕',
  actionUrl: '/menu',
  timestamp: new Date().toISOString()
};

let broadcastHistory: BroadcastOffer[] = currentActiveOffer ? [currentActiveOffer] : [];

// GET /api/notifications/active
router.get('/active', (req: Request, res: Response) => {
  res.json({ success: true, activeOffer: currentActiveOffer });
});

// GET /api/notifications/history
router.get('/history', (req: Request, res: Response) => {
  res.json({ success: true, history: broadcastHistory });
});

// POST /api/notifications/broadcast
router.post('/broadcast', (req: Request, res: Response) => {
  try {
    const { title, subtitle, code, discountPercent, imageUrl, actionText, actionUrl, badge } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Offer title is required' });
    }

    const newOffer: BroadcastOffer = {
      id: `offer_${Date.now()}`,
      title: title.trim(),
      subtitle: (subtitle || '').trim(),
      code: (code || '').toUpperCase().trim(),
      discountPercent: Number(discountPercent) || 0,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
      actionText: actionText || 'Claim Offer ☕',
      actionUrl: actionUrl || '/menu',
      badge: badge || 'SPECIAL DEAL',
      timestamp: new Date().toISOString()
    };

    currentActiveOffer = newOffer;
    broadcastHistory = [newOffer, ...broadcastHistory.filter(h => h.id !== newOffer.id)].slice(0, 20);

    // Relay broadcast to all connected clients via Socket.IO
    if (io) {
      io.emit('new-offer-broadcast', newOffer);
    }

    res.json({
      success: true,
      message: 'Offer broadcasted to all customer devices successfully',
      offer: newOffer
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to broadcast offer' });
  }
});

// POST /api/notifications/clear
router.post('/clear', (req: Request, res: Response) => {
  currentActiveOffer = null;
  if (io) {
    io.emit('offer-cleared');
  }
  res.json({ success: true, message: 'Active offer cleared' });
});

export { currentActiveOffer };
export default router;
