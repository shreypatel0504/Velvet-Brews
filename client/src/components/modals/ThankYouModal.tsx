import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Coffee, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyCode = () => {
    navigator.clipboard.writeText("VELVET10");
    setCopied(true);
    toast.success("Promo code VELVET10 copied!");
    setTimeout(() => setCopied(false), 2500);
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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", damping: 20, stiffness: 250 }}
          className="relative w-full max-w-md bg-gradient-to-b from-amber-50/90 via-white to-amber-50/60 rounded-3xl shadow-2xl z-10 overflow-hidden border border-amber-200/80 p-6 sm:p-8 text-center"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Animated Heart Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 bg-gradient-to-tr from-[var(--color-cafe-primary)] to-amber-700 text-white rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[var(--color-cafe-primary)]/30 transform -rotate-3 hover:rotate-0 transition-transform"
          >
            <Heart className="h-10 w-10 fill-white" />
          </motion.div>

          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
            Heartfelt Gratitude
          </span>

          <h2 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mb-3">
            Thank You & Visit Again!
          </h2>

          <p className="text-sm text-[var(--color-cafe-text-secondary)] leading-relaxed mb-6">
            We are deeply grateful for your visit to Velvet Brews Surat! Your feedback helps us brew better coffee & deliver exceptional hospitality every day.
          </p>

          {/* Promo Gift Box */}
          <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-[var(--color-cafe-secondary)] max-w-xs mx-auto mb-6 shadow-xs relative">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
              🎁 A Special Gift For Your Next Visit
            </p>
            
            <div className="flex items-center justify-between bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 mt-2">
              <span className="font-mono text-lg font-bold text-[var(--color-cafe-primary)] tracking-widest">
                VELVET10
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-xs font-bold text-[var(--color-cafe-primary)] hover:underline"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            
            <p className="text-[11px] text-amber-800 mt-2 font-medium">Show this code for 10% OFF your next order!</p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onClose}
              className="w-full h-12 text-sm font-bold gap-2 rounded-xl shadow-lg shadow-[var(--color-cafe-primary)]/20"
            >
              <Coffee className="h-4 w-4" /> See You Soon at Velvet Brews!
            </Button>
          </div>

          <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Vesu, Surat • Open Daily 8 AM - 11 PM
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
