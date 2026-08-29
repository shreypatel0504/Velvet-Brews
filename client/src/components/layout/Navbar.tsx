import * as React from "react";
import { Link } from "react-router-dom";
import { Coffee, Menu, X, User, LogOut, ShoppingBag, Star, Calendar, Sparkles, MapPin, Bell, Flame } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { LocationSearchModal } from "@/components/modals/LocationSearchModal";
import { socket } from "@/utils/socket";
import toast from "react-hot-toast";

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = React.useState(false);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const items = useCartStore((s) => s.items);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const deliveryAddress = useCartStore((s) => s.deliveryAddress);
  const setNotificationOpen = useCartStore((s) => s.setNotificationOpen);
  const hasUnreadNotification = useCartStore((s) => s.hasUnreadNotification);
  const setHasUnreadNotification = useCartStore((s) => s.setHasUnreadNotification);
  const activeOffer = useCartStore((s) => s.activeOffer);
  const setActiveOffer = useCartStore((s) => s.setActiveOffer);

  const cartCount = React.useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  React.useEffect(() => {
    // Initial fetch of active offer
    fetch('/api/notifications/active')
      .then(r => r.json())
      .then(data => {
        if (data?.activeOffer) {
          setActiveOffer(data.activeOffer);
        }
      })
      .catch(() => {});

    const handleBroadcast = (offer: any) => {
      setActiveOffer(offer);
    };

    const handleClear = () => {
      setActiveOffer(null);
    };

    socket.on('new-offer-broadcast', handleBroadcast);
    socket.on('offer-cleared', handleClear);

    return () => {
      socket.off('new-offer-broadcast', handleBroadcast);
      socket.off('offer-cleared', handleClear);
    };
  }, [setActiveOffer]);

  const handleLogout = React.useCallback(() => {
    logout();
    toast.success("Logged out successfully");
  }, [logout]);

  const handleOpenNotifications = React.useCallback(() => {
    setNotificationOpen(true);
    setHasUnreadNotification(false);
  }, [setNotificationOpen, setHasUnreadNotification]);

  return (
    <>
      <LocationSearchModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      <nav 
        className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 18, scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="p-1.5 rounded-xl bg-gradient-to-br from-amber-700/10 to-amber-900/20 text-[var(--color-cafe-primary)]"
              >
                <Coffee className="h-6 w-6 text-[var(--color-cafe-primary)] transition-transform duration-300" />
              </motion.div>
              <span className="font-heading text-xl font-bold tracking-tight text-[var(--color-cafe-primary)] group-hover:text-amber-900 transition-colors">
                Velvet Brews
              </span>
            </Link>

            {/* Delivery Location Pill */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs font-semibold hover:bg-amber-100 hover:border-amber-300 transition-all shadow-2xs cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-[var(--color-cafe-primary)] shrink-0 animate-bounce" />
              <span className="truncate max-w-[130px]">
                {deliveryAddress ? deliveryAddress.split(',')[0] : "Deliver to Vesu..."}
              </span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded-full">Change ▼</span>
            </motion.button>
          </div>

        {/* Desktop & Tablet Nav */}
        <div className="hidden md:flex md:items-center md:gap-3 lg:gap-6">
          <Link to="/menu" className="text-xs lg:text-sm font-medium text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105">Menu</Link>
          <Link to="/reservation" className="text-xs lg:text-sm font-semibold text-[var(--color-cafe-primary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105 flex items-center gap-1 bg-[var(--color-cafe-primary)]/10 px-2.5 lg:px-3 py-1.5 rounded-full border border-[var(--color-cafe-primary)]/20 shadow-2xs">
            <Calendar className="h-3.5 w-3.5" /> Book Table
          </Link>
          <Link to="/ambiance" className="text-xs lg:text-sm font-medium text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Ambiance
          </Link>
          <Link to="/reviews" className="text-xs lg:text-sm font-medium text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Reviews
          </Link>
          <Link to="/about" className="text-xs lg:text-sm font-medium text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105">About</Link>
          <Link to="/contact" className="text-xs lg:text-sm font-medium text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-all hover:scale-105">Contact</Link>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* Dedicated Offers & Deals Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenNotifications}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-full transition-all shadow-2xs cursor-pointer"
              title="Special Deals & Live Offers"
            >
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
              <span>Offers</span>
              {hasUnreadNotification ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
              ) : (
                <span className="text-[9px] bg-amber-500/20 text-amber-800 px-1 rounded-full font-extrabold">NEW</span>
              )}
            </motion.button>

            {/* Cart Drawer Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 lg:p-2.5 text-gray-700 hover:text-[var(--color-cafe-primary)] hover:bg-amber-100/50 rounded-full transition-colors cursor-pointer"
              title="Open Cart Drawer"
            >
              <ShoppingBag className="h-5 w-5" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className="absolute -top-1 -right-1 bg-[var(--color-cafe-primary)] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {user ? (
              <div className="flex items-center gap-2 lg:gap-3 bg-[var(--color-cafe-primary)]/10 px-2.5 lg:px-3 py-1.5 rounded-full border border-[var(--color-cafe-primary)]/20 shadow-2xs">
                <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-[var(--color-cafe-primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </div>
                <div className="text-xs text-left hidden sm:block">
                  <p className="font-bold text-[var(--color-cafe-text-primary)] leading-tight truncate max-w-[90px] lg:max-w-[130px]">{user.name}</p>
                  <p className="text-[var(--color-cafe-text-secondary)] capitalize text-[10px]">{user.role || 'Customer'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="ml-1 text-gray-500 hover:text-red-600 transition-colors p-1"
                >
                  <LogOut className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs lg:text-sm px-2.5 lg:px-4">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="text-xs lg:text-sm px-3 lg:px-4">Order Now</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Nav Toggle & Icons */}
        <div className="flex items-center gap-1 sm:gap-2 md:hidden">
          {/* Mobile Offers Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleOpenNotifications}
            className="relative flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-500/15 border border-amber-500/30 rounded-full cursor-pointer"
            title="Offers & Deals"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-600" />
            <span className="text-[11px]">Offers</span>
            {hasUnreadNotification && (
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping" />
            )}
          </motion.button>

          {/* Mobile Cart Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setCartDrawerOpen(true)}
            className="relative p-2 text-gray-700 hover:text-[var(--color-cafe-primary)] rounded-full transition-colors cursor-pointer"
            title="Open Cart Drawer"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-1 bg-[var(--color-cafe-primary)] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => setIsOpen(!isOpen)} 
            className="p-2 text-[var(--color-cafe-text-primary)] cursor-pointer"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-amber-950/10 bg-white/95 backdrop-blur-2xl shadow-xl overflow-hidden"
          >
            <div className="flex flex-col space-y-4 px-5 py-6">
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleOpenNotifications();
                }}
                className="w-full text-left font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 text-sm">
                  <Bell className="h-4 w-4 text-amber-600" /> Special Deals & Offers
                </span>
                {activeOffer && (
                  <span className="text-[10px] bg-amber-500 text-stone-950 px-2 py-0.5 rounded-full font-black uppercase">
                    Live Deal
                  </span>
                )}
              </button>

              <Link to="/menu" onClick={() => setIsOpen(false)} className="text-base font-semibold text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] transition-colors">Menu</Link>
              <Link to="/reservation" onClick={() => setIsOpen(false)} className="text-base font-bold text-[var(--color-cafe-primary)] flex items-center gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/40">
                <Calendar className="h-4 w-4 text-[var(--color-cafe-primary)]" /> Book a Table
              </Link>
              <Link to="/ambiance" onClick={() => setIsOpen(false)} className="text-base font-semibold text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> Cafe Ambiance & Vibe
              </Link>
              <Link to="/reviews" onClick={() => setIsOpen(false)} className="text-base font-semibold text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Customer Reviews & Ratings
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="text-base font-semibold text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)]">About Us</Link>
              <Link to="/contact" onClick={() => setIsOpen(false)} className="text-base font-semibold text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)]">Contact & Location</Link>

              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                {user ? (
                  <div className="flex items-center justify-between p-3 bg-amber-50/70 rounded-xl border border-amber-200/50">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[var(--color-cafe-primary)] text-white flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-[var(--color-cafe-text-primary)]">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={handleLogout} className="text-red-600 text-xs">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login"><Button variant="outline" className="w-full">Log in</Button></Link>
                    <Link to="/register"><Button className="w-full">Order Now</Button></Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>
    </>
  );
};
