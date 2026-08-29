import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export const InstallPWABanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('PWA Service Worker registered!'))
        .catch((err) => console.log('SW registration error:', err));
    }

    // Check if device is iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Listen for Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on mobile browser and not already in standalone mode, show banner after 2s
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

    if (isMobile && !isStandalone) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User installed the PWA!');
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("iPhone par install karne ke liye:\n1. Bottom bar me Share (↑) tap karein\n2. 'Add to Home Screen' select karein.");
    } else {
      alert("Android Chrome par install karne ke liye:\n1. Top right 3 dots (⋮) par tap karein\n2. 'Add to Home Screen' ya 'Install app' par tap karein.");
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#261b15] via-[#d97706] to-[#120d0a] text-[#fef3c7] px-4 py-2.5 shadow-2xl border-b border-[#f59e0b]/30 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#120d0a] border border-[#f59e0b] flex items-center justify-center text-[#f59e0b]">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold font-heading flex items-center gap-1 text-[#fef3c7]">
            Install Velvet Brews App <Sparkles className="w-3 h-3 text-[#f59e0b]" />
          </h4>
          <p className="text-[10px] text-amber-200/80">Get the full app icon on your phone home screen</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-xl bg-[#f59e0b] text-[#120d0a] font-extrabold text-xs flex items-center gap-1 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> INSTALL NOW
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 rounded-full text-amber-200 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
