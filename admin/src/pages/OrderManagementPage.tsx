import * as React from "react";
import { socket } from '../utils/socket';
import { sharedSync } from '../utils/sharedSync';
import { playOrderChime } from '../utils/audioAlert';
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, ShoppingBag, RefreshCw, Zap, CheckCircle2, Utensils, Coffee, Printer, Search, Filter, Phone, User, X } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  id?: string;
  table: string;
  customer?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=200&q=80";

const statusConfig: Record<OrderStatus, { label: string; color: string; badgeBg: string; next?: OrderStatus; nextLabel?: string }> = {
  pending: { label: "New Orders", color: "border-amber-400", badgeBg: "bg-amber-100 text-amber-800", next: "preparing", nextLabel: "Start Kitchen Prep" },
  preparing: { label: "👨‍🍳 Kitchen Cooking", color: "border-blue-400", badgeBg: "bg-blue-100 text-blue-800", next: "ready", nextLabel: "⚡ Mark Ready" },
  ready: { label: "☕ Ready for Table / Pickup", color: "border-emerald-400", badgeBg: "bg-emerald-100 text-emerald-800", next: "served", nextLabel: "✓ Mark Served" },
  served: { label: "Served & Completed ✓", color: "border-gray-200", badgeBg: "bg-gray-100 text-gray-700" }
};

