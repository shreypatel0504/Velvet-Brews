import React from "react";
import { Search, ShoppingBag, Plus, Minus, Trash2, Printer, QrCode, CreditCard, Banknote, User, PackageCheck, Utensils, RefreshCw, Sparkles, CheckCircle2, Phone } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import toast from "react-hot-toast";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

const CATEGORIES = ["All", "Coffee", "Tea", "Pizza", "Sandwich", "Pastries", "Food"];

const FALLBACK_POS_MENU: MenuItem[] = [
  { _id: 'm1', name: 'Espresso', price: 120, category: 'Coffee' },
  { _id: 'm2', name: 'Cappuccino', price: 160, category: 'Coffee' },
  { _id: 'm3', name: 'Vanilla Latte', price: 180, category: 'Coffee' },
  { _id: 'm4', name: 'Caramel Macchiato', price: 210, category: 'Coffee' },
  { _id: 'm6', name: 'Cold Brew Classic', price: 150, category: 'Coffee' },
  { _id: 'm11', name: 'Masala Chai', price: 80, category: 'Tea' },
  { _id: 'm13', name: 'Matcha Green Tea Latte', price: 190, category: 'Tea' },
  { _id: 'm15', name: 'Iced Peach Tea', price: 140, category: 'Tea' },
  { _id: 'm19', name: 'Margherita Pizza', price: 290, category: 'Pizza' },
  { _id: 'm20', name: 'Paneer Tikka Pizza', price: 340, category: 'Pizza' },
  { _id: 'm21', name: 'Farmhouse Veggie Pizza', price: 360, category: 'Pizza' },
  { _id: 'm27', name: 'Bombay Grilled Sandwich', price: 180, category: 'Sandwich' },
  { _id: 'm28', name: 'Paneer Cheese Club Sandwich', price: 220, category: 'Sandwich' },
  { _id: 'm35', name: 'Butter Croissant', price: 130, category: 'Pastries' },
  { _id: 'm38', name: 'New York Cheesecake Slice', price: 260, category: 'Pastries' },
  { _id: 'm43', name: 'Avocado Sourdough Toast', price: 270, category: 'Food' },
  { _id: 'm44', name: 'Loaded Cheese Nachos', price: 230, category: 'Food' }
];

