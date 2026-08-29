import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, ArrowRight, MapPin, Coffee, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useOrderStore } from '../store/useOrderStore';
import { Order, OrderType } from '../types';
import toast from 'react-hot-toast';

interface CartScreenProps {
  onOrderPlaced: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onOrderPlaced }) => {
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const tableNumber = useCartStore((s) => s.tableNumber);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const setOrderType = useCartStore((s) => s.setOrderType);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const applyPromoCode = useCartStore((s) => s.applyPromoCode);
  const removePromoCode = useCartStore((s) => s.removePromoCode);

  const { addOrder } = useOrderStore();
  const [promoCode, setPromoCode] = useState(appliedPromo?.code || '');

  const { subtotal, discount, deliveryFee, tax, total } = getCartTotal();
  const finalTotal = total;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'VELVETAPP' || code === 'COLD30' || code === 'RAINWARMTH' || code === 'HAPPY20' || code === 'BOGOPIZZA') {
      const pct = code === 'COLD30' ? 30 : code === 'BOGOPIZZA' ? 50 : 20;
      applyPromoCode(code, pct, `${pct}% Discount`);
      toast.success(`${pct}% "${code}" discount applied!`, {
        style: { background: '#1c1410', color: '#fef3c7', border: '1px solid #d97706' }
      });
    } else {
      applyPromoCode(code, 15, "Special Promo Deal");
      toast.success(`15% "${code}" discount applied!`, {
        style: { background: '#1c1410', color: '#fef3c7', border: '1px solid #d97706' }
      });
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    const newOrder: Order = {
      id: `VB-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...items],
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      totalAmount: finalTotal,
      status: 'Received',
      createdAt: 'Just now',
      estimatedDeliveryMinutes: orderType === 'delivery' ? 25 : 10
    };

    addOrder(newOrder);
    clearCart();
    toast.success(`Order ${newOrder.id} Placed Successfully! ☕`, {
      style: { background: '#1c1410', color: '#fef3c7', border: '1px solid #d97706' }
    });
    onOrderPlaced();
  };

  if (items.length === 0) {
    return (
      <div className="pb-safe pt-12 px-4 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[#1c1410] border border-[#d97706]/20 flex items-center justify-center mx-auto text-[#a89988]">
          <ShoppingBag className="w-8 h-8 text-[#d97706]" />
        </div>
        <h3 className="text-base font-bold text-[#fef3c7] font-heading">Your Cart is Empty</h3>
        <p className="text-xs text-[#a89988] max-w-xs mx-auto">
          Explore our artisanal brews, cold coffees, and warm croissants to start your order.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-safe pt-2 px-4 space-y-5 animate-in fade-in duration-300">

      {/* Order Type Toggle */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#1c1410] rounded-2xl border border-white/5">
        {(['dine-in', 'takeaway', 'delivery'] as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              orderType === type
                ? 'bg-[#d97706] text-[#120d0a] shadow-md shadow-[#d97706]/30'
                : 'text-[#a89988] hover:text-[#fef3c7]'
            }`}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Dynamic Location / Table Inputs */}
      {orderType === 'dine-in' && (
        <div className="glass-card p-3 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#fef3c7]">
            <UtensilsCrossed className="w-4 h-4 text-[#f59e0b]" />
            <span>Table Assignment:</span>
          </div>
          <select
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="bg-[#120d0a] border border-[#d97706]/30 rounded-xl px-2 py-1 text-xs text-[#f59e0b] font-bold outline-none"
          >
            <option value="Table 1">Table 1 (Indoor)</option>
            <option value="Table 4 (Cozy Window)">Table 4 (Cozy Window)</option>
            <option value="VIP Booth 2">VIP Booth 2</option>
            <option value="Outdoor Terrace 3">Outdoor Terrace 3</option>
          </select>
        </div>
      )}

      {orderType === 'delivery' && (
        <div className="glass-card p-3 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-[#f59e0b] font-bold">
            <MapPin className="w-4 h-4" /> Delivery Address
          </div>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full bg-[#120d0a] border border-white/10 rounded-xl p-2 text-xs text-[#fef3c7] outline-none focus:border-[#d97706]"
          />
        </div>
      )}

      {/* Cart Items List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">Order Items ({items.length})</h4>
        {items.map((item) => (
          <div key={item.cartItemId} className="glass-card p-3 rounded-2xl flex items-center gap-3">
            <img src={item.menuItem.image} alt={item.menuItem.name} loading="lazy" decoding="async" className="w-14 h-14 rounded-xl object-cover" />

            <div className="flex-1">
              <h5 className="text-xs font-bold text-[#fef3c7]">{item.menuItem.name}</h5>
              
              {/* Customization Details */}
              <div className="text-[10px] text-[#a89988] space-x-1">
                {item.customization.size && <span>{item.customization.size} •</span>}
                {item.customization.milk && <span>{item.customization.milk} •</span>}
                {item.customization.sweetness && <span>Sweet: {item.customization.sweetness}</span>}
              </div>

              <span className="text-xs font-extrabold text-[#f59e0b] mt-1 block">₹{item.totalPrice}</span>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 bg-[#120d0a] border border-white/10 rounded-xl p-1">
              <button
                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                className="w-6 h-6 rounded-lg text-[#a89988] flex items-center justify-center"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-[#fef3c7] w-4 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                className="w-6 h-6 rounded-lg text-[#a89988] flex items-center justify-center"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Promo code (e.g. VELVETAPP)"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          className="flex-1 bg-[#1c1410] border border-[#d97706]/20 rounded-xl px-3 py-2 text-xs text-[#fef3c7] uppercase placeholder-[#a89988] outline-none"
        />
        <button
          onClick={handleApplyPromo}
          className="px-4 py-2 bg-[#d97706]/20 border border-[#d97706] text-[#f59e0b] font-bold text-xs rounded-xl hover:bg-[#d97706] hover:text-[#120d0a] transition-all"
        >
          Apply
        </button>
      </div>

      {/* Price Summary Card */}
      <div className="glass-card p-4 rounded-2xl space-y-2 text-xs">
        <div className="flex justify-between text-[#a89988]">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {orderType === 'delivery' && (
          <div className="flex justify-between text-[#a89988]">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>
        )}
        <div className="flex justify-between text-[#a89988]">
          <span>GSTA & Taxes (5%)</span>
          <span>₹{tax}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span>Promo Discount</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-extrabold text-[#fef3c7]">
          <span>Total Amount</span>
          <span className="text-[#f59e0b]">₹{finalTotal}</span>
        </div>
      </div>

      {/* Pay & Checkout Button */}
      <button
        onClick={handleCheckout}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] text-[#120d0a] font-bold text-sm font-heading flex items-center justify-between shadow-xl shadow-[#d97706]/30 active:scale-98 transition-all"
      >
        <span className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Place Mobile Order
        </span>
        <span className="flex items-center gap-1">
          ₹{finalTotal} <ArrowRight className="w-4 h-4" />
        </span>
      </button>

    </div>
  );
};
