import React, { useMemo } from 'react';
import { Home, Coffee, ShoppingBag, Calendar, Bell, Clock } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';

export type TabType = 'home' | 'menu' | 'cart' | 'booking' | 'tracking' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOffersClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOffersClick }) => {
  const items = useCartStore((s) => s.items);
  const activeOrders = useOrderStore((s) => s.activeOrders);

  const totalCartCount = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const activeOrderCount = activeOrders.length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav px-3 py-2 flex items-center justify-around shadow-2xl gpu-layer">
      <button
        onClick={() => onTabChange('home')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'home' ? 'text-[#f59e0b] scale-105' : 'text-[#a89988] hover:text-[#fef3c7]'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wide">Home</span>
      </button>

      <button
        onClick={() => onTabChange('menu')}
        className={`flex flex-col items-center gap-1 transition-all ${
          activeTab === 'menu' ? 'text-[#f59e0b] scale-105' : 'text-[#a89988] hover:text-[#fef3c7]'
        }`}
      >
        <Coffee className="w-5 h-5" />
        <span className="text-[10px] font-medium tracking-wide">Menu</span>
      </button>

      {/* Offers & Deals Button */}
      <button
        onClick={onOffersClick}
        className="relative flex flex-col items-center gap-1 transition-all text-[#f59e0b] hover:scale-105"
      >
        <div className="relative">
          <Bell className="w-5 h-5 text-[#f59e0b] animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#f59e0b] rounded-full animate-ping"></span>
        </div>
        <span className="text-[10px] font-bold text-[#f59e0b] tracking-wide">Offers</span>
      </button>

      <button
        onClick={() => onTabChange('cart')}
        className={`relative flex flex-col items-center gap-1 transition-all ${
          activeTab === 'cart' ? 'text-[#f59e0b] scale-105' : 'text-[#a89988] hover:text-[#fef3c7]'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-[#d97706] text-[#120d0a] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-[#120d0a]">
              {totalCartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide">Cart</span>
      </button>

      <button
        onClick={() => onTabChange(activeOrderCount > 0 ? 'tracking' : 'booking')}
        className={`relative flex flex-col items-center gap-1 transition-all ${
          activeTab === 'booking' || activeTab === 'tracking' ? 'text-[#f59e0b] scale-105' : 'text-[#a89988] hover:text-[#fef3c7]'
        }`}
      >
        <div className="relative">
          {activeOrderCount > 0 ? (
            <Clock className="w-5 h-5 text-[#f59e0b] animate-pulse" />
          ) : (
            <Calendar className="w-5 h-5" />
          )}
          {activeOrderCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
          )}
        </div>
        <span className="text-[10px] font-medium tracking-wide">
          {activeOrderCount > 0 ? 'Track Live' : 'Reserve'}
        </span>
      </button>
    </nav>
  );
};
