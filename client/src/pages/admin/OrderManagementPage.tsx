import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, Check, ShoppingBag } from "lucide-react";
import { socket, cn } from '@/utils';
import { sharedSync } from "@/utils/sharedSync";
import { Card, Button } from "@/components/ui";
import toast from "react-hot-toast";

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served';

interface OrderItem {
  name: string;
  qty: number;
  img?: string;
  price?: number;
}

interface Order {
  id: string;
  _id?: string;
  table: string;
  customer?: string;
  items: OrderItem[];
  status: OrderStatus;
  time: string;
  totalAmount?: number;
}

const FALLBACK_IMG = "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=200&q=80";

export const OrderManagementPage = () => {
  const [orders, setOrders] = React.useState<Order[]>([]);

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

      const formattedList: Order[] = merged.map((o: any) => ({
        id: String(o._id || o.id || ''),
        _id: String(o._id || o.id || ''),
        table: o.table || 'Dine-In',
        customer: o.customer || 'Guest',
        items: Array.isArray(o.items) ? o.items.map((i: any) => ({
          name: i.name || 'Item',
          qty: i.quantity || i.qty || 1,
          img: i.imageUrl || i.img || FALLBACK_IMG,
          price: i.price || 0
        })) : [],
        status: o.status || 'pending',
        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        totalAmount: o.totalAmount || 0
      }));

      setOrders(formattedList);
    } catch {
      const localOrders = sharedSync.getOrders();
      const formattedList: Order[] = localOrders.map((o: any) => ({
        id: String(o._id || o.id || ''),
        _id: String(o._id || o.id || ''),
        table: o.table || 'Dine-In',
        customer: o.customer || 'Guest',
        items: Array.isArray(o.items) ? o.items.map((i: any) => ({
          name: i.name || 'Item',
          qty: i.quantity || i.qty || 1,
          img: i.imageUrl || i.img || FALLBACK_IMG,
          price: i.price || 0
        })) : [],
        status: o.status || 'pending',
        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        totalAmount: o.totalAmount || 0
      }));
      setOrders(formattedList);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
    socket.connect();

    socket.on('new-order', (newOrder: any) => {
      const id = String(newOrder._id || newOrder.id || `ORD${Math.floor(1000 + Math.random() * 9000)}`);

      const formatted: Order = {
        id,
        _id: id,
        table: newOrder.table || "Dine-In",
        customer: newOrder.customer || "Guest Customer",
        items: Array.isArray(newOrder.items) ? newOrder.items.map((i: any) => ({
          name: i.name || "Item",
          qty: i.quantity || i.qty || 1,
          img: i.imageUrl || i.img || FALLBACK_IMG,
          price: i.price || 0
        })) : [],
        status: newOrder.status || "pending",
        time: newOrder.time || "Just now",
        totalAmount: newOrder.totalAmount || 0
      };

      setOrders(prev => {
        if (prev.some(o => o.id === id || o._id === id)) return prev;
        return [formatted, ...prev];
      });

      toast.success(`🚨 NEW ORDER from ${formatted.customer}! ₹${formatted.totalAmount}`);
    });

    socket.on('order-updated', (updatedOrder: any) => {
      const targetId = String(updatedOrder._id || updatedOrder.id || '');
      setOrders(prev => prev.map(o => (o.id === targetId || o._id === targetId) ? { ...o, status: updatedOrder.status } : o));
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchOrders();
    });

    return () => {
      socket.off('new-order');
      socket.off('order-updated');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchOrders]);

  const columns: { id: OrderStatus; title: string; color: string; bg: string }[] = [
    { id: 'pending', title: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50/70 border-amber-200' },
    { id: 'preparing', title: 'Preparing', color: 'text-blue-700', bg: 'bg-blue-50/70 border-blue-200' },
    { id: 'ready', title: 'Ready to Serve', color: 'text-emerald-700', bg: 'bg-emerald-50/70 border-emerald-200' },
    { id: 'served', title: 'Served', color: 'text-gray-700', bg: 'bg-gray-50/70 border-gray-200' },
  ];

  const moveOrder = async (orderId: string, nextStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: nextStatus } : o));

    sharedSync.updateOrderStatus(orderId, nextStatus);

    const rawId = orderId.replace('#', '');
    socket.emit('order-updated', { _id: rawId, id: rawId, status: nextStatus });

    try {
      await fetch(`/api/orders/${rawId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Fallback updated via sharedSync & socket
    }

    toast.success(`Order #${rawId.slice(-4)} updated to ${nextStatus.toUpperCase()}`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Order Management</h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">Track customer orders with live food item thumbnails.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Refresh</Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map(col => {
          const colOrders = orders.filter(o => o.status === col.id);
          return (
            <div key={col.id} className={cn("flex-1 min-w-[320px] flex flex-col rounded-2xl border p-4 backdrop-blur-sm", col.bg)}>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className={cn("font-bold text-base flex items-center gap-2", col.color)}>
                  <ShoppingBag className="h-4 w-4" />
                  {col.title}
                </h3>
                <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-full shadow-xs border border-gray-100">{colOrders.length}</span>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                <AnimatePresence>
                  {colOrders.map(order => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={order.id}
                    >
                      <Card className="p-4 cursor-grab hover:shadow-md transition-all border-transparent hover:border-gray-200 group bg-white/95">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-[var(--color-cafe-text-primary)]">{order.id}</span>
                            <span className="text-xs bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] font-semibold px-2.5 py-0.5 rounded-full">
                              {order.table}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-400 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {order.time}
                          </div>
                        </div>
                        
                        {/* Ordered Items with Thumbnails */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-1.5 rounded-xl bg-gray-50/70 border border-gray-100">
                              <img 
                                src={item.img || FALLBACK_IMG} 
                                alt={item.name}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = FALLBACK_IMG;
                                }}
                                className="h-10 w-10 rounded-lg object-cover shadow-xs shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs text-[var(--color-cafe-text-primary)] truncate">{item.name}</p>
                              </div>
                              <span className="font-bold text-xs bg-white text-[var(--color-cafe-primary)] px-2 py-0.5 rounded-md border border-gray-200 shrink-0">
                                x{item.qty}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-end border-t border-gray-100 pt-3">
                          {col.id === 'pending' && (
                            <Button size="sm" onClick={() => moveOrder(order.id, 'preparing')} className="w-full text-xs h-9 shadow-sm">
                              Start Preparing
                            </Button>
                          )}
                          {col.id === 'preparing' && (
                            <Button size="sm" onClick={() => moveOrder(order.id, 'ready')} className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                              Mark Ready
                            </Button>
                          )}
                          {col.id === 'ready' && (
                            <Button size="sm" onClick={() => moveOrder(order.id, 'served')} className="w-full text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                              <CheckCircle className="h-3.5 w-3.5" /> Serve Order
                            </Button>
                          )}
                          {col.id === 'served' && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 w-full justify-center bg-emerald-50 py-1.5 rounded-lg">
                              <Check className="h-3.5 w-3.5" /> Order Completed
                            </span>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {colOrders.length === 0 && (
                  <div className="h-24 flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200/50 rounded-xl mx-2 bg-white/30">
                    No orders
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};
