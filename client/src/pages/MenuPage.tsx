import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import { Navbar, Footer } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import { ItemCustomizationModal } from "@/components/modals";
import { useCartStore } from "@/store/useCartStore";
import { socket } from "@/utils/socket";
import { getCachedMenu, setCachedMenu, prefetchMenu } from "@/utils/menuCache";
import type { MenuItem } from "@/types";

const MENU_CATEGORIES = ["All", "Coffee", "Tea", "Pizza", "Sandwich", "Pastries", "Food"] as const;

// Fallback images map for instant O(1) lookup
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Coffee: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=500&q=80",
  Tea: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=500&q=80",
  Pizza: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
  Sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80",
  Pastries: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80",
  Food: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=500&q=80",
};

interface ItemCardProps {
  item: MenuItem;
  quantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
}

// 120 FPS Optimized Memoized Card Component
const MenuItemCard = React.memo(({ item, quantity, onAddToCart, onUpdateQuantity }: ItemCardProps) => {
  const itemId = item._id || item.id || "";
  const fallbackImg = CATEGORY_FALLBACK_IMAGES[item.category || "Coffee"] || CATEGORY_FALLBACK_IMAGES.Coffee;
  const [imgLoaded, setImgLoaded] = React.useState(false);

  const handleImgError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = fallbackImg;
    setImgLoaded(true);
  }, [fallbackImg]);

  const handleImgLoad = React.useCallback(() => {
    setImgLoaded(true);
  }, []);

  return (
    <div className="w-full">
      {/* SWIGGY MOBILE CARD (Visible on Mobile) */}
      <div className="sm:hidden bg-white rounded-2xl p-4 mb-4 shadow-sm border border-stone-200/70 flex items-start justify-between gap-3 relative transition-all">
        {/* Left Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="h-4 w-4 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5 shrink-0">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
            </div>
            <span className="text-[10px] font-extrabold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              ★ {item.category || "Bestseller"}
            </span>
          </div>

          <h3 className="font-heading text-base font-bold text-stone-900 leading-snug">
            {item.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-1 mb-1.5">
            <span className="font-extrabold text-base text-[var(--color-cafe-primary)]">₹{item.price}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              ★ 4.8
            </span>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Right Image + Swiggy Floating ADD Button */}
        <div className="relative shrink-0 w-28 flex flex-col items-center pb-2">
          <div className="h-28 w-28 rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-stone-200/80 cursor-pointer group relative">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-stone-200 animate-pulse rounded-2xl" />
            )}
            <img 
              src={item.imageUrl || fallbackImg} 
              alt={item.name}
              loading="lazy"
              decoding="async"
              onLoad={handleImgLoad}
              onError={handleImgError}
              className={`w-full h-full object-cover transition-all duration-300 cursor-pointer group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>

          {/* Swiggy Style ADD Button Overlay */}
          <div className="absolute -bottom-1 w-24 z-10">
            {quantity > 0 ? (
              <div className="bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between px-2 py-1 border-2 border-white font-bold text-xs">
                <button 
                  onClick={() => onUpdateQuantity(itemId, quantity - 1)}
                  className="px-2 py-0.5 text-white hover:text-stone-200 active:scale-90 transition-transform cursor-pointer"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => onAddToCart(item)}
                  className="px-2 py-0.5 text-white hover:text-stone-200 active:scale-90 transition-transform cursor-pointer"
                >
                  +
                </button>
              </div>
            ) : (
              <Button 
                onClick={() => onAddToCart(item)}
                className="w-full h-8 text-xs font-black bg-white text-emerald-600 border-2 border-emerald-500 hover:bg-emerald-50 active:scale-95 shadow-md rounded-xl uppercase tracking-wider transition-transform cursor-pointer"
              >
                ADD +
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP / TABLET CARD (Hidden on Mobile) */}
      <Card className="hidden sm:flex h-full flex-col group cursor-pointer bg-white border border-stone-200/80 hover:border-[var(--color-cafe-primary)]/40 hover:shadow-lg transition-all duration-250">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-stone-100 cursor-pointer">
          {!imgLoaded && (
            <div className="absolute inset-0 bg-stone-200 animate-pulse" />
          )}
          <img 
            src={item.imageUrl || fallbackImg} 
            alt={item.name} 
            loading="lazy"
            decoding="async"
            onLoad={handleImgLoad}
            onError={handleImgError}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 cursor-pointer ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer" />
        </div>
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-heading text-lg font-bold text-stone-900">{item.name}</h3>
            <span className="font-extrabold text-[var(--color-cafe-primary)] text-base">₹{item.price}</span>
          </div>
          <p className="text-sm text-stone-600 mb-6 flex-1 line-clamp-2">
            {item.description}
          </p>
          <Button 
            onClick={() => onAddToCart(item)}
            className="w-full rounded-xl bg-stone-50 text-[var(--color-cafe-primary)] border border-[var(--color-cafe-primary)]/20 hover:bg-[var(--color-cafe-primary)] hover:text-white group-hover:border-transparent transition-all cursor-pointer font-bold"
          >
            Add to Order
          </Button>
        </div>
      </Card>
    </div>
  );
});

MenuItemCard.displayName = "MenuItemCard";

export const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const deferredQuery = React.useDeferredValue(searchQuery);

  // Synchronous 0ms initialization from local cache or fallback
  const [items, setItems] = React.useState<MenuItem[]>(() => getCachedMenu());
  const [isLoading, setIsLoading] = React.useState(false);
  const [customizingItem, setCustomizingItem] = React.useState<{
    id: string;
    name: string;
    price: number;
    description?: string;
    imageUrl: string;
    category?: string;
  } | null>(null);

  // Selector-based cart store subscriptions to prevent unnecessary renders
  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const setTableNumber = useCartStore((s) => s.setTableNumber);
  const setOrderType = useCartStore((s) => s.setOrderType);

  // Fast O(1) item quantity map
  const cartQtyMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      const key = item.cartItemId || item.id;
      if (key) map.set(key, item.quantity);
    }
    return map;
  }, [cartItems]);

  const totalCartCount = React.useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return getTotalPrice();
  }, [cartItems, getTotalPrice]);

  React.useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      setTableNumber(`Table ${tableParam}`);
      setOrderType('dine-in');
    }
  }, [searchParams, setTableNumber, setOrderType]);

  // Non-blocking background revalidation with timeout
  const fetchMenu = React.useCallback(async () => {
    try {
      const freshItems = await prefetchMenu();
      if (Array.isArray(freshItems) && freshItems.length > 0) {
        setItems(freshItems);
        setCachedMenu(freshItems);
      }
    } catch (error) {
      console.debug("Silent background menu sync:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Live sync: when admin updates menu in admin panel, refresh customer menu automatically
  React.useEffect(() => {
    socket.connect();
    socket.on('menu-updated', (payload: any) => {
      fetchMenu();
      const action = payload?.action;
      if (action === 'updated') toast.success(`Menu updated by cafe — refreshing!`, { icon: '🍽️' });
      if (action === 'created') toast.success(`New item added to menu!`, { icon: '✨' });
      if (action === 'deleted') toast(`Item removed from menu`, { icon: '🗑️' });
    });
    return () => {
      socket.off('menu-updated');
    };
  }, [fetchMenu]);

  // Memoized 120 FPS filter
  const filteredItems = React.useMemo(() => {
    const query = deferredQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch = !query || item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, deferredQuery]);

  const handleAddToCart = React.useCallback((item: any) => {
    setCustomizingItem({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      imageUrl: item.imageUrl,
      category: item.category
    });
  }, []);

  const handleUpdateQuantity = React.useCallback((id: string, qty: number) => {
    updateQuantity(id, qty);
  }, [updateQuantity]);

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] pb-36 sm:pb-24">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 mb-6">
          {/* Header Title */}
          <div>
            <h1 className="font-heading text-3xl sm:text-5xl font-bold text-stone-900 mb-1 sm:mb-2">Our Menu</h1>
            <p className="text-sm sm:text-base text-stone-600">Discover our handcrafted beverages and artisan treats.</p>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 sm:h-5 w-4 sm:w-5 text-stone-400" />
            </div>
            <input
              type="text"
              placeholder="Search coffee, pizza, desserts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-full border border-stone-300 bg-white py-2.5 sm:py-3 pl-10 pr-4 text-sm focus:border-[var(--color-cafe-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/20 shadow-xs"
            />
          </div>
        </div>

        {/* Categories (Sticky Bar aligned under Navbar) */}
        <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 border-b border-stone-200/80 shadow-xs">
          <div className="flex overflow-x-auto hide-scrollbar gap-2 max-w-7xl mx-auto py-0.5">
            {MENU_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative whitespace-nowrap rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[var(--color-cafe-primary)] text-white shadow-md scale-105"
                      : "bg-stone-100/90 text-stone-700 hover:bg-amber-50 hover:text-amber-900 border border-stone-200"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading && items.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-cafe-primary)]"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/80 shadow-xs p-8">
            <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
              <UtensilsCrossed className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-xl font-bold text-stone-900 mb-2">No dishes found</h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-6">
              We couldn't find any items matching &quot;{searchQuery}&quot; in the {activeCategory} category.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              variant="outline"
              className="rounded-xl font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => {
              const itemId = item._id || item.id || "";
              const qty = cartQtyMap.get(itemId) || 0;

              return (
                <MenuItemCard
                  key={itemId}
                  item={item}
                  quantity={qty}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button (Desktop only, mobile has dedicated bottom nav) */}
      {totalCartCount > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="hidden md:block fixed bottom-6 right-6 z-40"
        >
          <Button
            size="lg"
            onClick={() => setCartDrawerOpen(true)}
            className="rounded-full shadow-2xl gap-3 px-6 py-6 cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-[var(--color-cafe-primary)]">
                {totalCartCount}
              </span>
            </div>
            <span className="font-semibold text-lg">₹{totalPrice}</span>
          </Button>
        </motion.div>
      )}

      {customizingItem && (
        <ItemCustomizationModal
          item={customizingItem}
          onClose={() => setCustomizingItem(null)}
        />
      )}

      <Footer />
    </div>
  );
};

