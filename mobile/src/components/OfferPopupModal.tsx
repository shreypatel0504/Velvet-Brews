import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Copy, Check, ChevronRight, Sparkles, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket, getApiBaseURL } from '../utils/socket';
import { useCartStore } from '../store/useCartStore';

export interface BroadcastOfferPayload {
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

interface OfferPopupModalProps {
  onNavigateTab?: (tab: 'home' | 'menu' | 'cart' | 'tracking' | 'booking' | 'profile') => void;
  onActiveOfferChange?: (offer: BroadcastOfferPayload | null) => void;
}

export const OfferPopupModal: React.FC<OfferPopupModalProps> = ({ onNavigateTab, onActiveOfferChange }) => {
  const [activeOffer, setActiveOffer] = useState<BroadcastOfferPayload | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { applyPromoCode } = useCartStore();

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

  useEffect(() => {
    // Initial fetch of active offer
    fetch(`${getApiBaseURL()}/api/notifications/active`)
      .then(r => r.json())
      .then(d => {
        if (d?.activeOffer?.title) {
          setActiveOffer(d.activeOffer);
          if (onActiveOfferChange) onActiveOfferChange(d.activeOffer);
        }
      })
      .catch(() => {});

    const handleNewOffer = (offer: BroadcastOfferPayload) => {
      if (!offer || !offer.title) return;
      setActiveOffer(offer);
      setIsOpen(true);
      if (onActiveOfferChange) onActiveOfferChange(offer);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([150, 75, 200, 75, 250]);
        } catch {}
      }

      toast.success(`🎉 ${offer.title}`, { duration: 6000 });
    };

    const handleClearOffer = () => {
      setActiveOffer(null);
      setIsOpen(false);
      if (onActiveOfferChange) onActiveOfferChange(null);
    };

    socket.on('new-offer-broadcast', handleNewOffer);
    socket.on('offer-cleared', handleClearOffer);

    return () => {
      socket.off('new-offer-broadcast', handleNewOffer);
      socket.off('offer-cleared', handleClearOffer);
    };
  }, [onActiveOfferChange]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeOffer?.code) return;
    navigator.clipboard.writeText(activeOffer.code);
    setCopied(true);
    toast.success(`Promo code "${activeOffer.code}" copied!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimOffer = () => {
    if (activeOffer?.code) {
      applyPromoCode(activeOffer.code, activeOffer.discountPercent || 20, activeOffer.title);
      navigator.clipboard.writeText(activeOffer.code);
      toast.success(`🎉 Code "${activeOffer.code}" applied to cart!`);
    }
    setIsOpen(false);
    if (onNavigateTab) {
      if (activeOffer?.actionUrl === '/reservation') {
        onNavigateTab('booking');
      } else {
        onNavigateTab('menu');
      }
    }
  };

  if (!activeOffer) return null;

  return (
    <>
      {/* Floating Pill when minimized */}
      {!isOpen && activeOffer && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-40 bg-[#120d0a]/95 text-[#f59e0b] border border-[#f59e0b]/50 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <Flame className="h-4 w-4 text-[#f59e0b] fill-[#f59e0b]" />
          <span className="text-[#fef3c7]">{activeOffer.badge || "Live Offer"}</span>
          <span className="bg-[#f59e0b] text-[#120d0a] text-[10px] font-black px-1.5 py-0.5 rounded-full">
            {activeOffer.code || 'DEAL'}
          </span>
        </motion.button>
      )}

      {/* Main Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-[#1a130e] border-2 border-[#d97706]/60 rounded-3xl overflow-hidden shadow-2xl z-10 text-[#fef3c7]"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 text-stone-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative h-40 w-full bg-black overflow-hidden">
                <img
                  src={activeOffer.imageUrl || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"}
                  alt={activeOffer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a130e] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#f59e0b] text-[#120d0a] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {activeOffer.badge || "SPECIAL DEAL"}
                </div>
              </div>

              <div className="p-5 pt-1 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#f59e0b] leading-tight font-heading">
                    {activeOffer.title}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                    {activeOffer.subtitle}
                  </p>
                </div>

                {activeOffer.code && (
                  <div className="p-2.5 bg-black/50 rounded-xl border border-dashed border-[#f59e0b]/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#f59e0b]" />
                      <span className="font-mono text-sm font-extrabold text-white">{activeOffer.code}</span>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-lg border border-[#f59e0b]/30"
                    >
                      {copied ? "Copied" : "Copy Code"}
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleClaimOffer}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-[#120d0a] font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <span>{activeOffer.actionText || "Claim Deal & Visit Menu"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-1.5 text-xs text-stone-400 hover:text-stone-200 text-center"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
