import React, { useState, useDeferredValue, useMemo, memo, useCallback } from 'react';
import { Search, Star, Coffee } from 'lucide-react';
import { MOBILE_MENU_ITEMS } from '../data/menu';
import { MenuItem, MenuItemCategory } from '../types';

const CATEGORIES: MenuItemCategory[] = [
  'All', 'Espresso', 'Cold Brews', 'Signatures', 'Teas & Matcha', 'Pastries', 'Desserts'
];

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

// Memoized card — re-renders ONLY if item ref changes (never during scroll)
const MenuItemCard = memo(({ item, onSelect }: MenuItemCardProps) => {
  const handleClick = useCallback(() => onSelect(item), [item, onSelect]);
  const handleBtnClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(item);
  }, [item, onSelect]);

  return (
    <div className="contain-card">
      <div
        onClick={handleClick}
        className="glass-card p-3 rounded-2xl flex gap-3 cursor-pointer touch-btn border border-[#d97706]/15 hover:border-[#d97706]/40"
      >
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 gpu-layer">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
          {item.isPopular && (
            <span className="absolute top-1 left-1 bg-[#d97706] text-[#120d0a] text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
              HOT
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#fef3c7] font-heading">{item.name}</h4>
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#f59e0b]">
                <Star className="w-3 h-3 fill-[#f59e0b]" /> {item.rating}
              </div>
            </div>
            <p className="text-[10px] text-[#a89988] line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-extrabold text-[#f59e0b]">₹{item.price}</span>
            <button
              onClick={handleBtnClick}
              className="px-3 py-1 rounded-xl bg-[#d97706]/20 border border-[#d97706]/40 text-[#f59e0b] font-bold text-xs hover:bg-[#d97706] hover:text-[#120d0a] transition-colors active:scale-95"
            >
              Customize +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
MenuItemCard.displayName = 'MenuItemCard';

interface MenuScreenProps {
  onSelectItem: (item: MenuItem) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectItem }) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuItemCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredQuery = useDeferredValue(searchQuery);

  // Memoized O(n) filter — runs only when deps change, NOT on every render
  const filteredItems = useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();
    return MOBILE_MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, deferredQuery]);

  const handleSelect = useCallback((item: MenuItem) => {
    onSelectItem(item);
  }, [onSelectItem]);

  return (
    <div className="pb-safe pt-2 px-4 space-y-4">

      {/* Search Input */}
      <div className="relative gpu-layer">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#a89988]" />
        <input
          type="text"
          placeholder="Search cold brews, espresso, pastries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1c1410] border border-[#d97706]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#fef3c7] placeholder-[#a89988] focus:outline-none focus:border-[#d97706] shadow-inner"
        />
      </div>

      {/* Category Horizontal Filter Pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 gpu-layer">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border touch-btn ${
              selectedCategory === cat
                ? 'bg-[#d97706] border-[#d97706] text-[#120d0a] shadow-md shadow-[#d97706]/30'
                : 'bg-[#1c1410] border-white/5 text-[#a89988] hover:text-[#fef3c7]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Item Grid — virtualized with content-visibility */}
      <div className="grid grid-cols-1 gap-3">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onSelect={handleSelect}
          />
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <Coffee className="w-10 h-10 text-[#a89988] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#a89988]">No brews found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

    </div>
  );
};
