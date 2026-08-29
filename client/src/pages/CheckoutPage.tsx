import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, CheckCircle2, QrCode, Smartphone, Building2, ShieldCheck, X, Copy, Check, Banknote, ShoppingBag, Tag } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { Navbar } from "@/components/layout";
import { useCartStore, useLoyaltyStore } from "@/store";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import { trackWebsiteActivity } from "@/utils/activityTracker";
import toast from "react-hot-toast";

export type PaymentMethodType = 'gpay' | 'phonepe' | 'paytm' | 'bhim_upi' | 'qr_code' | 'card' | 'netbanking' | 'cash';

export const CheckoutPage = () => {
  const cart = useCartStore();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = React.useState("Rahul Sharma");
  const [email, setEmail] = React.useState("rahul@example.com");
  const [phone, setPhone] = React.useState("+91 99784 21542");
  const [deliveryAddressInput, setDeliveryAddressInput] = React.useState(cart.deliveryAddress || "Vesu Main Road, Surat");

  // Payment Selection State (Defaults to Cash on Delivery for Delivery orders)
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethodType>(
    cart.orderType === 'delivery' ? 'cash' : 'gpay'
  );
  const [upiIdInput, setUpiIdInput] = React.useState("9978421542@okaxis");
  const [selectedBank, setSelectedBank] = React.useState("HDFC Bank");
  
  // Card Details
  const [cardNumber, setCardNumber] = React.useState("4532 8912 3456 7890");
  const [expiry, setExpiry] = React.useState("12/28");
  const [cvc, setCvc] = React.useState("892");

  // Modal & Processing States
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingStatusMessage, setProcessingStatusMessage] = React.useState("");
  const [copiedUpi, setCopiedUpi] = React.useState(false);

  const { coins, isRedeeming, toggleRedeem } = useLoyaltyStore();
  const rawSubtotal = cart.getRawSubtotal();
  const promoDiscount = cart.getDiscountAmount();
  const deliveryFee = cart.orderType === 'delivery' ? 30 : 0;
  const coinsDiscount = isRedeeming ? Math.min(coins, Math.floor(Math.max(0, rawSubtotal - promoDiscount) * 0.5)) : 0;
  const subtotal = Math.max(0, rawSubtotal - promoDiscount - coinsDiscount);
  const gst = subtotal * 0.05;
  const totalAmount = subtotal + deliveryFee + gst;
  const recipientPhone = "9978421542";
  const recipientUpi = "shreypatel5425@okicici";
  const payeeName = "ShreyPatel";

  // Clean NPCI compliant QR string generator with proper URL encoding
  const getUpiQrUrl = (amount: number) => {
    const rawUpiString = `upi://pay?pa=${recipientUpi}&pn=${payeeName}&am=${amount.toFixed(2)}&cu=INR&tn=CafeOrder`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(rawUpiString)}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(recipientUpi);
    setCopiedUpi(true);
    toast.success(`UPI ID copied: ${recipientUpi} (Phone: ${recipientPhone})`);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const triggerUpiAppRedirect = (method: PaymentMethodType, amount: number, customUpiVpa?: string) => {
    const vpa = customUpiVpa || recipientUpi;
    const note = "CafeOrder";
    const amountStr = amount.toFixed(2);
    const genericUpiUrl = `upi://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}`;

    let appUrl = genericUpiUrl;
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

    if (method === 'gpay') {
      appUrl = isAndroid
        ? `intent://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
        : `gpay://upi/pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}`;
    } else if (method === 'phonepe') {
      appUrl = isAndroid
        ? `intent://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}#Intent;scheme=upi;package=com.phonepe.app;end`
        : `phonepe://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}`;
    } else if (method === 'paytm') {
      appUrl = isAndroid
        ? `intent://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}#Intent;scheme=upi;package=net.one97.paytm;end`
        : `paytmmp://pay?pa=${vpa}&pn=${payeeName}&am=${amountStr}&cu=INR&tn=${note}`;
    }

    try {
      window.location.href = appUrl;
      setTimeout(() => {
        window.location.href = genericUpiUrl;
      }, 600);
    } catch {
      window.location.href = genericUpiUrl;
    }
  };

  const handleProcessOrder = async () => {
    if (!customerName || !email || !phone) {
      toast.error("Please fill in your contact information");
      return;
    }

    if (cart.orderType === 'delivery' && !deliveryAddressInput) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (paymentMethod === 'bhim_upi' && !upiIdInput.includes('@')) {
      toast.error("Please enter a valid UPI ID (e.g. name@okaxis)");
      return;
    }

    setIsProcessing(true);

    // If online UPI method, launch UPI app directly on mobile device
    if (['gpay', 'phonepe', 'paytm', 'bhim_upi'].includes(paymentMethod)) {
      triggerUpiAppRedirect(paymentMethod, totalAmount, paymentMethod === 'bhim_upi' ? upiIdInput : undefined);
    }

    // Dynamic processing message based on payment method
    let methodTitle = "Google Pay";
    if (paymentMethod === 'gpay') methodTitle = "Google Pay App";
    else if (paymentMethod === 'phonepe') methodTitle = "PhonePe App";
    else if (paymentMethod === 'paytm') methodTitle = "Paytm Wallet & UPI";
    else if (paymentMethod === 'bhim_upi') methodTitle = `UPI ID (${upiIdInput})`;
    else if (paymentMethod === 'qr_code') methodTitle = "QR Code Scan";
    else if (paymentMethod === 'card') methodTitle = "Card Payment Gateway";
    else if (paymentMethod === 'netbanking') methodTitle = `${selectedBank} NetBanking`;
    else {
      methodTitle = cart.orderType === 'delivery'
        ? 'Cash on Delivery (COD)'
        : cart.orderType === 'takeaway'
        ? 'Pay at Pickup Counter'
        : 'Pay at Table';
    }

    setProcessingStatusMessage(
      ['gpay', 'phonepe', 'paytm', 'bhim_upi'].includes(paymentMethod)
        ? `Launching ${methodTitle} for ₹${totalAmount.toFixed(2)}...`
        : `Connecting to ${methodTitle}...`
    );

    await new Promise(res => setTimeout(res, 600));
    setProcessingStatusMessage(
      paymentMethod === 'cash'
        ? "Configuring Doorstep / Counter Cash Order..."
        : "Authenticating Secure Payment & Verifying Signature..."
    );

    await new Promise(res => setTimeout(res, 700));
    setProcessingStatusMessage("Order Validated! Generating Kitchen Ticket...");

    await new Promise(res => setTimeout(res, 500));

    let tableOrType = cart.orderType === 'dine-in'
      ? (cart.tableNumber || 'Table 1')
      : cart.orderType === 'takeaway'
      ? '🛍️ Takeaway'
      : `🚚 Delivery (${deliveryAddressInput || 'Address Provided'})`;

    const generatedId = `ORD${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedItems = cart.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      imageUrl: item.imageUrl
    }));

    const orderPayload = {
      _id: generatedId,
      id: generatedId,
      table: tableOrType,
      orderType: cart.orderType,
      customer: customerName,
      paymentMethod: methodTitle,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'completed',
      items: formattedItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    // Always save order to shared local storage sync so admin panel displays it instantly
    sharedSync.saveOrder(orderPayload);
    trackWebsiteActivity('order_place', customerName, `Placed Order #${generatedId.slice(-4)} (₹${totalAmount.toFixed(2)}) via ${methodTitle}`);

    try {
      socket.connect();

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderResult = await res.json();
        const serverId = orderResult._id || generatedId;
        orderPayload._id = serverId;
        orderPayload.id = serverId;
        sharedSync.saveOrder(orderPayload);
      }
    } catch {
      console.warn("Server POST /api/orders failed, using shared local storage fallback");
    }

    // Emit live socket event to all listening admin panels
    socket.emit('new-order', orderPayload);

    const trackId = orderPayload._id.slice(-4);
    toast.success(`🎉 Order #${trackId} Placed! (${methodTitle})`);
    cart.clearCart();
    setIsProcessing(false);
    navigate(`/track/${trackId}`);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="font-heading text-2xl font-bold mb-2 text-[var(--color-cafe-text-primary)]">Your cart is empty</h2>
          <p className="text-sm text-gray-500 mb-6">Add delicious food & beverages to proceed to checkout.</p>
          <Link to="/menu">
            <Button className="rounded-xl px-6">Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col">
      <Navbar />

      {/* Payment Processing Overlay Modal */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--color-cafe-primary)]/20 border-t-[var(--color-cafe-primary)] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-[var(--color-cafe-primary)]/10 flex items-center justify-center text-[var(--color-cafe-primary)] font-bold text-xl">
                  ₹
                </div>
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-[var(--color-cafe-text-primary)]">Processing Order</h3>
                <p className="text-xs text-[var(--color-cafe-text-secondary)] mt-2 font-medium">{processingStatusMessage}</p>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 py-2 px-3 rounded-full border border-emerald-200">
                <ShieldCheck className="h-4 w-4" /> 256-Bit SSL Encrypted & PCI-DSS Compliant
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic QR Code Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative"
            >
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-black rounded-full"
              >
                <X className="h-5 w-5" />
              </button>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-3 py-1 rounded-full">
                Scan & Pay with Any App
              </span>
              
              <h3 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)] mt-2">
                Pay ₹{totalAmount.toFixed(2)}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App
              </p>

              <div className="mx-auto w-48 h-48 sm:w-52 sm:h-52 bg-white border-2 border-[var(--color-cafe-primary)]/30 rounded-2xl flex flex-col items-center justify-center p-3 my-4 shadow-lg">
                <img
                  src={getUpiQrUrl(totalAmount)}
                  alt="Cafe GPay UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs mb-4">
                <div className="text-left">
                  <span className="text-gray-500 font-medium block text-[10px]">RECIPIENT NUMBER & UPI ID</span>
                  <span className="text-gray-900 font-bold">9978421542 ({recipientUpi})</span>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-amber-700 transition-colors"
                >
                  {copiedUpi ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUpi ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <Button
                onClick={() => {
                  setIsQrModalOpen(false);
                  handleProcessOrder();
                }}
                className="w-full h-12 text-sm font-bold shadow-md gap-2 rounded-xl"
              >
                <CheckCircle2 className="h-4 w-4" /> I Have Paid via QR Code
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <Link to="/menu" className="inline-flex items-center gap-2 text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Form & Payment Selector */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 sm:space-y-8">
            {/* Customer Details Card */}
            <Card className="p-4 sm:p-6 md:p-8 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-cafe-text-primary)]">
                  1. Customer & Delivery Details
                </h2>
                <span className="text-xs font-bold text-[var(--color-cafe-primary)] bg-[var(--color-cafe-primary)]/10 px-2.5 py-1 rounded-full uppercase">
                  {cart.orderType === 'dine-in' ? `Eat In (${cart.tableNumber || 'Table 1'})` : cart.orderType === 'takeaway' ? '🛍️ Takeaway' : '🚚 Delivery'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                  <Input
                    placeholder="Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                {cart.orderType === 'delivery' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Address *</label>
                    <Input
                      placeholder="Vesu, Surat"
                      value={deliveryAddressInput}
                      onChange={(e) => setDeliveryAddressInput(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Comprehensive Payment Methods */}
            <Card className="p-4 sm:p-6 md:p-8 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-cafe-text-primary)]">
                  2. Select Payment Method
                </h2>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> 100% Secure & Instant
                </span>
              </div>

              {/* Payment Method Responsive Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('gpay')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'gpay'
                      ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    G
                  </div>
                  <span className="text-xs font-bold text-gray-800">Google Pay</span>
                </button>

                {/* PhonePe */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('phonepe')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'phonepe'
                      ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    Pe
                  </div>
                  <span className="text-xs font-bold text-gray-800">PhonePe</span>
                </button>

                {/* Paytm */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paytm')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'paytm'
                      ? 'border-cyan-600 bg-cyan-50/60 shadow-md ring-2 ring-cyan-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-cyan-600 text-white font-black text-[10px] flex items-center justify-center">
                    Paytm
                  </div>
                  <span className="text-xs font-bold text-gray-800">Paytm</span>
                </button>

                {/* QR Code */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr_code')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'qr_code'
                      ? 'border-[var(--color-cafe-primary)] bg-amber-50/60 shadow-md ring-2 ring-[var(--color-cafe-primary)]/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <QrCode className="h-7 w-7 text-[var(--color-cafe-primary)]" />
                  <span className="text-xs font-bold text-gray-800">QR Code</span>
                </button>

                {/* Custom UPI ID */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bhim_upi')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'bhim_upi'
                      ? 'border-orange-600 bg-orange-50/60 shadow-md ring-2 ring-orange-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <Smartphone className="h-7 w-7 text-orange-600" />
                  <span className="text-xs font-bold text-gray-800">UPI ID</span>
                </button>

                {/* Credit / Debit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <CreditCard className="h-7 w-7 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-800">Card</span>
                </button>

                {/* Net Banking */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-600/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <Building2 className="h-7 w-7 text-indigo-600" />
                  <span className="text-xs font-bold text-gray-800">NetBanking</span>
                </button>

                {/* Cash on Delivery / Pay at Counter */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-1.5 ${
                    paymentMethod === 'cash'
                      ? 'border-slate-800 bg-slate-100 shadow-md ring-2 ring-slate-800/20'
                      : 'border-gray-100 bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <Banknote className="h-7 w-7 text-emerald-700" />
                  <span className="text-xs font-bold text-gray-800">
                    {cart.orderType === 'delivery' ? 'Cash on Delivery' : 'Pay at Counter'}
                  </span>
                </button>
              </div>

              {/* Dynamic Sub-Payment Method Details Card */}
              <div className="bg-gray-50/80 p-4 sm:p-5 rounded-2xl border border-gray-200/80">
                {/* Google Pay View */}
                {paymentMethod === 'gpay' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
                          G
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Google Pay (GPay)</h4>
                          <p className="text-xs text-gray-500">Direct GPay payment to <span className="font-bold text-gray-800">{recipientUpi}</span></p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
                        Official Merchant
                      </span>
                    </div>

                    <div className="bg-blue-50/90 p-3 rounded-xl border border-blue-200 space-y-1.5 text-xs text-blue-900 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-semibold">Payment Phone Number:</span>
                        <span className="font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200">9978421542</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 font-semibold">GPay UPI VPA:</span>
                        <span className="font-bold text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-200">{recipientUpi}</span>
                      </div>
                      <p className="text-[11px] text-blue-700 pt-1 border-t border-blue-200/60">
                        ⚡ Clicking Pay below opens Google Pay directly targeting payment of <strong>₹{totalAmount.toFixed(2)}</strong> to <strong>{recipientUpi}</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {/* PhonePe View */}
                {paymentMethod === 'phonepe' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0">
                        Pe
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">PhonePe UPI</h4>
                        <p className="text-xs text-gray-500">Direct PhonePe payment to <strong>{recipientUpi}</strong></p>
                      </div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium space-y-1">
                      <p>💜 Direct PhonePe UPI Transfer to <strong>{recipientUpi}</strong> (₹{totalAmount.toFixed(2)}).</p>
                    </div>
                  </div>
                )}

                {/* Paytm View */}
                {paymentMethod === 'paytm' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-cyan-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                        Paytm
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Paytm Wallet & UPI</h4>
                        <p className="text-xs text-gray-500">Pay to <strong>{recipientUpi}</strong> via Paytm</p>
                      </div>
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-xl border border-cyan-200 text-xs text-cyan-900 font-medium">
                      💙 Direct Paytm payment will authorize ₹{totalAmount.toFixed(2)} to <strong>{recipientUpi}</strong>.
                    </div>
                  </div>
                )}

                {/* QR Code Scanner View */}
                {paymentMethod === 'qr_code' && (
                  <div className="space-y-3 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-[var(--color-cafe-primary)]" />
                        Scan Dynamic Cafe QR Code
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">Scan with GPay, PhonePe, Paytm, or any scanner app</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="mt-2 sm:mt-0 rounded-xl px-5 gap-2 text-xs h-10 shrink-0"
                    >
                      <QrCode className="h-4 w-4" /> Open Full QR Code
                    </Button>
                  </div>
                )}

                {/* Custom BHIM UPI ID View */}
                {paymentMethod === 'bhim_upi' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Enter Your UPI VPA ID</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. rahul@okaxis, 9876543210@paytm"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500">
                      A payment request of ₹{totalAmount.toFixed(2)} will be sent to your UPI app.
                    </p>
                  </div>
                )}

                {/* Credit / Debit Card View */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-600" /> Enter Card Credentials
                    </h4>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Card Number</label>
                      <Input
                        placeholder="4532 8912 3456 7890"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
                        <Input
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">CVC / CVV</label>
                        <Input
                          placeholder="123"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* NetBanking View */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-900">Select NetBanking Bank</h4>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-bold text-gray-800 focus:outline-none"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* PROPER CASH ON DELIVERY / PAY AT COUNTER VIEW */}
                {paymentMethod === 'cash' && (
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <Banknote className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          {cart.orderType === 'delivery'
                            ? 'Cash / UPI on Doorstep Delivery (COD)'
                            : cart.orderType === 'takeaway'
                            ? 'Pay Cash / UPI at Pickup Counter'
                            : 'Pay Cash / UPI at Table / Counter'}
                        </h4>
                        <p className="text-gray-500 text-[11px]">
                          {cart.orderType === 'delivery'
                            ? 'No advance payment needed. Pay when your fresh food arrives at your address.'
                            : 'Pay when your food is served at your table or when collecting pickup.'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl text-emerald-900 flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {cart.orderType === 'delivery' ? 'Doorstep COD Enabled' : 'Pay at Counter Enabled'}
                      </span>
                      <span className="font-bold text-emerald-700">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Submit Payment Button */}
              <Button
                type="button"
                onClick={handleProcessOrder}
                className="w-full h-14 text-sm sm:text-base font-bold shadow-lg shadow-[var(--color-cafe-primary)]/20 gap-2 rounded-2xl"
              >
                <CheckCircle2 className="h-5 w-5" />
                {paymentMethod === 'gpay' && `Pay ₹${totalAmount.toFixed(2)} via Google Pay`}
                {paymentMethod === 'phonepe' && `Pay ₹${totalAmount.toFixed(2)} via PhonePe`}
                {paymentMethod === 'paytm' && `Pay ₹${totalAmount.toFixed(2)} via Paytm`}
                {paymentMethod === 'qr_code' && `Pay ₹${totalAmount.toFixed(2)} via QR Code`}
                {paymentMethod === 'bhim_upi' && `Pay ₹${totalAmount.toFixed(2)} via UPI ID`}
                {paymentMethod === 'card' && `Pay ₹${totalAmount.toFixed(2)} via Card`}
                {paymentMethod === 'netbanking' && `Pay ₹${totalAmount.toFixed(2)} via ${selectedBank}`}
                {paymentMethod === 'cash' && (
                  cart.orderType === 'delivery'
                    ? `Confirm Order with Cash on Delivery (₹${totalAmount.toFixed(2)})`
                    : `Place Order & Pay ₹${totalAmount.toFixed(2)} at Counter`
                )}
              </Button>
            </Card>
          </div>

          {/* Sidebar Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Card className="p-4 sm:p-6 md:p-8 border-transparent sticky top-24 bg-white shadow-[var(--shadow-cafe-card)]">
              <h2 className="font-heading text-xl font-bold mb-6 text-[var(--color-cafe-text-primary)]">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=200&q=80";
                        }}
                        className="h-14 w-14 rounded-xl object-cover shadow-xs border border-gray-100"
                      />
                      <span className="absolute -top-2 -right-2 bg-[var(--color-cafe-primary)] text-white text-xs h-5 w-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-[var(--color-cafe-text-primary)] truncate">{item.name}</h4>
                      <p className="text-[var(--color-cafe-text-secondary)] text-xs">₹{item.price} x {item.quantity}</p>
                    </div>
                    <div className="font-bold text-sm text-[var(--color-cafe-primary)] shrink-0">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* PROMO COUPON CODE BOX */}
              {cart.appliedPromo ? (
                <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-2xl mb-4 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl">
                      <Tag className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-sm text-emerald-950">{cart.appliedPromo.code}</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">{cart.appliedPromo.discountPercent}% OFF</span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-medium">Applied to your order</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={cart.removePromoCode}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline p-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              {/* VELVET CLUB LOYALTY REWARDS BOX */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/10 to-amber-600/10 p-3.5 rounded-2xl border border-amber-300/60 mb-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      🪙
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 leading-tight">Velvet Club Rewards</h4>
                      <p className="text-[10px] text-amber-800 font-semibold">You have {coins} Velvet Coins</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleRedeem}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isRedeeming
                        ? "bg-emerald-600 text-white border-transparent shadow-xs"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {isRedeeming ? "Coins Applied ✓" : "Redeem Coins"}
                  </button>
                </div>

                {isRedeeming && (
                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded-xl text-[11px] font-bold flex justify-between items-center border border-emerald-200">
                    <span>🪙 Saved using Velvet Coins</span>
                    <span>- ₹{coinsDiscount}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-[var(--color-cafe-text-secondary)]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{rawSubtotal}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Promo Discount ({cart.appliedPromo?.code})</span>
                    <span>- ₹{promoDiscount}</span>
                  </div>
                )}
                {isRedeeming && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Velvet Coins Discount</span>
                    <span>- ₹{coinsDiscount}</span>
                  </div>
                )}
                {cart.orderType === 'delivery' && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Doorstep Delivery Charge</span>
                    <span className="font-semibold">+ ₹30</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-[var(--color-cafe-text-secondary)]">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-gray-800">₹{gst.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-[var(--color-cafe-text-primary)]">
                  <span>Total Amount</span>
                  <span className="text-[var(--color-cafe-primary)]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
