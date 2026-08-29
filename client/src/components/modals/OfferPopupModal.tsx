import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, X, Copy, Check, Sparkles, Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { socket } from '@/utils/socket';
import { useCartStore } from '@/store/useCartStore';
import { showDeviceNotification, playNotificationChime, triggerDeviceVibration } from '@/utils/notificationService';

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
  onActiveOfferChange?: (offer: BroadcastOfferPayload | null) => void;
}

export const OfferPopupModal: React.FC<OfferPopupModalProps> = ({ onActiveOfferChange }) => {
  const [activeOffer, setActiveOffer] = useState<BroadcastOfferPayload | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
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
    // Fetch initial active offer from backend if available
    fetch('/api/notifications/active')
      .then(res => res.json())
      .then(data => {
        if (data?.activeOffer && data.activeOffer.title) {
          setActiveOffer(data.activeOffer);
          if (onActiveOfferChange) onActiveOfferChange(data.activeOffer);
        }
      })
      .catch(() => {});

    // Listen for live broadcast from Socket.IO server
    const handleNewOffer = (offer: BroadcastOfferPayload) => {
      if (!offer || !offer.title) return;
      setActiveOffer(offer);
      setIsOpen(true);
      if (onActiveOfferChange) onActiveOfferChange(offer);

      // Play audio chime and trigger mobile phone vibration
      playNotificationChime();
      triggerDeviceVibration([200, 100, 200, 100, 300]);

      // Fire OS/Browser System Push Notification
      showDeviceNotification(
        {
          id: offer.id,
          title: offer.title,
          subtitle: offer.subtitle,
          code: offer.code,
          discountPercent: offer.discountPercent,
          imageUrl: offer.imageUrl,
          actionUrl: offer.actionUrl,
          badge: offer.badge
        },
        (url, code) => {
          if (code) {
            applyPromoCode(code, offer.discountPercent || 20, offer.title);
          }
          navigate(url);
        }
      );

      // In-App Toast Banner with quick action
      toast.custom(
        (t) => (
          <div
            onClick={() => {
              toast.dismiss(t.id);
              setIsOpen(true);
            }}
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-stone-950 text-white shadow-2xl rounded-2xl pointer-events-auto flex items-center p-3.5 border-2 border-amber-500 cursor-pointer gap-3`}
          >
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 rounded-xl shrink-0 animate-bounce">
              <Flame className="h-5 w-5 fill-stone-950" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-amber-400 uppercase tracking-wider">🎉 Special Offer Pop-up</p>
              <p className="text-xs font-bold truncate text-white">{offer.title}</p>
            </div>
            <span className="text-xs bg-amber-500 text-stone-950 font-black px-2.5 py-1 rounded-lg shrink-0 uppercase tracking-wide">
              Claim Deal
            </span>
          </div>
        ),
        { duration: 7000 }
      );
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
  }, [onActiveOfferChange, applyPromoCode, navigate]);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeOffer?.code) return;
    navigator.clipboard.writeText(activeOffer.code);
    setCopied(true);
    toast.success(`Promo code "${activeOffer.code}" copied to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimOffer = () => {
    if (activeOffer?.code) {
      applyPromoCode(activeOffer.code, activeOffer.discountPercent || 20, activeOffer.title);
      navigator.clipboard.writeText(activeOffer.code);
      toast.success(`🎉 Code "${activeOffer.code}" applied! Redirecting to menu...`);
    }
    setIsOpen(false);
    navigate(activeOffer?.actionUrl || '/menu');
  };

  if (!activeOffer) return null;

  return (
    <>
      {/* Floating Offer Trigger Pill (when modal is minimized) */}
      {!isOpen && activeOffer && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 left-4 z-40 bg-stone-950/95 text-amber-400 border border-amber-500/60 backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-bold hover:bg-stone-900 transition-all group cursor-pointer"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <Flame className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform fill-amber-400" />
          <span className="text-white hidden sm:inline">{activeOffer.badge || "Live Offer"}</span>
          <span className="bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">
            {activeOffer.code || 'DEAL'}
          </span>
        </motion.button>
      )}

      {/* Main Animated Offer Pop-up Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overscroll-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm touch-none"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-stone-900 border-2 border-amber-500/60 rounded-3xl overflow-hidden shadow-2xl z-10 text-white space-y-0 overscroll-contain touch-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 z-20 p-2 rounded-full bg-stone-950/70 hover:bg-stone-950 text-stone-300 hover:text-white backdrop-blur-md transition-all border border-stone-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Top Banner Image with Gradient */}
              <div className="relative h-48 w-full bg-stone-950 overflow-hidden">
                <img
                  src={activeOffer.imageUrl || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"}
                  alt={activeOffer.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />

                {/* Badge Tag */}
                <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="h-3.5 w-3.5 fill-stone-950" />
                  {activeOffer.badge || "SPECIAL CAFE DEAL"}
                </div>
              </div>

              {/* Content Details */}
              <div className="p-6 pt-2 space-y-5">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-amber-400 leading-snug">
                    {activeOffer.title}
                  </h3>
                  <p className="text-sm text-stone-300 mt-2 leading-relaxed font-sans">
                    {activeOffer.subtitle}
                  </p>
                </div>

                {/* Promo Code Box */}
                {activeOffer.code && (
                  <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-dashed border-amber-500/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">Coupon Promo Code</span>
                        <span className="font-mono text-base font-extrabold text-white tracking-wider">{activeOffer.code}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copied
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClaimOffer}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all group cursor-pointer"
                  >
                    <span>{activeOffer.actionText || "Claim Offer & Visit Menu"}</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 text-xs text-stone-400 hover:text-stone-200 transition-colors font-medium text-center cursor-pointer"
                  >
                    Dismiss for now
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
