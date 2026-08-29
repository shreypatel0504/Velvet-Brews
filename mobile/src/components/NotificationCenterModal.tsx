import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Flame, Tag, Copy, Check, ChevronRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/useCartStore';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOffer: any | null;
  onNavigateTab?: (tab: 'home' | 'menu' | 'cart' | 'tracking' | 'booking' | 'profile') => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  activeOffer,
  onNavigateTab
}) => {
  const { applyPromoCode } = useCartStore();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
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

  const handleClaimOffer = (offer: any) => {
    if (offer.code) {
      applyPromoCode(offer.code, offer.discountPercent || 20, offer.title);
      navigator.clipboard.writeText(offer.code);
      toast.success(`🎉 Code "${offer.code}" applied to your order!`);
    }
    onClose();
    if (onNavigateTab) {
      if (offer.actionUrl === '/reservation') {
        onNavigateTab('booking');
      } else {
        onNavigateTab('menu');
      }
    }
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
    toast.success(`Coupon "${code}" copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const defaultDeals = [
    {
      id: 'm-bogo',
      title: '🍕 Buy 1 Get 1 FREE: Woodfired Pizza',
      subtitle: 'Order any artisan pizza & get margherita free.',
      code: 'BOGOPIZZA',
      discountPercent: 50,
      badge: 'BOGO Deal',
      actionUrl: '/menu'
    },
    {
      id: 'm-monsoon',
      title: '🌧️ Monsoon Warmth: Free Belgian Croissant on ₹499+',
      subtitle: 'Pair your warm hot chocolate with fresh croissant.',
      code: 'RAINWARMTH',
      discountPercent: 15,
      badge: 'Chef Special',
      actionUrl: '/menu'
    },
    {
      id: 'm-happyhour',
      title: '⚡ Happy Hours 4 PM - 7 PM Daily',
      subtitle: 'Flat 20% OFF on all signature artisan lattes & cold brews.',
      code: 'HAPPY20',
      discountPercent: 20,
      badge: 'Happy Hour',
      actionUrl: '/menu'
    },
    {
      id: 'm-table',
      title: '✨ Candlelight Table: 10% OFF Dining',
      subtitle: 'Reserve romantic corner at Velvet Pergola.',
      code: 'ROMANCE10',
      discountPercent: 10,
      badge: 'VIP Table',
      actionUrl: '/reservation'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs touch-none"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-[#1a130e] border-t-2 border-[#d97706]/40 rounded-t-3xl shadow-2xl z-10 text-[#fef3c7] max-h-[85vh] flex flex-col overflow-hidden overscroll-contain touch-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#d97706]/20 flex items-center justify-between bg-[#120d0a] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#d97706] to-[#f59e0b] text-[#120d0a]">
                  <Bell className="h-5 w-5 fill-[#120d0a]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#fef3c7]">Notification Inbox</h3>
                  <p className="text-[10px] text-stone-400">Exclusive cafe offers & announcements</p>
                </div>
              </div>

              <button 
                type="button"
                onClick={onClose} 
                className="p-2 rounded-full bg-[#261b15] text-stone-300 hover:text-white border border-stone-700 cursor-pointer shadow-md"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar overscroll-contain">
              
              {/* Active Offer Card */}
              {activeOffer && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-[#f59e0b]" /> Live Broadcast Offer
                  </span>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#261b15] to-[#1a130e] border-2 border-[#f59e0b] space-y-2.5 shadow-lg">
                    {activeOffer.imageUrl && (
                      <div className="h-28 rounded-xl overflow-hidden bg-black">
                        <img src={activeOffer.imageUrl} alt={activeOffer.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-[#f59e0b]">{activeOffer.title}</h4>
                      <p className="text-[11px] text-stone-300 mt-0.5">{activeOffer.subtitle}</p>
                    </div>

                    {activeOffer.code && (
                      <div className="p-2.5 bg-black/70 rounded-xl border border-dashed border-[#f59e0b]/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                          <span className="font-mono text-xs font-bold text-white tracking-wider truncate">{activeOffer.code}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(activeOffer.code, e)}
                          className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 px-2.5 py-1 rounded-lg border border-[#f59e0b]/40 flex items-center gap-1 active:scale-95 transition-all"
                        >
                          {copiedCode === activeOffer.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedCode === activeOffer.code ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleClaimOffer(activeOffer)}
                      className="w-full py-2.5 bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-[#120d0a] text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
                    >
                      <span>{activeOffer.actionText || "Claim Deal"}</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Other Curated Deals */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Cafe Specials & Offers
                </span>

                {defaultDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3.5 rounded-2xl bg-[#261b15] border border-[#d97706]/20 hover:border-[#d97706]/50 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold bg-[#f59e0b]/20 text-[#f59e0b] px-2 py-0.5 rounded-full">
                        {deal.badge}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-[#fef3c7]">{deal.title}</h5>
                      <p className="text-[10px] text-stone-400 mt-0.5">{deal.subtitle}</p>
                    </div>

                    {deal.code && (
                      <div className="p-2 bg-black/60 rounded-xl border border-dashed border-[#f59e0b]/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Tag className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                          <span className="font-mono text-xs font-bold text-[#f59e0b] tracking-wider truncate">{deal.code}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleCopyCode(deal.code, e)}
                            className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 px-2 py-1 rounded-lg border border-[#f59e0b]/30 flex items-center gap-1 active:scale-95 transition-all"
                          >
                            {copiedCode === deal.code ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            <span>{copiedCode === deal.code ? "Copied" : "Copy"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClaimOffer(deal)}
                            className="text-[10px] font-bold text-[#120d0a] bg-gradient-to-r from-[#d97706] to-[#f59e0b] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                          >
                            <span>Apply</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
