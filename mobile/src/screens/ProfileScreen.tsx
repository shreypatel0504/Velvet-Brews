import React from 'react';
import { User, Award, MapPin, History, LogOut, ChevronRight, Gift, ShieldCheck, Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { activeOrders, pastOrders } = useOrderStore();

  if (!user) return null;

  return (
    <div className="pb-safe pt-2 px-4 space-y-5 animate-in fade-in duration-300">

      {/* Profile Card Header */}
      <div className="glass-card p-4 rounded-3xl flex items-center gap-4 relative overflow-hidden border border-[#d97706]/30 shadow-xl">
        <div className="relative">
          <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#f59e0b]" />
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#120d0a]"></span>
        </div>

        <div className="flex-1">
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#f59e0b] text-[#120d0a]">
            {user.membershipTier}
          </span>
          <h3 className="text-base font-bold font-heading text-[#fef3c7] mt-1">{user.name}</h3>
          <p className="text-xs text-[#a89988]">{user.phone}</p>
        </div>
      </div>

      {/* Velvet Club Loyalty Points Widget */}
      <div className="relative rounded-3xl p-4 bg-gradient-to-br from-[#261b15] via-[#1c1410] to-[#120d0a] border border-[#f59e0b]/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#f59e0b]" />
            <h4 className="text-xs font-bold text-[#fef3c7] uppercase tracking-wider">Velvet Club Rewards</h4>
          </div>
          <span className="text-xs font-extrabold text-[#f59e0b] bg-[#f59e0b]/20 px-2.5 py-1 rounded-full border border-[#f59e0b]/40">
            {user.loyaltyPoints} Points
          </span>
        </div>

        <p className="text-[11px] text-[#a89988]">
          Earn 1 point for every ₹10 spent. Unlock free artisanal coffees and dessert treats!
        </p>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-[#a89988]">
            <span>Current Tier</span>
            <span>Next Reward at 500 Pts</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#120d0a] overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-[#d97706] to-[#f59e0b] w-[68%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Settings & Navigation Options */}
      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/5 border border-[#d97706]/20">
        
        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d97706]/10 text-[#f59e0b]">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#fef3c7]">Past Order Receipts</h5>
              <p className="text-[10px] text-[#a89988]">View history & quick re-order</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#a89988]" />
        </div>

        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d97706]/10 text-[#f59e0b]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#fef3c7]">Saved Delivery Addresses</h5>
              <p className="text-[10px] text-[#a89988]">Home, Cyber City Office</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#a89988]" />
        </div>

        <div className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d97706]/10 text-[#f59e0b]">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#fef3c7]">Vouchers & Promo Codes</h5>
              <p className="text-[10px] text-[#a89988]">Active: VELVETAPP (20% OFF)</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#a89988]" />
        </div>

      </div>

      {/* Logout Action Button */}
      <button
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-[#1c1410] border border-red-500/30 text-xs font-bold text-red-400 flex items-center justify-center gap-2 active:scale-98 transition-transform"
      >
        <LogOut className="w-4 h-4" /> Log Out of Velvet Brews
      </button>

    </div>
  );
};
