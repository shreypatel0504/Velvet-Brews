import React, { useState } from 'react';
import { X, Plus, Minus, Coffee, Star, Flame, Check } from 'lucide-react';
import { MenuItem, CustomizationOptions } from '../types';
import { useCartStore } from '../store/useCartStore';
import toast from 'react-hot-toast';

interface ItemCustomizationModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [milk, setMilk] = useState<'Whole Milk' | 'Oat Milk' | 'Almond Milk' | 'Soy Milk' | 'No Milk'>('Oat Milk');
  const [sweetness, setSweetness] = useState<'0%' | '25%' | '50%' | '75%' | '100%'>('50%');
  const [iceLevel, setIceLevel] = useState<'No Ice' | 'Less Ice' | 'Regular Ice' | 'Extra Ice'>('Regular Ice');
  const [extraShots, setExtraShots] = useState(0);

  const extraCost = (extraShots * 40) + (size === 'Large' ? 50 : size === 'Medium' ? 20 : 0);
  const unitPrice = item.price + extraCost;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const customization: CustomizationOptions = {
      size: item.availableCustomizations?.sizes ? size : undefined,
      milk: item.availableCustomizations?.milks ? milk : undefined,
      sweetness: item.availableCustomizations?.sweetness ? sweetness : undefined,
      iceLevel: item.availableCustomizations?.ice ? iceLevel : undefined,
      extraShots: item.availableCustomizations?.extraShots ? extraShots : undefined,
    };

    addItem(item, customization, quantity);
    toast.success(`Added ${item.name} to Cart! ☕`, {
      style: { background: '#1c1410', color: '#fef3c7', border: '1px solid #d97706' }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#18110d] rounded-t-3xl border-t border-[#d97706]/30 overflow-hidden max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* Header Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#18110d] via-transparent to-black/40"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#120d0a]/80 text-[#fef3c7] hover:bg-[#d97706] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
            <div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#d97706] text-[#120d0a]">
                {item.category}
              </span>
              <h3 className="text-xl font-bold font-heading text-[#fef3c7] mt-1 drop-shadow-md">{item.name}</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#120d0a]/80 px-2.5 py-1 rounded-full text-xs text-[#f59e0b]">
              <Star className="w-3.5 h-3.5 fill-[#f59e0b]" />
              <span className="font-bold">{item.rating}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          <p className="text-xs text-[#a89988] leading-relaxed">{item.description}</p>

          {/* Size Selector */}
          {item.availableCustomizations?.sizes && (
            <div>
              <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block mb-2">Select Cup Size</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Small', 'Medium', 'Large'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                      size === s 
                        ? 'bg-[#d97706]/20 border-[#d97706] text-[#f59e0b] shadow-md shadow-[#d97706]/20'
                        : 'bg-[#1c1410] border-white/5 text-[#a89988] hover:text-[#fef3c7]'
                    }`}
                  >
                    <span>{s}</span>
                    <span className="text-[10px] text-[#a89988]">
                      {s === 'Small' ? '250ml' : s === 'Medium' ? '350ml (+₹20)' : '450ml (+₹50)'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Options */}
          {item.availableCustomizations?.milks && (
            <div>
              <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block mb-2">Choice of Milk</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Oat Milk', 'Almond Milk', 'Whole Milk', 'Soy Milk'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMilk(m)}
                    className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                      milk === m
                        ? 'bg-[#d97706]/20 border-[#d97706] text-[#fef3c7]'
                        : 'bg-[#1c1410] border-white/5 text-[#a89988]'
                    }`}
                  >
                    <span>{m}</span>
                    {milk === m && <Check className="w-4 h-4 text-[#f59e0b]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness Slider/Options */}
          {item.availableCustomizations?.sweetness && (
            <div>
              <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block mb-2">Sweetness Level</label>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(['0%', '25%', '50%', '75%', '100%'] as const).map((sw) => (
                  <button
                    key={sw}
                    onClick={() => setSweetness(sw)}
                    className={`flex-1 min-w-[55px] py-2 rounded-lg text-xs font-semibold transition-all border ${
                      sweetness === sw
                        ? 'bg-[#d97706] border-[#d97706] text-[#120d0a]'
                        : 'bg-[#1c1410] border-white/5 text-[#a89988]'
                    }`}
                  >
                    {sw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extra Shots */}
          {item.availableCustomizations?.extraShots && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1c1410] border border-white/5">
              <div>
                <h4 className="text-xs font-bold text-[#fef3c7]">Extra Espresso Shot</h4>
                <p className="text-[10px] text-[#a89988]">+₹40 per shot</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExtraShots(Math.max(0, extraShots - 1))}
                  className="w-7 h-7 rounded-lg bg-[#261b15] text-[#fef3c7] flex items-center justify-center border border-white/10"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#f59e0b]">{extraShots}</span>
                <button
                  onClick={() => setExtraShots(extraShots + 1)}
                  className="w-7 h-7 rounded-lg bg-[#d97706] text-[#120d0a] flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#120d0a] border-t border-[#d97706]/20 flex items-center gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-[#1c1410] border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#a89988] hover:text-[#fef3c7]"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-[#f59e0b]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-[#a89988] hover:text-[#fef3c7]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#120d0a] font-bold text-sm font-heading flex items-center justify-between shadow-lg shadow-[#d97706]/25 active:scale-98 transition-all"
          >
            <span>Add to Order</span>
            <span>₹{totalPrice}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
