import React, { useState } from 'react';
import { Megaphone, Sparkles, Send, Trash2, Tag, ExternalLink, Flame, Check, RefreshCw } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const getApiHost = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

const socket = io(`http://${getApiHost()}:5000`, { autoConnect: true });

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
}

const PRESET_OFFERS: Partial<OfferBroadcastData>[] = [
  {
    title: "☕ Monsoon Special: 30% OFF on Cold Brews!",
    subtitle: "Beat the rain with icy smooth gourmet coffee. Valid on orders above ₹299.",
    code: "COLD30",
    discountPercent: 30,
    badge: "Limited Time Deal",
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    actionText: "Claim 30% Discount ☕",
    actionUrl: "/menu"
  },
  {
    title: "🍰 Weekend Delight: Free Pastry on Orders > ₹499",
    subtitle: "Order your favorite pizzas or artisan meals & get a free Belgian Chocolate Croissant!",
    code: "FREEPASTRY",
    discountPercent: 20,
    badge: "Weekend Special",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
    actionText: "Order Now 🥐",
    actionUrl: "/menu"
  },
  {
    title: "🍕 Buy 1 Get 1 FREE on Gourmet Pizzas!",
    subtitle: "Double the deliciousness! Add 2 pizzas to your cart & get the 2nd one FREE.",
    code: "BOGOPIZZA",
    discountPercent: 50,
    badge: "BOGO Offer",
    imageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80",
    actionText: "Grab BOGO Deal 🍕",
    actionUrl: "/menu"
  }
];

export const OfferBroadcastWidget: React.FC = () => {
  const [offer, setOffer] = useState<OfferBroadcastData>({
    id: `offer_${Date.now()}`,
    title: PRESET_OFFERS[0].title!,
    subtitle: PRESET_OFFERS[0].subtitle!,
    code: PRESET_OFFERS[0].code!,
    discountPercent: PRESET_OFFERS[0].discountPercent,
    badge: PRESET_OFFERS[0].badge!,
    imageUrl: PRESET_OFFERS[0].imageUrl!,
    actionText: PRESET_OFFERS[0].actionText!,
    actionUrl: PRESET_OFFERS[0].actionUrl!,
  });

  const [broadcasting, setBroadcasting] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<OfferBroadcastData | null>(() => {
    try {
      const saved = localStorage.getItem('velvet_active_broadcast_offer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleApplyPreset = (preset: Partial<OfferBroadcastData>) => {
    setOffer((prev) => ({
      ...prev,
      ...preset,
      id: `offer_${Date.now()}`,
    }));
    toast.success("Applied preset template!");
  };

  const handleBroadcast = () => {
    if (!offer.title.trim()) {
      toast.error("Please enter an offer title");
      return;
    }

    setBroadcasting(true);
    const offerPayload = {
      ...offer,
      id: `offer_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    socket.emit("broadcast-offer", offerPayload);
    localStorage.setItem("velvet_active_broadcast_offer", JSON.stringify(offerPayload));
    setActiveBroadcast(offerPayload);

    setTimeout(() => {
      setBroadcasting(false);
      toast.success("🚀 Live Offer Broadcasted to all customer devices!");
    }, 400);
  };

  const handleClearBroadcast = () => {
    socket.emit("clear-offer");
    localStorage.removeItem("velvet_active_broadcast_offer");
    setActiveBroadcast(null);
    toast.success("🛑 Active Offer Cleared across all devices");
  };

  return (
    <Card className="p-6 bg-white shadow-xs border-amber-100/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
              Live Customer Offer Broadcast Controller
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-sans font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Real-time Socket
              </span>
            </h3>
            <p className="text-xs text-gray-500">Push instant offer popups & promo codes directly to customer mobile phones & browsers.</p>
          </div>
        </div>

        {activeBroadcast && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full animate-pulse">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Active Live Offer Broadcasting
            </span>
            <Button variant="outline" size="sm" onClick={handleClearBroadcast} className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5">
              <Trash2 className="h-4 w-4" /> Stop Offer
            </Button>
          </div>
        )}
      </div>

      {/* Preset Offer Quick Buttons */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Quick Preset Offer Templates</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_OFFERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-xs font-medium bg-amber-50/70 hover:bg-amber-100 text-amber-900 border border-amber-200/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              {preset.title?.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-7 space-y-4">
          <Input
            label="Offer Title / Headline"
            value={offer.title}
            onChange={(e) => setOffer((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. 🎉 Special Deal: 25% OFF on Espresso!"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-700">Subtitle / Description Details</label>
            <textarea
              value={offer.subtitle}
              onChange={(e) => setOffer((prev) => ({ ...prev, subtitle: e.target.value }))}
              rows={2}
              className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              placeholder="Explain deal conditions..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Promo Coupon Code"
              value={offer.code}
              onChange={(e) => setOffer((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. VELVET30"
            />
            <Input
              label="Badge Tag (e.g., Hot Deal)"
              value={offer.badge}
              onChange={(e) => setOffer((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="e.g. Limited Offer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CTA Button Text"
              value={offer.actionText}
              onChange={(e) => setOffer((prev) => ({ ...prev, actionText: e.target.value }))}
              placeholder="e.g. Claim Offer Now ☕"
            />
            <Input
              label="Banner Image URL"
              value={offer.imageUrl}
              onChange={(e) => setOffer((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              onClick={handleBroadcast}
              disabled={broadcasting}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 text-sm gap-2 shadow-md flex-1 sm:flex-initial"
            >
              <Send className="h-4 w-4" />
              {broadcasting ? "Broadcasting..." : "🚀 Broadcast Live Offer to Customers"}
            </Button>

            {activeBroadcast && (
              <Button
                variant="outline"
                onClick={handleClearBroadcast}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Clear Broadcast
              </Button>
            )}
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-amber-50/50 to-orange-50/30 p-4 rounded-2xl border border-amber-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" /> Customer App Live Preview
            </span>
            <span className="text-[11px] bg-white text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">Mobile View</span>
          </div>

          {/* Customer Popup Card Preview */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 space-y-3 p-3">
            <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={offer.imageUrl || "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80"}
                alt="Offer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {offer.badge || "SPECIAL OFFER"}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 leading-snug">{offer.title || "Offer Title"}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{offer.subtitle || "Offer details will appear here..."}</p>
            </div>

            {offer.code && (
              <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-dashed border-amber-300 text-xs">
                <span className="text-gray-600 font-medium">Use Code:</span>
                <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">{offer.code}</span>
              </div>
            )}

            <button
              type="button"
              className="w-full bg-amber-600 text-white text-xs font-bold py-2 rounded-lg shadow-xs flex items-center justify-center gap-1.5"
            >
              {offer.actionText || "Claim Offer"} <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
