import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Sparkles } from "lucide-react";

interface SplashLoaderProps {
  onComplete?: () => void;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onComplete }) => {
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
      if (onComplete) onComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    setIsFinished(true);
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {!isFinished && (
        <div
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer flex items-center justify-center"
        >
          {/* Left Door */}
          <motion.div
            key="left-door"
            initial={{ x: "0%" }}
            exit={{ 
              x: "-100%", 
              transition: { duration: 0.95, ease: [0.77, 0, 0.175, 1] } 
            }}
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-[#140C07] to-[#1E130B] border-r border-[#D4A373]/30 shadow-2xl z-20 flex items-center justify-end pr-4 sm:pr-8"
          >
            <div className="absolute inset-y-0 right-3 w-px bg-amber-500/10" />
            <div className="absolute inset-y-0 right-10 w-px bg-amber-500/5" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            key="right-door"
            initial={{ x: "0%" }}
            exit={{ 
              x: "100%", 
              transition: { duration: 0.95, ease: [0.77, 0, 0.175, 1] } 
            }}
            className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-[#140C07] to-[#1E130B] border-l border-[#D4A373]/30 shadow-2xl z-20 flex items-center justify-start pl-4 sm:pl-8"
          >
            <div className="absolute inset-y-0 left-3 w-px bg-amber-500/10" />
            <div className="absolute inset-y-0 left-10 w-px bg-amber-500/5" />
          </motion.div>

          {/* Center Logo */}
          <motion.div
            key="center-logo"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 1.15,
              transition: { duration: 0.5 } 
            }}
            className="relative z-30 flex flex-col items-center text-center px-6"
          >
            <div className="relative flex items-center justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
              />

              <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-amber-500/20 blur-xl animate-pulse-glow" />

              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-b from-[#2A1C12] to-[#120A05] border-2 border-[#D4A373] flex items-center justify-center shadow-[0_0_35px_rgba(212,163,115,0.35)]"
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 pointer-events-none">
                  <span className="w-1 h-5 bg-gradient-to-t from-amber-300/80 to-transparent rounded-full animate-steam-1" />
                  <span className="w-1 h-7 bg-gradient-to-t from-amber-200/90 to-transparent rounded-full animate-steam-2" />
                  <span className="w-1 h-4 bg-gradient-to-t from-amber-300/60 to-transparent rounded-full animate-steam-3" />
                </div>

                <Coffee className="h-10 w-10 sm:h-12 sm:w-12 text-[#E8C5A5] drop-shadow-[0_2px_10px_rgba(212,163,115,0.6)]" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest mb-2 shadow-xs">
                <Sparkles className="h-3 w-3 text-amber-300" /> Artisan Cafe & Bakery
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gold-shimmer drop-shadow-lg">
                VELVET BREWS
              </h1>

              <div className="flex items-center justify-center gap-3 my-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/60" />
                <span className="text-[10px] sm:text-xs text-amber-200/90 font-mono uppercase tracking-[0.3em]">
                  VESU • SURAT
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-xs text-amber-200/60 font-serif italic mt-3"
            >
              Opening doors to warm coffee aromas...
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