export const OrderManagementPage = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isConnected, setIsConnected] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [printOrder, setPrintOrder] = React.useState<Order | null>(null);

  const fetchOrders = React.useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      const apiOrders = Array.isArray(data) ? data : [];
      const localOrders = sharedSync.getOrders();

      const merged: any[] = [...apiOrders];
      localOrders.forEach((lo: any) => {
        const id = lo._id || lo.id;
        if (id && !merged.some(m => (m._id === id || m.id === id))) {
          merged.unshift(lo);
        }
      });
      setOrders(merged);
    } catch {
      setOrders(sharedSync.getOrders() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new-order', (newOrder: any) => {
      playOrderChime();
      const formatted: Order = {
        _id: String(newOrder._id || newOrder.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        id: String(newOrder._id || newOrder.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`),
        table: newOrder.table || 'Dine-In',
        customer: newOrder.customer || 'Guest Customer',
        paymentMethod: newOrder.paymentMethod || 'UPI / Cash',
        paymentStatus: newOrder.paymentStatus || 'completed',
        items: Array.isArray(newOrder.items) ? newOrder.items.map((i: any) => ({
          name: i.name || 'Item',
          quantity: i.quantity || i.qty || 1,
          price: i.price || 0,
          imageUrl: i.imageUrl || i.img || FALLBACK_IMG
        })) : [],
        status: (newOrder.status as OrderStatus) || 'pending',
        totalAmount: newOrder.totalAmount || 0,
        createdAt: newOrder.createdAt || new Date().toISOString()
      };

      setOrders(prev => {
        const id = formatted._id;
        if (prev.some(o => o._id === id || o.id === id)) return prev;
        return [formatted, ...prev];
      });

      toast.success(`🚨 NEW ORDER from ${formatted.customer} (${formatted.table})! ₹${formatted.totalAmount}`, { duration: 6000 });
    });

    socket.on('order-updated', (updated: any) => {
      const targetId = String(updated._id || updated.id || '');
      setOrders(prev => prev.map(o => {
        if (o._id === targetId || o.id === targetId) {
          return { ...o, status: updated.status };
        }
        return o;
      }));
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchOrders();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-order');
      socket.off('order-updated');
      unsubscribeStorage();
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: nextStatus } : o));
    sharedSync.updateOrderStatus(orderId, nextStatus);

    try {
      socket.emit('order-updated', { _id: orderId, id: orderId, status: nextStatus });
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Fallback handled
    }

    toast.success(`Order #${orderId.slice(-4)} updated to ${nextStatus}`);
  };

  const handlePrintReceipt = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesQuery = (o._id + (o.customer || '') + (o.table || '')).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">Live Kitchen & Order Monitor</h2>
          <p className="text-sm text-gray-500">Real-time incoming orders from customer website checkout & counter POS.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--color-cafe-primary)]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {['all', 'pending', 'preparing', 'ready', 'served'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[var(--color-cafe-primary)] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'all' ? `All (${orders.length})` : `${st} (${orders.filter(o => o.status === st).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-bold text-gray-600">No active orders matching search</p>
            <p className="text-xs text-gray-400 mt-1">Orders placed on the website will pop up here instantly.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const config = statusConfig[ord.status] || statusConfig.pending;

            return (
              <Card key={ord._id || ord.id} className={`p-6 border-l-4 ${config.color} hover:shadow-lg transition-shadow flex flex-col justify-between space-y-4`}>
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-gray-400">Order ID</span>
                      <h3 className="font-bold text-lg text-gray-900">#{String(ord._id || ord.id).slice(-4)}</h3>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeBg}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1">
                        {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl mb-3 text-xs space-y-1">
                    <div className="flex justify-between text-gray-800">
                      <span>Customer: <strong>{ord.customer || 'Guest Customer'}</strong></span>
                      <span className="font-bold text-[var(--color-cafe-primary)]">{ord.table || 'Dine-In'}</span>
                    </div>
                    {ord.paymentMethod && (
                      <div className="text-[11px] text-gray-500 flex justify-between">
                        <span>Payment: {ord.paymentMethod}</span>
                        <span className="text-emerald-700 font-bold">Paid ✓</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {ord.items && ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-50">
                        <div className="flex items-center gap-2">
                          <img src={item.imageUrl || FALLBACK_IMG} alt="" className="h-7 w-7 rounded-md object-cover" />
                          <span className="font-bold text-gray-800">{item.quantity}x {item.name}</span>
                        </div>
                        <span className="font-medium text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 mb-4">
                    <span className="text-xs font-bold text-gray-500">Total Amount</span>
                    <span className="font-heading font-bold text-xl text-[var(--color-cafe-primary)]">
                      ₹{(ord.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {config.next && (
                      <Button
                        onClick={() => updateStatus(ord._id || ord.id || '', config.next!)}
                        className="flex-1 bg-[var(--color-cafe-primary)] text-white text-xs font-bold gap-1.5 py-2.5"
                      >
                        {config.nextLabel}
                      </Button>
                    )}
                    <Button
                      onClick={() => handlePrintReceipt(ord)}
                      variant="outline"
                      className="text-xs border-gray-200 p-2.5 shrink-0"
                      title="Print KOT / Receipt"
                    >
                      <Printer className="h-4 w-4 text-gray-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* PRINT RECEIPT MODAL */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:p-0 print:bg-white">
          <div className="bg-white p-6 rounded-2xl w-full max-w-xs shadow-2xl print:shadow-none print:w-full border text-center font-mono space-y-4">
            <div className="border-b pb-3">
              <h2 className="font-bold text-lg">VELVET BREWS CAFE</h2>
              <p className="text-xs">102 VIP Road, Vesu, Surat</p>
              <p className="text-[10px]">Ph: +91 99784 21542</p>
            </div>

            <div className="text-left text-xs space-y-1 border-b pb-2">
              <p>Receipt #: {String(printOrder._id || printOrder.id).slice(-6)}</p>
              <p>Date: {new Date(printOrder.createdAt).toLocaleDateString()}</p>
              <p>Customer: {printOrder.customer}</p>
              <p>Table/Type: {printOrder.table}</p>
            </div>

            <div className="text-left text-xs space-y-1 border-b pb-2">
              {printOrder.items?.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.quantity}x {i.name}</span>
                  <span>₹{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>₹{(printOrder.totalAmount || 0).toFixed(2)}</span>
            </div>

            <div className="pt-2 text-[10px] text-gray-500">
              Thank you for visiting Velvet Brews!
            </div>

            <div className="print:hidden flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setPrintOrder(null)}>Close</Button>
              <Button size="sm" onClick={() => window.print()} className="bg-black text-white">Print</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
