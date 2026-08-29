import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Heart, Coffee, Copy, Check, Star } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, orderId }) => {
  const [modalStep, setModalStep] = React.useState<'feedback' | 'thankyou'>('feedback');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setModalStep('feedback');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText("VELVET10");
    setCopied(true);
    toast.success("Promo code VELVET10 copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFeedbackSubmitted = () => {
    setModalStep('thankyou');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Responsive Pop-up Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 25 }}
          transition={{ type: "spring", damping: 22, stiffness: 240 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl z-10 overflow-hidden max-h-[92vh] flex flex-col border border-gray-100"
        >
          {/* STEP 1: FEEDBACK POP-UP */}
          {modalStep === 'feedback' ? (
            <>
              {/* Modal Header Banner */}
              <div className="p-5 bg-gradient-to-r from-[var(--color-cafe-primary)] to-amber-800 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold leading-tight">Order Confirmed #{orderId || '1026'}</h3>
                    <p className="text-xs text-amber-200">How is your food, service & cafe vibe?</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Scroll Area */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                <FeedbackForm orderId={orderId} onSuccess={handleFeedbackSubmitted} />
              </div>

              {/* Skip Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                <button
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-black font-semibold transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </>
          ) : (
            /* STEP 2: POP-UP THANK YOU & VISIT AGAIN NOTE */
            <>
              {/* Thank You Top Header */}
              <div className="p-5 bg-gradient-to-r from-amber-700 via-[var(--color-cafe-primary)] to-amber-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold leading-tight">Thank You & Visit Again!</h3>
                    <p className="text-xs text-amber-200">Velvet Brews Surat • Appreciation Note</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Close Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Thank You Note Body */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-center bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 custom-scrollbar">
                {/* Floating Heart Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-20 h-20 bg-gradient-to-tr from-[var(--color-cafe-primary)] to-amber-700 text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[var(--color-cafe-primary)]/30 transform -rotate-3 hover:rotate-0 transition-transform"
                >
                  <Heart className="h-10 w-10 fill-white" />
                </motion.div>

                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                  Heartfelt Gratitude
                </span>

                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-cafe-text-primary)] mb-3">
                  Thank You & Visit Again!
                </h3>

                <p className="text-xs sm:text-sm text-[var(--color-cafe-text-secondary)] leading-relaxed max-w-md mx-auto mb-6">
                  We are deeply grateful for your visit to Velvet Brews Surat! Your valuable feedback helps us roast better coffee & craft unforgettable cafe experiences every day.
                </p>

                {/* Promo Gift Box */}
                <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[var(--color-cafe-secondary)] max-w-sm mx-auto mb-6 shadow-xs">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">🎁 A Gift For Your Next Visit</p>
                  <div className="flex items-center justify-between bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 mt-2">
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--color-cafe-primary)] tracking-widest">
                      VELVET10
                    </span>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1 text-xs font-bold text-[var(--color-cafe-primary)] hover:underline"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-2 font-medium">Use code for 10% OFF on your next order!</p>
                </div>

                <Button
                  onClick={onClose}
                  className="w-full h-12 text-sm font-bold gap-2 rounded-xl shadow-lg shadow-[var(--color-cafe-primary)]/20"
                >
                  <Coffee className="h-4 w-4" /> See You Soon at Velvet Brews!
                </Button>
              </div>

              {/* Thank You Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center shrink-0">
                <span className="text-[11px] text-gray-400 font-semibold inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Vesu, Surat • Have a Wonderful Day!
                </span>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
