import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Sparkles, 
  Send, 
  Trash2, 
  Tag, 
  ExternalLink, 
  Flame, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Volume2, 
  Vibrate, 
  Clock, 
  Percent, 
  Gift, 
  Radio, 
  History, 
  Layers, 
  Image as ImageIcon,
  Copy,
  Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { socket } from '../utils/socket';
import { playOrderChime, playReadyChime } from '../utils/audioAlert';

export interface OfferBroadcastData {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  discountPercent?: number;
  imageUrl: string;
  actionText: string;
  actionUrl: string;
  badge: string;
  timestamp?: string;
}

const PRESET_OFFERS: OfferBroadcastData[] = [
  {
    id: "preset-monsoon",
    title: "☕ Monsoon Special: 30% OFF on Cold Brews!",
    subtitle: "Beat the rain with icy smooth gourmet coffee. Valid on orders above ₹299.",
    code: "COLD30",
    discountPercent: 30,
    badge: "Limited Time Deal",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80",
    actionText: "Claim 30% Discount ☕",
    actionUrl: "/menu"
  },
  {
    id: "preset-bogo",
    title: "🍕 Buy 1 Get 1 FREE on Gourmet Pizzas!",
    subtitle: "Double the deliciousness! Add 2 pizzas to your cart & get the 2nd one FREE.",
    code: "BOGOPIZZA",
    discountPercent: 50,
    badge: "BOGO Deal",
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
    actionText: "Grab BOGO Deal 🍕",
    actionUrl: "/menu"
  },
  {
    id: "preset-dessert",
    title: "🍰 Free Belgian Chocolate Croissant on Orders > ₹499",
    subtitle: "Order your favorite meals & get a warm flaky Belgian Croissant on the house!",
    code: "FREEPASTRY",
    discountPercent: 20,
    badge: "Sweet Treat",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80",
    actionText: "Claim Free Pastry 🥐",
    actionUrl: "/menu"
  },
  {
    id: "preset-happyhour",
    title: "⚡ Happy Hour Flash Sale: 25% OFF All Lattes",
    subtitle: "Recharge your day with artisan vanilla, hazelnut, and caramel handcrafted drinks.",
    code: "HAPPY25",
    discountPercent: 25,
    badge: "Flash Sale",
    imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80",
    actionText: "Order Latte Now ☕",
    actionUrl: "/menu"
  },
  {
    id: "preset-table",
    title: "✨ Candlelight Table Booking: Free Welcome Mocktail",
    subtitle: "Book an evening table under our romantic pergola lights & enjoy complimentary drinks.",
    code: "CANDLEVIP",
    discountPercent: 15,
    badge: "VIP Dine In",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    actionText: "Reserve Table Now ✨",
    actionUrl: "/reservation"
  }
];

