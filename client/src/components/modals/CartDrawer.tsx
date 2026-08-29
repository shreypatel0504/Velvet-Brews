import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Utensils, 
  ShoppingBag as BagIcon, 
  Truck, 
  MapPin, 
  ArrowRight, 
  Trash2, 
  Search, 
  Banknote,
  Tag,
  Check,
  Sparkles
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { LocationSearchModal } from "./LocationSearchModal";
import toast from "react-hot-toast";

export const CartDrawer = () => {
  const navigate = useNavigate();
  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [activeBroadcastOffer, setActiveBroadcastOffer] = useState<any | null>(null);

  const {
    items,
    isCartDrawerOpen,
    setCartDrawerOpen,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    updateQuantity,
    removeItem,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    getRawSubtotal,
    getDiscountAmount
  } = useCartStore();

  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  useEffect(() => {
    // Check if there is an active broadcast promo
    fetch('/api/notifications/active')
      .then(r => r.json())
      .then(d => {
        if (d?.activeOffer?.code) {
          setActiveBroadcastOffer(d.activeOffer);
        }
      })
      .catch(() => {});
  }, [isCartDrawerOpen]);

  const rawSubtotal = getRawSubtotal();
  const discountAmount = getDiscountAmount();
  const subtotalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const deliveryFee = orderType === 'delivery' ? 30 : 0;
  const gst = subtotalAfterDiscount * 0.05;
  const total = subtotalAfterDiscount + deliveryFee + gst;

  const handleApplyCustomPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const code = promoInput.toUpperCase().trim();
    
    // Check predefined match or custom
    if (activeBroadcastOffer && activeBroadcastOffer.code === code) {
      applyPromoCode(code, activeBroadcastOffer.discountPercent || 20, activeBroadcastOffer.title);
      toast.success(`🎉 Promo code "${code}" applied! You saved ₹${Math.round((rawSubtotal * (activeBroadcastOffer.discountPercent || 20)) / 100)}`);
    } else if (code === 'VELVET20' || code === 'COLD30' || code === 'RAINWARMTH' || code === 'HAPPY20') {
      const pct = code === 'COLD30' ? 30 : 20;
      applyPromoCode(code, pct, `${pct}% Cafe Discount`);
      toast.success(`🎉 Promo "${code}" applied with ${pct}% discount!`);
    } else {
      // Default 15% discount for any promo code
      applyPromoCode(code, 15, "Special Promo Deal");
      toast.success(`🎉 Promo "${code}" applied with 15% discount!`);
    }
    setPromoInput("");
  };

  const handleAddMore = () => {
    setCartDrawerOpen(false);
    navigate('/menu');
  };

  const handleSelectDelivery = () => {
    setOrderType('delivery');
    setIsLocationModalOpen(true);
  };

  return (
    <>
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <AnimatePresence>
        {isCartDrawerOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 w-full max-w-md flex pointer-events-auto">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="w-full h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden border-l border-amber-900/10"
              >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 bg-[var(--color-cafe-background)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-[var(--color-cafe-text-primary)]">Your Order</h2>
                    <p className="text-xs text-[var(--color-cafe-text-secondary)]">{items.length} items selected</p>
                  </div>
                </div>

                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Order Type Selector (Dine-in, Takeaway, Delivery) */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 px-1">Choose Service Type</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine-in')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      orderType === 'dine-in'
                        ? 'bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Utensils className="h-4 w-4 mb-1" />
                    Eat In (Dine-In)
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      orderType === 'takeaway'
                        ? 'bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <BagIcon className="h-4 w-4 mb-1" />
                    Takeaway
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectDelivery}
                    className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      orderType === 'delivery'
                        ? 'bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="h-4 w-4 mb-1" />
                    Delivery
                  </button>
                </div>

                {/* Dynamic Service Sub-Options */}
                {orderType === 'dine-in' && (
                  <div className="mt-3 flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200 text-xs">
                    <span className="font-semibold text-gray-700">Seating Table:</span>
                    <select
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="font-bold text-[var(--color-cafe-primary)] bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200 focus:outline-none"
                    >
                      <option value="Table 1">Table 1 (2 Seater)</option>
                      <option value="Table 2">Table 2 (2 Seater)</option>
                      <option value="Table 3">Table 3 (4 Seater)</option>
                      <option value="Table 4">Table 4 (4 Seater)</option>
                      <option value="Table 5">Table 5 (6 Seater)</option>
                      <option value="Table 6">Table 6 (4 Seater)</option>
                    </select>
                  </div>
                )}

                {orderType === 'takeaway' && (
                  <div className="mt-3 bg-amber-50 border border-amber-200/70 p-2.5 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                    <span className="font-medium">🛍️ Express Pickup in 15 mins</span>
                    <span className="font-bold">No Charge</span>
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div className="mt-3 space-y-2">
                    <div 
                      onClick={() => setIsLocationModalOpen(true)}
                      className="flex items-center justify-between gap-2 bg-white px-3 py-2.5 rounded-xl border border-gray-200 text-xs cursor-pointer hover:border-[var(--color-cafe-primary)] transition-all shadow-xs group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <MapPin className="h-4 w-4 text-[var(--color-cafe-primary)] shrink-0" />
                        <span className="font-medium text-gray-800 truncate">
                          {deliveryAddress ? deliveryAddress : "Search delivery area, street..."}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--color-cafe-primary)] font-bold shrink-0">
                        <Search className="h-3.5 w-3.5" />
                        <span>Search</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl text-xs text-emerald-900 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Banknote className="h-4 w-4 text-emerald-600 shrink-0" />
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        Available 💵
                      </span>
                    </div>

                    <div className="flex justify-between text-[11px] text-gray-500 px-1">
                      <span>Doorstep delivery charge:</span>
                      <span className="font-bold text-[var(--color-cafe-primary)]">+ ₹30</span>
                    </div>
                  </div>
                )}
              </div>

            {/* Cart Items Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300 stroke-1" />
                  <h3 className="font-bold text-gray-700 text-base mb-1">Your cart is empty</h3>
                  <p className="text-xs text-gray-400 mb-6">Explore our handcrafted dishes and drinks!</p>
                  <Button onClick={handleAddMore} className="rounded-xl px-6">
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <>
                  {items.map((item) => {
                    const itemKey = item.cartItemId || item.id;
                    return (
                      <div key={itemKey} className="flex items-center gap-4 p-3 bg-gray-50/80 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=200&q=80";
                          }}
                          className="h-16 w-16 rounded-xl object-cover shadow-xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[var(--color-cafe-text-primary)] truncate">{item.name}</h4>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {item.customizations.map((c, i) => (
                                <span key={i} className="text-[9px] font-bold bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded-md">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="font-bold text-sm text-[var(--color-cafe-primary)] mt-1">₹{item.price * item.quantity}</p>
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 border border-gray-200 shadow-2xs">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) updateQuantity(itemKey, item.quantity - 1);
                              else removeItem(itemKey);
                            }}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(itemKey)}
                          className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Promo Coupon Section */}
                  <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-dashed border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-amber-700" /> Promo & Discount Coupons
                      </span>
                      {appliedPromo && (
                        <button
                          onClick={removePromoCode}
                          className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300 text-xs shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-emerald-800 tracking-wide">{appliedPromo.code}</span>
                            <span className="text-[10px] text-gray-500 block">({appliedPromo.discountPercent}% Discount Applied)</span>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-700">-₹{discountAmount}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCustomPromo} className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          placeholder={activeBroadcastOffer?.code ? `e.g. ${activeBroadcastOffer.code}` : "Enter Coupon Code"}
                          className="flex-1 text-xs uppercase font-mono px-3 py-2 bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[var(--color-cafe-primary)] text-white text-xs font-bold rounded-xl hover:bg-amber-900 transition-colors shadow-2xs cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {/* Quick Apply Active Offer Pill */}
                    {!appliedPromo && activeBroadcastOffer?.code && (
                      <button
                        type="button"
                        onClick={() => {
                          applyPromoCode(activeBroadcastOffer.code, activeBroadcastOffer.discountPercent || 20, activeBroadcastOffer.title);
                          toast.success(`Applied ${activeBroadcastOffer.code}!`);
                        }}
                        className="w-full text-left text-[11px] font-medium text-amber-800 bg-amber-100/60 hover:bg-amber-100 p-2 rounded-xl border border-amber-200/80 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>Tap to Apply <b>{activeBroadcastOffer.code}</b> ({activeBroadcastOffer.discountPercent || 20}% OFF)</span>
                        </span>
                        <span className="font-bold text-[var(--color-cafe-primary)] shrink-0 ml-1">Apply →</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer Summary & Actions */}
            {items.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-100 bg-white shadow-xl space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-1.5 text-xs text-[var(--color-cafe-text-secondary)]">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-gray-800">₹{rawSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount ({appliedPromo?.code}):</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-amber-800">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold">+ ₹{deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>GST (5%):</span>
                    <span className="font-semibold text-gray-800">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[var(--color-cafe-text-primary)] pt-2 border-t border-gray-100">
                    <span>Total Amount:</span>
                    <span className="text-[var(--color-cafe-primary)]">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions: Add More Items & Proceed to Checkout */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddMore}
                    className="h-12 text-xs sm:text-sm font-semibold rounded-xl border-gray-300 gap-1 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add More
                  </Button>

                  <Link to="/checkout" onClick={() => setCartDrawerOpen(false)} className="w-full">
                    <Button className="w-full h-12 text-xs sm:text-sm font-bold rounded-xl gap-2 shadow-lg shadow-[var(--color-cafe-primary)]/20 cursor-pointer">
                      Checkout <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
