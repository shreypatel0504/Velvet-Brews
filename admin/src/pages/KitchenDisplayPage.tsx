import * as React from "react";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import { playOrderChime, playReadyChime, playUrgentChime } from "../utils/audioAlert";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Coffee,
  Utensils,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

type OrderStatus = "pending" | "preparing" | "ready" | "served";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  imageUrl?: string;
  checked?: boolean;
}

interface KDSOrder {
  _id: string;
  id?: string;
  table: string;
  customer?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  checkedItems?: Record<number, boolean>;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=200&q=80";

// Helper to determine item station
const isDrinkCategory = (category?: string, name?: string) => {
  const text = (category || "" + name || "").toLowerCase();
  return (
    text.includes("coffee") ||
    text.includes("tea") ||
    text.includes("chai") ||
    text.includes("latte") ||
    text.includes("espresso") ||
    text.includes("beverage") ||
    text.includes("brew") ||
    text.includes("drink") ||
    text.includes("mocha")
  );
};

export const KitchenDisplayPage: React.FC = () => {
  const [orders, setOrders] = React.useState<KDSOrder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stationFilter, setStationFilter] = React.useState<"all" | "barista" | "kitchen">("all");
  const [viewTab, setViewTab] = React.useState<"active" | "ready" | "served">("active");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [soundEnabled, setSoundEnabledState] = React.useState(true);
  const [nowTime, setNowTime] = React.useState(Date.now());
  const [checkedItemsState, setCheckedItemsState] = React.useState<Record<string, Record<number, boolean>>>({});

  // Fetch initial orders
  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      const apiOrders = Array.isArray(data) ? data : [];
      const localOrders = sharedSync.getOrders();

      const merged: any[] = [...apiOrders];
      localOrders.forEach((lo: any) => {
        const id = lo._id || lo.id;
        if (id && !merged.some((m) => m._id === id || m.id === id)) {
          merged.unshift(lo);
        }
      });

