import React, { useEffect } from 'react';
import { Clock, CheckCircle2, Coffee, PhoneCall, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { Order } from '../types';

export const OrderTrackingScreen: React.FC = () => {
  const { activeOrders, updateOrderStatus } = useOrderStore();
  const currentOrder = activeOrders[0];

  useEffect(() => {
    if (!currentOrder) return;

    // Simulate real-time status transitions for live mobile experience
    const timer1 = setTimeout(() => {
      if (currentOrder.status === 'Received') updateOrderStatus(currentOrder.id, 'Brewing');
    }, 4000);

    const timer2 = setTimeout(() => {
      if (currentOrder.status === 'Brewing') updateOrderStatus(currentOrder.id, 'Quality Check');
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [currentOrder?.status]);

  if (!currentOrder) {
    return (
      <div className="pb-safe pt-12 px-4 text-center space-y-3 animate-in fade-in duration-300">
        <Clock className="w-10 h-10 text-[#a89988] mx-auto opacity-50" />
        <h3 className="text-sm font-bold text-[#fef3c7]">No Active Orders</h3>
        <p className="text-xs text-[#a89988]">Place an order from the menu to track live barista status.</p>
      </div>
    );
  }

  const steps: { status: Order['status']; label: string; desc: string }[] = [
    { status: 'Received', label: 'Order Received', desc: 'Barista confirmed your ticket' },
    { status: 'Brewing', label: 'Crafting & Brewing', desc: 'Grinding fresh Ethiopian beans' },
    { status: 'Quality Check', label: 'Quality Inspection', desc: 'Adding micro-foam latte art & lid' },
    { 
      status: currentOrder.orderType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
      label: currentOrder.orderType === 'delivery' ? 'Out for Delivery' : 'Ready at Counter', 
      desc: currentOrder.orderType === 'delivery' ? 'Rider is on the way' : 'Collect at Cyber Hub Counter' 
    }
  ];

  const getStepState = (stepStatus: Order['status']) => {
    const statusOrder = ['Received', 'Brewing', 'Quality Check', 'Ready for Pickup', 'Out for Delivery', 'Completed'];
    const currentIndex = statusOrder.indexOf(currentOrder.status);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="pb-safe pt-2 px-4 space-y-6 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="glass-card p-4 rounded-3xl space-y-3 relative overflow-hidden border border-[#f59e0b]/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#f59e0b] tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Live Order Tracking
            </span>
            <h3 className="text-lg font-bold text-[#fef3c7] font-heading mt-0.5">Order #{currentOrder.id}</h3>
          </div>
          <div className="px-3 py-1 bg-[#f59e0b]/20 border border-[#f59e0b]/40 rounded-full text-xs font-bold text-[#f59e0b] animate-pulse">
            {currentOrder.status}
          </div>
        </div>

        {/* Estimated Time Badge */}
        <div className="p-3 rounded-2xl bg-[#120d0a]/90 flex items-center justify-between border border-white/5">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#f59e0b]" />
            <div>
              <span className="text-[10px] text-[#a89988]">Estimated Ready Time</span>
              <h4 className="text-sm font-extrabold text-[#fef3c7]">{currentOrder.estimatedDeliveryMinutes} Minutes</h4>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Live Sync
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="glass-card p-4 rounded-3xl space-y-6">
        <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">Barista Workflow Timeline</h4>

        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#261b15]">
          {steps.map((step, idx) => {
            const state = getStepState(step.status);
            return (
              <div key={idx} className="relative flex items-start gap-4">
                
                {/* Step Icon Indicator */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                    state === 'completed'
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                      : state === 'current'
                      ? 'bg-[#f59e0b] text-black animate-bounce shadow-md shadow-[#f59e0b]/40'
                      : 'bg-[#1c1410] border border-white/10 text-[#a89988]'
                  }`}
                >
                  {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                {/* Step Text */}
                <div className="flex-1">
                  <h5 className={`text-xs font-bold ${state === 'upcoming' ? 'text-[#a89988]' : 'text-[#fef3c7]'}`}>
                    {step.label}
                  </h5>
                  <p className="text-[10px] text-[#a89988] mt-0.5">{step.desc}</p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Order Item Details */}
      <div className="glass-card p-4 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-2">Order Items</h4>
        {currentOrder.items.map((item) => (
          <div key={item.cartItemId} className="flex justify-between text-xs text-[#fef3c7]">
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span className="font-bold text-[#f59e0b]">₹{item.totalPrice}</span>
          </div>
        ))}
        <div className="border-t border-white/10 pt-2 flex justify-between text-xs font-extrabold text-[#fef3c7]">
          <span>Total Paid</span>
          <span>₹{currentOrder.totalAmount}</span>
        </div>
      </div>

      {/* Help / Call Barista */}
      <button 
        onClick={() => alert("Connecting to Cyber Hub Barista counter...")}
        className="w-full py-3 rounded-2xl bg-[#1c1410] border border-[#d97706]/30 text-xs font-bold text-[#f59e0b] flex items-center justify-center gap-2 active:scale-98 transition-transform"
      >
        <PhoneCall className="w-4 h-4" /> Call Cafe Barista
      </button>

    </div>
  );
};