export const POSBillingPage = () => {
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  // Order Details State
  const [orderType, setOrderType] = React.useState<"takeaway" | "dine-in">("takeaway");
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = React.useState("Takeaway Counter");
  const [customerName, setCustomerName] = React.useState("Walk-in Guest");
  const [phone, setPhone] = React.useState("");
  const [paymentMode, setPaymentMode] = React.useState<"cash" | "upi" | "card">("upi");
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Fetch Menu items dynamically from Backend (/api/menu)
  const fetchMenu = React.useCallback(async () => {
    try {
      const res = await fetch("/api/menu").catch(() => fetch("http://localhost:5000/api/menu"));
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setMenuItems(data);
          return;
        }
      }
      setMenuItems(FALLBACK_POS_MENU);
    } catch {
      setMenuItems(FALLBACK_POS_MENU);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMenu();
    socket.connect();

    socket.on("menu-updated", () => {
      fetchMenu();
    });

    return () => {
      socket.off("menu-updated");
    };
  }, [fetchMenu]);

  // Handle Order Type Change
  const handleOrderTypeChange = (type: "takeaway" | "dine-in") => {
    setOrderType(type);
    if (type === "takeaway") {
      setTableNumber("Takeaway Counter");
    } else {
      setTableNumber("Table 1");
    }
  };

  const addItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item._id);
      if (existing) {
        return prev.map((i) => (i.id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          id: item._id,
          name: item.name,
          price: item.price,
          category: item.category,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gst = subtotal * 0.05;
  const total = subtotal + gst;

  // Print Thermal Bill Receipt
  const handlePrintReceipt = (orderData: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Thermal Receipt - Velvet Brews</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 10px; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 18px; font-weight: bold; }
            .subtitle { font-size: 10px; }
            .stamp { border: 2px solid #000; font-weight: bold; text-align: center; padding: 4px; margin: 8px 0; font-size: 13px; text-transform: uppercase; }
            .item { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; }
            .totals { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; font-size: 11px; }
            .total-line { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px; }
            .footer { text-align: center; margin-top: 12px; border-top: 1px dashed #000; padding-top: 8px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">VELVET BREWS CAFE</div>
            <div class="subtitle">102 VIP Road, Vesu, Surat</div>
            <div class="subtitle">Phone: +91 98765 43210</div>
            <div class="subtitle">GSTIN: 24AAACV1234F1Z9</div>
            <div class="subtitle">Date: ${new Date().toLocaleString('en-IN')}</div>
            <div class="subtitle">Order ID: POS-${orderData.id}</div>
          </div>

          <div class="stamp">
            *** ${orderData.orderType === 'takeaway' ? '🥡 PARCEL / TAKEAWAY ORDER' : '🍽️ DINE-IN ORDER'} ***
          </div>

          <div style="font-size:11px; margin-bottom:8px;">
            <strong>Guest:</strong> ${orderData.customerName}<br>
            ${orderData.phone ? `<strong>Phone:</strong> ${orderData.phone}<br>` : ''}
            <strong>Type:</strong> ${orderData.tableNumber}<br>
            <strong>Payment Mode:</strong> ${orderData.paymentMode.toUpperCase()}
          </div>

          <div style="border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px;">
            ${orderData.items.map((i: any) => `
              <div class="item">
                <span>${i.quantity}x ${i.name}</span>
                <span>₹${i.price * i.quantity}</span>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="item"><span>Subtotal</span><span>₹${orderData.subtotal}</span></div>
            <div class="item"><span>GST (5%)</span><span>₹${orderData.gst.toFixed(2)}</span></div>
            <div class="total-line"><span>TOTAL PAID</span><span>₹${orderData.total.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            ${orderData.orderType === 'takeaway' 
              ? '<p>*** PARCEL PACKED WITH CARE & LOVE ***</p><p>Thank you for choosing Velvet Brews!</p>' 
              : '<p>Thank you for dining with us!</p><p>*** Have a Wonderful Day ***</p>'}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Submit Order from POS
  const handleCheckoutPOS = async () => {
    if (cart.length === 0) {
      toast.error("POS cart is empty!");
      return;
    }

    setIsProcessing(true);
    const generatedId = Math.floor(1000 + Math.random() * 9000);
    const orderPayload = {
      _id: 'ORD' + generatedId,
      id: generatedId,
      customerName,
      phone: phone || '+91 99000 00000',
      orderType,
      tableNumber: orderType === 'takeaway' ? 'Takeaway / Parcel' : tableNumber,
      table: orderType === 'takeaway' ? 'Takeaway / Parcel' : tableNumber,
      customer: customerName,
      paymentMode,
      items: cart,
      totalAmount: total,
      status: "preparing",
      createdAt: new Date()
    };

    try {
      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ menuItemId: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          totalAmount: total,
          orderType,
          table: orderPayload.table,
          customer: customerName,
          phone,
          status: "preparing"
        })
      });

      if (!res.ok) {
        // Emit fallback socket event
        socket.emit("new-order", orderPayload);
      }
    } catch {
      socket.emit("new-order", orderPayload);
    }

    toast.success(`🎉 ${orderType === 'takeaway' ? 'Parcel' : 'POS'} Order POS-${generatedId} Processed!`);
    
    handlePrintReceipt({
      id: generatedId,
      customerName,
      phone,
      orderType,
      tableNumber: orderPayload.tableNumber,
      paymentMode,
      items: cart,
      subtotal,
      gst,
      total
    });

    setCart([]);
    setIsProcessing(false);
  };

  // Filtered Menu Items
  const filteredMenu = menuItems.filter((i) => {
    const matchesCat = selectedCategory === "All" || i.category === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[var(--color-cafe-primary)]" /> Counter POS Billing & Parcel Station
          </h2>
          <p className="text-sm text-gray-500">
            Synced live with website menu. Quick billing for Takeaway / Parcel & Dine-in orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMenu}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Refresh Live Menu"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Dynamic Synced Menu Catalog & Search */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search website menu dish, coffee, pizza..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
            />
          </div>

          {/* Dynamic Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[var(--color-cafe-primary)] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredMenu.length === 0 ? (
            <Card className="p-8 text-center bg-gray-50 border-dashed">
              <p className="text-xs text-gray-500 font-bold">No menu items found in this category.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredMenu.map((item) => (
                <button
                  key={item._id}
                  onClick={() => addItem(item)}
                  className="p-3.5 bg-white border border-gray-100 hover:border-[var(--color-cafe-primary)] rounded-2xl text-left transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-cafe-primary)]">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs text-gray-900 mt-1 line-clamp-2 leading-snug group-hover:text-[var(--color-cafe-primary)]">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <span className="font-black text-sm text-gray-900">₹{item.price}</span>
                    <div className="p-1.5 rounded-xl bg-amber-50 group-hover:bg-[var(--color-cafe-primary)] text-[var(--color-cafe-primary)] group-hover:text-white transition-colors">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Order Type Selector, POS Cart & Checkout */}
        <div className="lg:col-span-5">
          <Card className="p-5 bg-white border border-gray-100 shadow-md space-y-4 rounded-3xl sticky top-4">
            {/* 1. ORDER TYPE SELECTOR: TAKEAWAY / PARCEL VS DINE-IN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Order Type (ऑर्डर प्रकार)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOrderTypeChange("takeaway")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    orderType === "takeaway"
                      ? "bg-amber-600 text-white border-transparent shadow-md font-bold scale-[1.02]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50"
                  }`}
                >
                  <PackageCheck className="h-5 w-5" />
                  <span className="text-xs font-bold">🥡 Takeaway / Parcel</span>
                  <span className="text-[9px] opacity-90">Parcel & Pack Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOrderTypeChange("dine-in")}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    orderType === "dine-in"
                      ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md font-bold scale-[1.02]"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50"
                  }`}
                >
                  <Utensils className="h-5 w-5" />
                  <span className="text-xs font-bold">🍽️ Dine-in Table</span>
                  <span className="text-[9px] opacity-90">Serve on Cafe Table</span>
                </button>
              </div>
            </div>

            {/* Customer & Table Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
              <div>
                <label className="block text-gray-600 font-bold mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest Name"
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-[var(--color-cafe-primary)]"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">
                  {orderType === "takeaway" ? "Parcel Badge" : "Table Number"}
                </label>
                {orderType === "takeaway" ? (
                  <div className="w-full bg-amber-100 text-amber-900 border border-amber-300 rounded-xl p-2 text-xs font-bold truncate">
                    📦 Takeaway / Parcel
                  </div>
                ) : (
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-[var(--color-cafe-primary)]"
                  >
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                    <option value="Table 4">Table 4</option>
                    <option value="Table 5">Table 5</option>
                    <option value="Table 6">Table 6</option>
                    <option value="VIP Suite">VIP Private Suite</option>
                  </select>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-gray-600 font-bold mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium focus:outline-none focus:border-[var(--color-cafe-primary)]"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-48 overflow-y-auto space-y-2 border-y border-gray-100 py-3 text-xs">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 py-6">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-1 opacity-30" />
                  <p>Tap menu dishes on left to add to bill</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-xl">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-400 text-[10px]">₹{item.price} x {item.quantity}</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-1.5 py-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 text-gray-500 hover:text-black">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-bold text-xs px-1">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 text-gray-500 hover:text-black">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-bold text-gray-900 w-14 text-right">₹{item.price * item.quantity}</span>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: "upi", label: "UPI QR", icon: QrCode },
                  { id: "cash", label: "Cash", icon: Banknote },
                  { id: "card", label: "Card", icon: CreditCard }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMode(m.id as any)}
                    className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                      paymentMode === m.id
                        ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <m.icon className="h-3.5 w-3.5" /> {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (5%):</span>
                <span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-100 pt-2">
                <span>Total Bill Amount:</span>
                <span className="text-[var(--color-cafe-primary)] font-extrabold text-base">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckoutPOS}
              disabled={cart.length === 0 || isProcessing}
              className={`w-full gap-2 py-3 font-bold rounded-2xl text-xs shadow-lg ${
                orderType === 'takeaway' ? 'bg-amber-600 hover:bg-amber-700' : ''
              }`}
            >
              <Printer className="h-4 w-4" />
              {isProcessing ? "Processing Order..." : `Process ${orderType === 'takeaway' ? 'Parcel' : 'Dine-In'} Bill & Print Receipt (₹${total.toFixed(2)})`}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
