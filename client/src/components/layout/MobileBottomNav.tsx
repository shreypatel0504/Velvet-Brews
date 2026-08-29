import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Coffee, Calendar, ShoppingBag, Clock, Bell, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { motion, AnimatePresence } from "framer-motion";

export const MobileBottomNav = () => {
  const location = useLocation();
  const cartItems = useCartStore((s) => s.items);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const setNotificationOpen = useCartStore((s) => s.setNotificationOpen);
  const setHasUnreadNotification = useCartStore((s) => s.setHasUnreadNotification);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const totalItems = React.useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return getTotalPrice();
  }, [cartItems, getTotalPrice]);

  // Hide bottom nav on admin routes to prevent overlap
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Floating Swiggy-style Cart Bar when items exist */}
      <AnimatePresence>
        {totalItems > 0 && location.pathname !== '/checkout' && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-16 left-3 right-3 z-40 md:hidden gpu-layer"
          >
            <div 
              onClick={() => setCartDrawerOpen(true)}
              className="bg-gradient-to-r from-[var(--color-cafe-primary)] to-[#6b4728] text-white px-4 py-3 rounded-2xl shadow-xl shadow-amber-950/20 flex items-center justify-between cursor-pointer border border-amber-300/30 backdrop-blur-md active:scale-[0.98] transition-transform gpu-layer"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl text-white shadow-xs">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block text-amber-200 leading-none">
                    {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'} IN CART
                  </span>
                  <span className="text-base font-extrabold text-white">
                    ₹{totalPrice} <span className="text-[10px] font-normal text-amber-200/80">+ taxes</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-bold text-xs bg-white text-[var(--color-cafe-primary)] px-3.5 py-1.5 rounded-xl shadow-md">
                <span>View Cart</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-950/10 px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),6px)] md:hidden shadow-2xl gpu-layer">
        <div className="flex items-center justify-around">
          {/* Menu Link */}
          <Link
            to="/menu"
            className="relative flex flex-col items-center py-1 px-2.5 active:scale-90 transition-transform"
          >
            <div className="flex flex-col items-center">
              <Coffee className={`h-5 w-5 transition-colors ${location.pathname === '/menu' || location.pathname === '/' ? "text-[var(--color-cafe-primary)] stroke-[2.5]" : "text-gray-400"}`} />
              <span className={`text-[10px] mt-0.5 transition-colors ${location.pathname === '/menu' || location.pathname === '/' ? "text-[var(--color-cafe-primary)] font-bold" : "text-gray-500 font-medium"}`}>
                Menu
              </span>
            </div>
            {(location.pathname === '/menu' || location.pathname === '/') && (
              <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--color-cafe-primary)] shadow-2xs" />
            )}
          </Link>

          {/* Dedicated Live Offers & Notifications Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setNotificationOpen(true);
              setHasUnreadNotification(false);
            }}
            className="relative flex flex-col items-center py-1 px-2.5 cursor-pointer active:scale-90 transition-transform"
          >
            <div className="relative">
              <Bell className="h-5 w-5 text-amber-600 animate-wiggle" />
              {/* Pulsing Alert Ping */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600"></span>
              </span>
            </div>
            <span className="text-[10px] mt-0.5 text-amber-700 font-bold flex items-center gap-0.5">
              Offers <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded-full font-extrabold">NEW</span>
            </span>
          </button>

          {/* Book Table Link */}
          <Link
            to="/reservation"
            className="relative flex flex-col items-center py-1 px-2.5 active:scale-90 transition-transform"
          >
            <div className="flex flex-col items-center">
              <Calendar className={`h-5 w-5 transition-colors ${location.pathname === '/reservation' ? "text-[var(--color-cafe-primary)] stroke-[2.5]" : "text-gray-400"}`} />
              <span className={`text-[10px] mt-0.5 transition-colors ${location.pathname === '/reservation' ? "text-[var(--color-cafe-primary)] font-bold" : "text-gray-500 font-medium"}`}>
                Book Table
              </span>
            </div>
            {location.pathname === '/reservation' && (
              <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--color-cafe-primary)] shadow-2xs" />
            )}
          </Link>

          {/* Track Link */}
          <Link
            to="/track/live"
            className="relative flex flex-col items-center py-1 px-2.5 active:scale-90 transition-transform"
          >
            <div className="flex flex-col items-center">
              <Clock className={`h-5 w-5 transition-colors ${location.pathname.startsWith('/track') ? "text-[var(--color-cafe-primary)] stroke-[2.5]" : "text-gray-400"}`} />
              <span className={`text-[10px] mt-0.5 transition-colors ${location.pathname.startsWith('/track') ? "text-[var(--color-cafe-primary)] font-bold" : "text-gray-500 font-medium"}`}>
                Track
              </span>
            </div>
            {location.pathname.startsWith('/track') && (
              <div className="absolute -bottom-1 h-1 w-5 rounded-full bg-[var(--color-cafe-primary)] shadow-2xs" />
            )}
          </Link>

          {/* Cart Icon in Nav */}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="flex flex-col items-center py-1 px-2.5 relative cursor-pointer active:scale-90 transition-transform"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[var(--color-cafe-primary)] text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 text-gray-500 font-medium">Cart</span>
          </button>
        </div>
      </div>
    </>
  );
};