export const BroadcastOffersPage: React.FC = () => {
  const [offer, setOffer] = useState<OfferBroadcastData>(PRESET_OFFERS[0]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<OfferBroadcastData | null>(null);
  const [history, setHistory] = useState<OfferBroadcastData[]>(PRESET_OFFERS);
  const [enableChime, setEnableChime] = useState(true);
  const [enableVibrate, setEnableVibrate] = useState(true);
  const [phonePreviewMode, setPhonePreviewMode] = useState<'popup' | 'lockscreen'>('popup');

  const fetchActiveStatus = async () => {
    try {
      const res = await fetch('/api/notifications/active');
      const data = await res.json();
      if (data?.activeOffer) {
        setActiveBroadcast(data.activeOffer);
      }
      
      const histRes = await fetch('/api/notifications/history');
      const histData = await histRes.json();
      if (histData?.history && Array.isArray(histData.history)) {
        setHistory(histData.history);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchActiveStatus();
    socket.connect();

    socket.on('new-offer-broadcast', (data: any) => {
      setActiveBroadcast(data);
    });

    socket.on('offer-cleared', () => {
      setActiveBroadcast(null);
    });

    return () => {
      socket.off('new-offer-broadcast');
      socket.off('offer-cleared');
    };
  }, []);

  const handleApplyPreset = (preset: OfferBroadcastData) => {
    setOffer({
      ...preset,
      id: `offer_${Date.now()}`
    });
    toast.success(`Loaded "${preset.badge}" preset template!`);
  };

  const handleBroadcast = async () => {
    if (!offer.title.trim()) {
      toast.error("Please provide an offer title");
      return;
    }

    setBroadcasting(true);
    const offerPayload: OfferBroadcastData = {
      ...offer,
      id: `offer_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Emit real-time via Socket.IO
      socket.emit("broadcast-offer", offerPayload);

      // 2. Save via Backend REST API
      await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerPayload)
      });

      setActiveBroadcast(offerPayload);
      setHistory(prev => [offerPayload, ...prev.filter(h => h.id !== offerPayload.id)].slice(0, 15));
      localStorage.setItem("velvet_active_broadcast_offer", JSON.stringify(offerPayload));

      if (enableChime) {
        playReadyChime();
      }

      toast.success("🚀 Live Offer Broadcasted to all customer devices!");
    } catch (e) {
      toast.error("Broadcast completed via socket fallback");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleClearBroadcast = async () => {
    socket.emit("clear-offer");
    try {
      await fetch('/api/notifications/clear', { method: 'POST' });
    } catch {}
    localStorage.removeItem("velvet_active_broadcast_offer");
    setActiveBroadcast(null);
    toast.success("🛑 Active Offer cleared across all customer phones");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl shadow-sm">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
                Live Promotions & Push Broadcast Hub
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 font-sans">
                  <Radio className="h-3.5 w-3.5 text-red-600 animate-ping" /> Real-time Push
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Broadcast instant discount alerts, promo codes & deals directly to customer mobile phones with sound chime & vibration.
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          {activeBroadcast ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-2xl shadow-xs">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-900">
                Live: {activeBroadcast.code} ({activeBroadcast.discountPercent || 20}% OFF)
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearBroadcast}
                className="text-red-600 border-red-200 hover:bg-red-50 ml-1 py-1 h-7 text-xs gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Stop
              </Button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
              No Active Offer Broadcasting
            </span>
          )}

          <Button variant="outline" size="sm" onClick={fetchActiveStatus} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Preset Offer Quick Buttons */}
      <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border-amber-200/80 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-600" /> Quick 1-Click Offer Presets
          </span>
          <span className="text-[11px] text-amber-800 font-medium">Click any template to load into composer</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_OFFERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs font-semibold bg-white hover:bg-amber-50 text-stone-900 border border-amber-300 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Flame className="h-4 w-4 text-amber-600" />
              <span>{preset.badge}: {preset.title.split(':')[0]}</span>
              <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                {preset.code}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Grid: Composer & Mobile Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: BROADCAST COMPOSER */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 bg-white shadow-xs border-gray-100 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                <Tag className="h-5 w-5 text-amber-600" /> Create & Dispatch Live Promotion
              </h3>
              <span className="text-xs text-gray-400">Pushes to all active phones</span>
            </div>

            <div className="space-y-4">
              <Input
                label="Offer Headline / Banner Title"
                value={offer.title}
                onChange={(e) => setOffer((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. ☕ Monsoon Special: 30% OFF on Cold Brews!"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Subtitle & Details (Conditions / Minimum Order)</label>
                <textarea
                  value={offer.subtitle}
                  onChange={(e) => setOffer((prev) => ({ ...prev, subtitle: e.target.value }))}
                  rows={2}
                  className="w-full text-sm rounded-xl border border-gray-300 px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none shadow-2xs"
                  placeholder="e.g. Beat the rain with icy smooth gourmet coffee. Valid on orders above ₹299."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Coupon Promo Code"
                  value={offer.code}
                  onChange={(e) => setOffer((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. COLD30"
                />

                <Input
                  label="Discount % Percentage"
                  type="number"
                  value={offer.discountPercent || 0}
                  onChange={(e) => setOffer((prev) => ({ ...prev, discountPercent: Number(e.target.value) }))}
                  placeholder="e.g. 30"
                />

                <Input
                  label="Badge Tag (e.g. Limited Deal)"
                  value={offer.badge}
                  onChange={(e) => setOffer((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. Monsoon Special"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700">Target Page / Destination</label>
                  <select
                    value={offer.actionUrl}
                    onChange={(e) => setOffer((prev) => ({ ...prev, actionUrl: e.target.value }))}
                    className="w-full text-sm rounded-xl border border-gray-300 px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-amber-500 outline-none shadow-2xs font-medium"
                  >
                    <option value="/menu">Cafe Menu (/menu)</option>
                    <option value="/reservation">Table Reservation (/reservation)</option>
                    <option value="/ambiance">Cafe Ambiance & Gallery (/ambiance)</option>
                    <option value="/reviews">Customer Reviews (/reviews)</option>
                    <option value="/checkout">Direct Checkout (/checkout)</option>
                  </select>
                </div>

                <Input
                  label="CTA Button Text"
                  value={offer.actionText}
                  onChange={(e) => setOffer((prev) => ({ ...prev, actionText: e.target.value }))}
                  placeholder="e.g. Claim 30% Discount ☕"
                />
              </div>

              <Input
                label="Banner Image URL"
                value={offer.imageUrl}
                onChange={(e) => setOffer((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
              />

              {/* Alert Feedback Controls */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableChime}
                      onChange={(e) => setEnableChime(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <Volume2 className="h-4 w-4 text-emerald-600" /> Play Audio Chime
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVibrate}
                      onChange={(e) => setEnableVibrate(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <Vibrate className="h-4 w-4 text-purple-600" /> Vibrate Phone
                  </label>
                </div>

                <span className="text-[11px] text-gray-500">Auto-copies code on customer tap</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  onClick={handleBroadcast}
                  disabled={broadcasting}
                  className="w-full sm:flex-1 h-12 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-sm gap-2 shadow-lg shadow-amber-600/30 rounded-2xl cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  {broadcasting ? "Broadcasting to Devices..." : "🚀 Broadcast Live Offer to Customer Phones"}
                </Button>

                {activeBroadcast && (
                  <Button
                    variant="outline"
                    onClick={handleClearBroadcast}
                    className="w-full sm:w-auto h-12 text-red-600 border-red-200 hover:bg-red-50 rounded-2xl cursor-pointer"
                  >
                    Clear Active Offer
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Broadcast History */}
          <Card className="p-6 bg-white shadow-xs border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-heading text-base font-bold text-gray-900 flex items-center gap-2">
                <History className="h-4 w-4 text-amber-600" /> Campaign & Broadcast History
              </h4>
              <span className="text-xs text-gray-400">{history.length} campaigns logged</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {history.map((h, i) => (
                <div
                  key={h.id || i}
                  className="p-3 bg-gray-50/90 rounded-2xl border border-gray-200/70 flex items-center justify-between gap-3 hover:border-amber-400 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={h.imageUrl}
                      alt={h.title}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                          {h.badge}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {h.code}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 truncate mt-1">{h.title}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOffer(h);
                      toast.success(`Loaded "${h.code}" into composer!`);
                    }}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl shrink-0 transition-colors cursor-pointer"
                  >
                    Re-broadcast
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PHONE SIMULATOR */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-amber-600" /> Customer Phone Live Simulator
            </span>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPhonePreviewMode('popup')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  phonePreviewMode === 'popup' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                In-App Popup
              </button>
              <button
                type="button"
                onClick={() => setPhonePreviewMode('lockscreen')}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                  phonePreviewMode === 'lockscreen' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Lock-Screen Push
              </button>
            </div>
          </div>

          {/* Smartphone Bezel */}
          <div className="relative mx-auto max-w-[340px] bg-stone-950 rounded-[42px] p-3.5 shadow-2xl border-[6px] border-stone-800 ring-1 ring-stone-700">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-stone-900 rounded-full z-30 flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Screen View */}
            <div className="relative h-[560px] rounded-[32px] overflow-hidden bg-stone-900 text-white flex flex-col justify-between p-4 pt-10">
              
              {/* Lockscreen View Mode */}
              {phonePreviewMode === 'lockscreen' ? (
                <div className="space-y-4 pt-6">
                  <div className="text-center space-y-1">
                    <p className="text-3xl font-light font-sans text-stone-300">09:41</p>
                    <p className="text-xs text-stone-400">Friday, August 14</p>
                  </div>

                  {/* System Push Notification Card */}
                  <div className="bg-stone-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-xl space-y-2 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-[10px]">
                          VB
                        </div>
                        <span className="text-[11px] font-bold text-amber-300">VELVET BREWS</span>
                      </div>
                      <span className="text-[10px] text-stone-400">now</span>
                    </div>

                    <div>
                      <h5 className="font-bold text-xs text-white leading-tight">{offer.title || "Offer Title"}</h5>
                      <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">{offer.subtitle || "Special deal conditions..."}</p>
                    </div>

                    {offer.code && (
                      <div className="flex items-center justify-between bg-stone-900/80 p-2 rounded-xl border border-dashed border-amber-500/40 text-[11px]">
                        <span className="text-stone-400">Promo Code:</span>
                        <span className="font-mono font-bold text-amber-400">{offer.code}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* In-App Popup Modal Mode */
                <div className="space-y-3">
                  <div className="bg-stone-950/90 rounded-2xl p-3 border border-amber-500/40 space-y-2.5 shadow-2xl">
                    <div className="relative h-32 rounded-xl overflow-hidden bg-stone-900">
                      <img
                        src={offer.imageUrl || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"}
                        alt="Offer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {offer.badge || "SPECIAL DEAL"}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-amber-300 leading-snug">{offer.title || "Offer Title"}</h4>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">{offer.subtitle || "Offer description details..."}</p>
                    </div>

                    {offer.code && (
                      <div className="bg-stone-900 p-2 rounded-xl border border-dashed border-amber-500/50 flex items-center justify-between text-xs">
                        <span className="text-stone-400 text-[10px] font-bold">CODE:</span>
                        <span className="font-mono font-bold text-amber-300">{offer.code}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black py-2 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
                    >
                      <span>{offer.actionText || "Claim Deal"}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Simulated Customer Bottom Bar */}
              <div className="bg-stone-950/90 backdrop-blur-md rounded-2xl p-2.5 border border-stone-800 flex items-center justify-around text-stone-400 text-[10px]">
                <span className="text-amber-400 font-bold">Menu</span>
                <span>Book Table</span>
                <span>Cart</span>
                <span>Profile</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