      const formatted = merged.map((o: any) => ({
        _id: String(o._id || o.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        id: String(o._id || o.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        table: o.table || "Dine-In",
        customer: o.customer || "Guest Customer",
        items: Array.isArray(o.items)
          ? o.items.map((i: any) => ({
              name: i.name || "Item",
              quantity: i.quantity || i.qty || 1,
              price: i.price || 0,
              category: i.category || "",
              imageUrl: i.imageUrl || i.img || FALLBACK_IMG
            }))
          : [],
        status: (o.status as OrderStatus) || "pending",
        totalAmount: o.totalAmount || 0,
        createdAt: o.createdAt || new Date().toISOString()
      }));

      setOrders(formatted);
    } catch {
      setOrders(sharedSync.getOrders() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update clock every second for live timers
  React.useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sockets & Storage Subscription
  React.useEffect(() => {
    fetchOrders();
    socket.connect();

    socket.on("new-order", (newOrder: any) => {
      if (soundEnabled) playOrderChime();
      const formatted: KDSOrder = {
        _id: String(newOrder._id || newOrder.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        id: String(newOrder._id || newOrder.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        table: newOrder.table || "Dine-In",
        customer: newOrder.customer || "Guest Customer",
        items: Array.isArray(newOrder.items)
          ? newOrder.items.map((i: any) => ({
              name: i.name || "Item",
              quantity: i.quantity || i.qty || 1,
              price: i.price || 0,
              category: i.category || "",
              imageUrl: i.imageUrl || i.img || FALLBACK_IMG
            }))
          : [],
        status: (newOrder.status as OrderStatus) || "pending",
        totalAmount: newOrder.totalAmount || 0,
        createdAt: newOrder.createdAt || new Date().toISOString()
      };

      setOrders((prev) => {
        const id = formatted._id;
        if (prev.some((o) => o._id === id || o.id === id)) return prev;
        return [formatted, ...prev];
      });

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-amber-900 text-white shadow-2xl rounded-2xl pointer-events-auto flex items-center p-4 border border-amber-500`}
          >
            <Flame className="h-8 w-8 text-amber-400 animate-bounce mr-3 shrink-0" />
            <div>
              <p className="font-bold text-sm text-amber-200">🔔 NEW KITCHEN TICKET #{formatted._id.slice(-4)}</p>
              <p className="text-xs text-white">
                {formatted.table} • {formatted.items.length} items
              </p>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    socket.on("order-updated", (updated: any) => {
      const targetId = String(updated._id || updated.id || "");
      setOrders((prev) =>
        prev.map((o) => (o._id === targetId || o.id === targetId ? { ...o, status: updated.status } : o))
      );
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchOrders();
    });

    return () => {
      socket.off("new-order");
      socket.off("order-updated");
      unsubscribeStorage();
    };
  }, [fetchOrders, soundEnabled]);

  // Handle status bump
  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId || o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    sharedSync.updateOrderStatus(orderId, nextStatus);

    if (nextStatus === "ready" && soundEnabled) {
      playReadyChime();
    }

    try {
      socket.emit("order-updated", { _id: orderId, id: orderId, status: nextStatus });
      await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Offline fallback handled via sharedSync
    }

    toast.success(`Ticket #${orderId.slice(-4)} → ${nextStatus.toUpperCase()}`);
  };

  // Toggle item check-off on a ticket
  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    setCheckedItemsState((prev) => {
      const orderChecks = prev[orderId] || {};
      return {
        ...prev,
        [orderId]: {
          ...orderChecks,
          [itemIdx]: !orderChecks[itemIdx]
        }
      };
    });
  };

  // Toggle Fullscreen TV View
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Filter orders by station and view tab
  const filteredOrders = orders.filter((o) => {
    // View Tab
    if (viewTab === "active" && o.status !== "pending" && o.status !== "preparing") return false;
    if (viewTab === "ready" && o.status !== "ready") return false;
    if (viewTab === "served" && o.status !== "served") return false;

    // Station Filter
    if (stationFilter === "barista") {
      const hasDrinks = o.items.some((i) => isDrinkCategory(i.category, i.name));
      if (!hasDrinks) return false;
    } else if (stationFilter === "kitchen") {
      const hasFood = o.items.some((i) => !isDrinkCategory(i.category, i.name));
      if (!hasFood) return false;
    }

    return true;
  });

  // Calculate Elapsed Time
  const getElapsedSeconds = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const diff = Math.max(0, Math.floor((nowTime - created) / 1000));
    return diff;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Metrics
  const activeQueue = orders.filter((o) => o.status === "pending" || o.status === "preparing");
  const inPrepCount = orders.filter((o) => o.status === "preparing").length;
  const overdueCount = activeQueue.filter((o) => getElapsedSeconds(o.createdAt) > 480).length; // > 8 mins
  const readyCount = orders.filter((o) => o.status === "ready").length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans -m-4 sm:-m-6 p-4 sm:p-6 select-none">
      {/* Top Navigation & Controls Bar */}
      <header className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Title & Live Status Indicator */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Flame className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-bold text-white tracking-wide">KITCHEN DISPLAY SYSTEM</h1>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-xs text-gray-400">Live Touch Ticket Bump & Barista Monitor</p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors lg:hidden"
            title="Refresh Tickets"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Metrics Badges */}
        <div className="flex items-center gap-3 overflow-x-auto w-full lg:w-auto py-1 custom-scrollbar">
          <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2 text-xs">
            <Layers className="h-4 w-4 text-amber-400" />
            <span className="text-gray-400">Active Queue:</span>
            <span className="font-bold text-white text-sm">{activeQueue.length}</span>
          </div>

          <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2 text-xs">
            <Utensils className="h-4 w-4 text-blue-400" />
            <span className="text-gray-400">Cooking:</span>
            <span className="font-bold text-blue-400 text-sm">{inPrepCount}</span>
          </div>

          <div className={`bg-gray-950 px-4 py-2 rounded-xl border flex items-center gap-2 text-xs ${overdueCount > 0 ? "border-red-600 bg-red-950/30 text-red-400 animate-pulse" : "border-gray-800 text-gray-400"}`}>
            <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? "text-red-500" : "text-gray-500"}`} />
            <span>Rush (&gt;8m):</span>
            <span className="font-bold text-sm">{overdueCount}</span>
          </div>

          <div className="bg-gray-950 px-4 py-2 rounded-xl border border-gray-800 flex items-center gap-2 text-xs">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="text-gray-400">Ready Counter:</span>
            <span className="font-bold text-emerald-400 text-sm">{readyCount}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            onClick={() => setSoundEnabledState(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled ? "bg-emerald-950/40 border-emerald-700 text-emerald-300" : "bg-gray-800 border-gray-700 text-gray-400"
            }`}
            title="Toggle Audio Alert Chimes"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound ON" : "Muted"}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Toggle TV Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit TV" : "TV Mode"}</span>
          </button>
        </div>
      </header>

      {/* Filter Tabs Sub-header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Station Selector */}
        <div className="flex items-center bg-gray-900 p-1.5 rounded-2xl border border-gray-800 w-full sm:w-auto">
          <button
            onClick={() => setStationFilter("all")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              stationFilter === "all"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="h-4 w-4" />
            ALL STATIONS
          </button>

          <button
            onClick={() => setStationFilter("barista")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              stationFilter === "barista"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Coffee className="h-4 w-4" />
            ☕ BARISTA (Drinks)
          </button>

          <button
            onClick={() => setStationFilter("kitchen")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              stationFilter === "kitchen"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Utensils className="h-4 w-4" />
            🍔 KITCHEN (Food)
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setViewTab("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewTab === "active" ? "bg-gray-800 text-amber-400 border border-amber-500/40" : "text-gray-400 hover:bg-gray-900"
            }`}
          >
            Active Tickets ({activeQueue.length})
          </button>

          <button
            onClick={() => setViewTab("ready")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewTab === "ready" ? "bg-gray-800 text-emerald-400 border border-emerald-500/40" : "text-gray-400 hover:bg-gray-900"
            }`}
          >
            Ready Counter ({readyCount})
          </button>

          <button
            onClick={() => setViewTab("served")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              viewTab === "served" ? "bg-gray-800 text-blue-400 border border-blue-500/40" : "text-gray-400 hover:bg-gray-900"
            }`}
          >
            Completed History
          </button>
        </div>
      </div>

      {/* Tickets Display Grid */}
      <div className="flex-1">
        {filteredOrders.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-center bg-gray-900/50 rounded-3xl border border-dashed border-gray-800 p-8">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 text-amber-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-200">No Orders In This Queue</h3>
            <p className="text-xs text-gray-500 max-w-sm mt-1">
              New tickets placed via customer website or POS billing will pop up here live with sound alerts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredOrders.map((ord) => {
                const elapsedSec = getElapsedSeconds(ord.createdAt);
                const timerStr = formatTimer(elapsedSec);

                // Urgency level: < 300s (5m) = Normal, 300-480s (5-8m) = Attention, > 480s (8m) = Rush
                const isOverdue = elapsedSec > 480;
                const isWarning = elapsedSec > 300 && !isOverdue;

                let cardHeaderBg = "bg-emerald-950/60 border-emerald-800/80 text-emerald-200";
                let timerBadgeBg = "bg-emerald-900/80 text-emerald-300 border-emerald-700";
                let cardBorder = "border-emerald-900/50";

                if (ord.status === "preparing") {
                  cardHeaderBg = "bg-blue-950/60 border-blue-800/80 text-blue-200";
                  timerBadgeBg = "bg-blue-900/80 text-blue-300 border-blue-700";
                  cardBorder = "border-blue-900/50";
                }

                if (isWarning) {
                  cardHeaderBg = "bg-amber-950/80 border-amber-700/80 text-amber-200";
                  timerBadgeBg = "bg-amber-900/80 text-amber-300 border-amber-600";
                  cardBorder = "border-amber-700/60";
                }

                if (isOverdue) {
                  cardHeaderBg = "bg-red-950/90 border-red-700 text-red-100 animate-pulse";
                  timerBadgeBg = "bg-red-900 text-red-200 border-red-500 animate-bounce";
                  cardBorder = "border-red-600 ring-2 ring-red-600/50";
                }

                const checks = checkedItemsState[ord._id] || {};

                return (
                  <motion.div
                    key={ord._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-gray-900 rounded-3xl border ${cardBorder} shadow-2xl flex flex-col justify-between overflow-hidden relative group`}
                  >
                    {/* Rush Alert Banner */}
                    {isOverdue && (
                      <div className="bg-red-600 text-white font-black text-[10px] tracking-widest text-center py-1 uppercase flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> RUSH ORDER - OVERDUE &gt; 8 MINS!
                      </div>
                    )}

                    {/* Ticket Header */}
                    <div className={`p-4 border-b ${cardHeaderBg} flex items-start justify-between`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold tracking-wider opacity-80">
                            #{ord._id.slice(-4)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-black/40 border border-white/10">
                            {ord.table}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-white mt-1 truncate max-w-[170px]">
                          {ord.customer}
                        </h3>
                      </div>

                      {/* Live Clock Timer */}
                      <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 shadow-inner ${timerBadgeBg}`}>
                        <Clock className="h-3.5 w-3.5" />
                        {timerStr}
                      </div>
                    </div>

                    {/* Ticket Items List (Touch Check-off) */}
                    <div className="p-4 space-y-2.5 flex-1 max-h-72 overflow-y-auto custom-scrollbar">
                      {ord.items.map((item, idx) => {
                        const isDrink = isDrinkCategory(item.category, item.name);
                        const isChecked = !!checks[idx];

                        return (
                          <div
                            key={idx}
                            onClick={() => toggleItemCheck(ord._id, idx)}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? "bg-gray-950/60 border-gray-800 text-gray-500 line-through"
                                : "bg-gray-950 border-gray-800/80 hover:border-amber-500/50 text-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                  isChecked
                                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                    : "bg-gray-800 text-gray-300"
                                }`}
                              >
                                {isChecked ? <Check className="h-3.5 w-3.5" /> : `${item.quantity}x`}
                              </div>

                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${isChecked ? "text-gray-500" : "text-gray-100"}`}>
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {isDrink ? (
                                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-medium">
                                      <Coffee className="h-3 w-3" /> Barista
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-blue-400 flex items-center gap-0.5 font-medium">
                                      <Utensils className="h-3 w-3" /> Kitchen
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="text-[10px] font-mono text-gray-500 shrink-0 ml-2">
                              ₹{(item.price * item.quantity).toFixed(0)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ticket Action Footer */}
                    <div className="p-4 border-t border-gray-800 bg-gray-950/80 space-y-2">
                      {ord.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, "preparing")}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                        >
                          <Flame className="h-4 w-4" /> START PREP / COOKING
                        </button>
                      )}

                      {ord.status === "preparing" && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, "ready")}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4" /> ⚡ BUMP & MARK READY 🔔
                        </button>
                      )}

                      {ord.status === "ready" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateStatus(ord._id, "served")}
                            className="flex-1 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-700/50 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                          >
                            <Check className="h-4 w-4" /> Mark Served
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ord._id, "preparing")}
                            className="p-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700 text-xs"
                            title="Recall / Re-open to Preparing"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {ord.status === "served" && (
                        <button
                          onClick={() => handleUpdateStatus(ord._id, "ready")}
                          className="w-full py-2.5 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Recall Bumped Ticket
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
