import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Sparkles, 
  Flame, 
  Tag, 
  ExternalLink, 
  Check, 
  Copy, 
  Clock, 
  ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { 
  requestNotificationPermission, 
  getNotificationPermission, 
  showDeviceNotification
} from '@/utils/notificationService';
import toast from 'react-hot-toast';

export interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOffer: any | null;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  activeOffer,
}) => {
  const navigate = useNavigate();
  const { applyPromoCode } = useCartStore();
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getNotificationPermission());
    if (granted) {
      toast.success("🔔 Phone Push Notifications Enabled! You will receive live secret discounts & cafe deals.");
      showDeviceNotification({
        id: 'welcome-notification',
        title: '☕ Welcome to Velvet Brews Notifications!',
        subtitle: 'You are now connected for live VIP cafe discounts and instant order alerts.',
        code: 'VELVETVIP',
        actionUrl: '/menu'
      });
    } else {
      toast.error("Notification permission not granted. You can still see deals in this notification center!");
    }
  };

  const handleClaimOffer = (offer: any) => {
    if (offer.code) {
      applyPromoCode(offer.code, offer.discountPercent || 20, offer.title);
      navigator.clipboard.writeText(offer.code);
      toast.success(`🎉 Promo code "${offer.code}" applied to your order! Redirecting to menu...`);
    }
    onClose();
    navigate(offer.actionUrl || '/menu');
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    } catch {
      // clipboard fallback
    }
    setCopiedCode(code);
    toast.success(`🎉 Coupon "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const defaultNotifications = [
    {
      id: 'n-bogo',
      type: 'deal',
      title: '🍕 Buy 1 Get 1 FREE: Artisan Woodfired Pizza',
      subtitle: 'Order any 12" artisanal pizza and get another delicious margherita pizza completely free!',
      code: 'BOGOPIZZA',
      discountPercent: 50,
      time: 'Hot Deal',
      actionUrl: '/menu',
      badge: 'BOGO Deal'
    },
    {
      id: 'n-monsoon',
      type: 'deal',
      title: '🌧️ Monsoon Warmth: Free Belgian Croissant on ₹499+',
      subtitle: 'Pair your warm hot chocolate with a buttery fresh croissant baked daily in-house.',
      code: 'RAINWARMTH',
      discountPercent: 15,
      time: 'Chef Special',
      actionUrl: '/menu',
      badge: '15% OFF'
    },
    {
      id: 'n-happyhour',
      type: 'deal',
      title: '⚡ Happy Hours 4 PM - 7 PM Daily',
      subtitle: 'Flat 20% OFF on all manual pour-overs, iced Spanish lattes & cold brews.',
      code: 'HAPPY20',
      discountPercent: 20,
      time: 'Daily Special',
      actionUrl: '/menu',
      badge: '20% OFF'
    },
    {
      id: 'n-table',
      type: 'deal',
      title: '✨ Candlelight Table Booking: 10% OFF Dining',
      subtitle: 'Planning a cozy date or dinner? Reserve Velvet Pergola corner with romantic setup.',
      code: 'ROMANCE10',
      discountPercent: 10,
      time: 'Dine-In Offer',
      actionUrl: '/reservation',
      badge: 'VIP Booking'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-end p-0 sm:p-4 overscroll-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs touch-none"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-stone-950 text-white h-full sm:h-[calc(100vh-2rem)] sm:rounded-3xl shadow-2xl border-l sm:border border-amber-500/30 flex flex-col z-10 overflow-hidden overscroll-contain touch-auto"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 shadow-md">
                  <Bell className="h-5 w-5 fill-stone-950" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                    Notification Inbox
                    <span className="text-[11px] font-sans font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      Live Deals
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">Exclusive promos & real-time cafe alerts</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notification drawer"
                className="p-2.5 rounded-full bg-stone-800 hover:bg-stone-700 active:scale-90 text-white transition-all border border-stone-700 cursor-pointer shadow-md"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar overscroll-contain">
              
              {/* Permission Banner (if not granted) */}
              {permission !== 'granted' && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-amber-950/40 border border-amber-500/50 shadow-lg space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
                      <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-300">Enable Phone Push Alerts</h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        Get instant secret discounts, BOGO alerts & order updates directly on your phone even when the browser is closed.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleEnableNotifications}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Bell className="h-4 w-4 fill-stone-950" />
                    <span>Turn On Push Notifications 🔔</span>
                  </button>
                </motion.div>
              )}

              {/* Active Broadcast Promo Card (If Active) */}
              {activeOffer && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" /> Live Broadcasted Offer
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                      Active Now
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border-2 border-amber-500 shadow-xl space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    {activeOffer.imageUrl && (
                      <div className="relative h-32 rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                        <img
                          src={activeOffer.imageUrl}
                          alt={activeOffer.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
                        <span className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md uppercase">
                          {activeOffer.badge || 'HOT DEAL'}
                        </span>
                      </div>
                    )}

                    <div>
                      <h4 className="font-heading text-base font-bold text-amber-300 leading-snug">
                        {activeOffer.title}
                      </h4>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        {activeOffer.subtitle}
                      </p>
                    </div>

                    {activeOffer.code && (
                      <div className="p-2.5 bg-stone-950 rounded-xl border border-dashed border-amber-500/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-amber-400" />
                          <span className="font-mono text-sm font-bold text-white tracking-wider">
                            {activeOffer.code}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(activeOffer.code, e)}
                          className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/30 transition-colors"
                        >
                          {copiedCode === activeOffer.code ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedCode === activeOffer.code ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleClaimOffer(activeOffer)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>{activeOffer.actionText || 'Visit & Claim Offer ☕'}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Other Curated Cafe Deals & Alerts */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block px-1">
                  Cafe Deals & Announcements
                </span>

                {defaultNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800/80 hover:border-amber-500/40 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {n.badge}
                      </span>
                      <span className="text-[10px] text-stone-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {n.time}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-100">{n.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">{n.subtitle}</p>
                    </div>

                    {n.code && (
                      <div className="p-2.5 bg-stone-950/90 rounded-xl border border-dashed border-amber-500/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="font-mono text-xs font-bold text-amber-300 tracking-wider truncate">
                            {n.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(n.code!, e)}
                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer active:scale-95"
                          >
                            {copiedCode === n.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedCode === n.code ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClaimOffer(n)}
                            className="text-[10px] font-extrabold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <span>Apply & Visit</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-950/80 text-center">
              <p className="text-[11px] text-stone-400">
                ✨ Velvet Brews Real-Time Notification System • Live Cafe Deals
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
