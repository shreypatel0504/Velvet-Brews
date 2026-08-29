import React from 'react';
import { Coffee, MapPin, Bell, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';

interface MobileHeaderProps {
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onNotificationClick, onProfileClick }) => {
  const user = useAuthStore((s) => s.user);
  const activeOrders = useOrderStore((s) => s.activeOrders);

  return (
    <header className="sticky top-0 z-40 bg-[#120d0a]/95 backdrop-blur-lg border-b border-[#d97706]/20 px-4 py-3 flex items-center justify-between shadow-lg gpu-layer">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#b45309] to-[#f59e0b] p-[2px] shadow-md shadow-[#d97706]/30">
            <div className="w-full h-full bg-[#120d0a] rounded-full flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#f59e0b]" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#120d0a]"></span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#d97706] font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Cyber Hub Branch</span>
          </div>
          <h1 className="text-sm font-bold text-[#fef3c7] font-heading tracking-wide flex items-center gap-1">
            Velvet Brews <Sparkles className="w-3 h-3 text-[#f59e0b] fill-[#f59e0b]" />
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onNotificationClick || onProfileClick}
          className="relative p-2 rounded-full bg-[#1c1410] border border-[#d97706]/20 text-[#fef3c7] hover:border-[#d97706]/50 transition-all active:scale-95"
        >
          <Bell className="w-4 h-4 text-[#fef3c7]" />
          {activeOrders.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#f59e0b] rounded-full animate-ping"></span>
          )}
        </button>

        {user && (
          <button 
            onClick={onProfileClick}
            className="flex items-center gap-1.5 bg-[#261b15] border border-[#d97706]/30 rounded-full py-1 px-2.5 text-xs text-[#fef3c7] active:scale-95 transition-transform"
          >
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-[#f59e0b]" />
            <span className="font-semibold text-[#f59e0b] hidden xs:inline">{user.loyaltyPoints} pts</span>
          </button>
        )}
      </div>
    </header>
  );
};
