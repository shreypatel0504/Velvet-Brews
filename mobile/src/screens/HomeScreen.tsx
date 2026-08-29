import React from 'react';
import { Coffee, Flame, Sparkles, ArrowRight, Star, Clock, Calendar, ChevronRight } from 'lucide-react';
import { MOBILE_MENU_ITEMS } from '../data/menu';
import { MenuItem } from '../types';
import { useOrderStore } from '../store/useOrderStore';

interface HomeScreenProps {
  onSelectItem: (item: MenuItem) => void;
  onNavigateTab: (tab: any) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectItem, onNavigateTab }) => {
  const { activeOrders } = useOrderStore();
  const popularItems = MOBILE_MENU_ITEMS.filter(i => i.isPopular);

  return (
    <div className="pb-safe pt-2 px-4 space-y-6 animate-in fade-in duration-300">

      {/* Active Order Banner (If any) */}
      {activeOrders.length > 0 && (
        <div 
          onClick={() => onNavigateTab('tracking')}
          className="glass-card p-3 rounded-2xl border-l-4 border-l-[#f59e0b] flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b]">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#f59e0b] tracking-wider">Active Order #{activeOrders[0].id}</span>
              <h4 className="text-xs font-bold text-[#fef3c7]">{activeOrders[0].status}...</h4>
              <p className="text-[10px] text-[#a89988]">Tap to view live barista status</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#f59e0b]" />
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#d97706]/30 shadow-xl gpu-layer">
        <img 
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800" 
          alt="Velvet Brews Atmosphere" 
          loading="eager"
          decoding="async"
          className="w-full h-44 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120d0a] via-[#120d0a]/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#f59e0b] text-[#120d0a] w-fit">
            <Sparkles className="w-3 h-3" /> Special Offer
          </span>
          <h2 className="text-lg font-extrabold font-heading text-[#fef3c7] drop-shadow-md">
            20% Off Your First Mobile Order
          </h2>
          <p className="text-xs text-[#a89988]">Use Code: <span className="text-[#f59e0b] font-bold">VELVETAPP</span> at checkout</p>
        </div>
      </div>

      {/* Quick Category Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-heading text-[#fef3c7] flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-[#f59e0b]" /> Explore Menu
          </h3>
          <button 
            onClick={() => onNavigateTab('menu')}
            className="text-xs font-semibold text-[#f59e0b] hover:underline flex items-center gap-1"
          >
            See All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'Cold Brews', label: 'Cold Brews', icon: '🧊' },
            { id: 'Espresso', label: 'Espresso', icon: '☕' },
            { id: 'Signatures', label: 'Signatures', icon: '✨' },
            { id: 'Teas & Matcha', label: 'Matcha', icon: '🍵' },
            { id: 'Pastries', label: 'Pastries', icon: '🥐' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateTab('menu')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-[#1c1410] border border-[#d97706]/20 text-xs font-semibold text-[#fef3c7] whitespace-nowrap active:scale-95 transition-all shadow-md"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Brews Horizontal Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-heading text-[#fef3c7] flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#d97706]" /> Customer Favorites
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 gpu-layer">
          {popularItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="min-w-[160px] max-w-[160px] glass-card rounded-2xl overflow-hidden cursor-pointer touch-btn flex flex-col contain-h-card"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-[#120d0a]/80 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#f59e0b] flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-[#f59e0b]" /> {item.rating}
                </div>
              </div>
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#fef3c7] line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-[#a89988] line-clamp-1 mt-0.5">{item.category}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-extrabold text-[#f59e0b]">₹{item.price}</span>
                  <button className="w-6 h-6 rounded-lg bg-[#d97706] text-[#120d0a] font-bold flex items-center justify-center text-xs shadow">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Reservation Card Teaser */}
      <div 
        onClick={() => onNavigateTab('booking')}
        className="relative rounded-2xl p-4 bg-gradient-to-r from-[#261b15] to-[#1a120e] border border-[#d97706]/30 shadow-lg flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
      >
        <div className="space-y-1 max-w-[70%]">
          <span className="text-[10px] uppercase font-bold text-[#f59e0b] tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Dining Experience
          </span>
          <h3 className="text-sm font-bold font-heading text-[#fef3c7]">Reserve a Cozy Table</h3>
          <p className="text-[11px] text-[#a89988]">Skip the wait at Cyber Hub. Pick your favorite corner table.</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#d97706] text-[#120d0a] font-bold flex items-center justify-center shadow-lg shadow-[#d97706]/30">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

    </div>
  );
};
