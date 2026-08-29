import React from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp, Clock, ArrowUpRight, Coffee, Star, RefreshCw, Wifi, WifiOff, Eye, MessageSquare, Mail, Activity, CheckCircle2, XCircle, ChevronRight, Zap } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { OfferBroadcastWidget } from "../components/OfferBroadcastWidget";

export const DashboardPage = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [menu, setMenu] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [contacts, setContacts] = React.useState<any[]>([]);
  const [activities, setActivities] = React.useState<any[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchAll = React.useCallback(async () => {
    try {
      const [ordersRes, menuRes, resRes, revRes, msgRes, actRes] = await Promise.all([
        fetch('/api/orders').then(r => r.json()).catch(() => []),
        fetch('/api/menu').then(r => r.json()).catch(() => []),
        fetch('/api/reservations').then(r => r.json()).catch(() => []),
        fetch('/api/reviews').then(r => r.json()).catch(() => []),
        fetch('/api/contact').then(r => r.json()).catch(() => []),
        fetch('/api/activity').then(r => r.json()).catch(() => []),
      ]);

      const localOrders = sharedSync.getOrders();
      const localReservations = sharedSync.getReservations();
      const localReviews = sharedSync.getReviews();
      const localContacts = sharedSync.getContacts();
      const localActivities = sharedSync.getActivities();

      // Merge API + local storage
      const mergedOrders: any[] = Array.isArray(ordersRes) ? [...ordersRes] : [];
      localOrders.forEach(lo => {
        const id = lo._id || lo.id;
        if (id && !mergedOrders.some(mo => (mo._id === id || mo.id === id))) {
          mergedOrders.unshift(lo);
        }
      });

      const mergedRes: any[] = Array.isArray(resRes) ? [...resRes] : [];
      localReservations.forEach(lr => {
        const id = lr._id || lr.id;
        if (id && !mergedRes.some(mr => (mr._id === id || mr.id === id))) {
          mergedRes.unshift(lr);
        }
      });

      const mergedRev: any[] = Array.isArray(revRes) ? [...revRes] : [];
      localReviews.forEach(lrv => {
        const id = lrv._id || lrv.id;
        if (id && !mergedRev.some(mrv => (mrv._id === id || mrv.id === id))) {
          mergedRev.unshift(lrv);
        }
      });

      const mergedMsg: any[] = Array.isArray(msgRes) ? [...msgRes] : [];
      localContacts.forEach(lc => {
        if (!mergedMsg.some(m => m._id === lc._id)) {
          mergedMsg.unshift(lc);
        }
      });

      const mergedAct: any[] = Array.isArray(actRes) ? [...actRes] : [];
      localActivities.forEach(la => {
        if (!mergedAct.some(a => a.id === la.id)) {
          mergedAct.unshift(la);
        }
      });

      setOrders(mergedOrders);
      if (Array.isArray(menuRes)) setMenu(menuRes);
      setReservations(mergedRes);
      setReviews(mergedRev);
      setContacts(mergedMsg);
      setActivities(mergedAct);
    } catch (e) {
      console.warn("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new-order', (order: any) => {
      setOrders(prev => {
        const id = order._id || order.id;
        if (id && prev.some(o => (o._id || o.id) === id)) return prev;
        return [order, ...prev];
      });
      toast.success(`🚨 New Order Received! ₹${order.totalAmount || 0}`, { duration: 5000 });
    });

    socket.on('order-updated', (updated: any) => {
      const targetId = updated._id || updated.id;
      setOrders(prev => prev.map(o => (o._id === targetId || o.id === targetId ? { ...o, status: updated.status } : o)));
    });

    socket.on('new-reservation', (res: any) => {
      setReservations(prev => {
        const id = res._id || res.id;
        if (id && prev.some(r => (r._id || r.id) === id)) return prev;
        return [res, ...prev];
      });
      toast.success(`📅 New Table Reservation: ${res.tableNumber || res.customerName}`, { duration: 5000 });
    });

    socket.on('new-review', (rev: any) => {
      setReviews(prev => [rev, ...prev]);
    });

    socket.on('new-feedback', (data: any) => {
      const formatted = {
        _id: data._id || data.id || `r-${Date.now()}`,
        customerName: data.customerName || "Customer",
        rating: Math.round(Number(data.averageRating) || 5),
        comment: data.comments || data.comment || "Great experience!",
        category: "Overall",
        createdAt: new Date().toISOString()
      };
      setReviews(prev => [formatted, ...prev]);
    });

    socket.on('new-contact', (msg: any) => {
      setContacts(prev => [msg, ...prev]);
    });

    socket.on('user-activity', (act: any) => {
      setActivities(prev => [act, ...prev].slice(0, 50));
    });

    // Subscribe to cross-tab storage sync
    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchAll();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-order');
      socket.off('order-updated');
      socket.off('new-reservation');
      socket.off('new-review');
      socket.off('new-feedback');
      socket.off('new-contact');
      socket.off('user-activity');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchAll]);

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    setOrders(prev => prev.map(o => (o._id === id || o.id === id) ? { ...o, status } : o));
    sharedSync.updateOrderStatus(id, status as any);

    try {
      socket.emit('order-updated', { _id: id, id, status });
      await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch {
      // Fallback
    }

    toast.success(`Order #${id.slice(-4)} updated to ${status}`);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : '5.0';
  const todayReservations = reservations.filter(r => r.status === 'confirmed').length;
  const pendingContacts = contacts.filter(c => c.status === 'pending').length;

  const statCards = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: `${orders.length} orders`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
    { title: "Pending Orders", value: pendingOrders, change: `${orders.length} total`, icon: ShoppingBag, color: "text-amber-600 bg-amber-50" },
    { title: "Reservations Today", value: todayReservations, change: `${reservations.length} total`, icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Avg Customer Rating", value: avgRating, change: `${reviews.length} reviews`, icon: Star, color: "text-purple-600 bg-purple-50" },
    { title: "Contact Inquiries", value: pendingContacts, change: `${contacts.length} total`, icon: Mail, color: "text-indigo-600 bg-indigo-50" },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">Cafe Master Dashboard</h2>
          <p className="text-sm text-gray-500">Live surveillance & oversight of EVERYTHING happening on your website right now.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
            isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isConnected ? 'Realtime Website Sync Active' : 'Offline / Cross-Tab Fallback Mode'}
          </div>
          <Button onClick={fetchAll} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <Card key={idx} className="p-4 bg-white shadow-xs border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">{card.title}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-gray-900">{card.value}</span>
              <span className="text-xs text-gray-400 block mt-0.5">{card.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Customer Offer Broadcast Section */}
      <OfferBroadcastWidget />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: LIVE WEBSITE ACTIVITY WATCH (SURVEILLANCE STREAM) */}
        <div className="lg:col-span-7 space-y-6">
          
          <Card className="p-6 border-amber-200/80 bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-center justify-between border-b border-amber-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Activity className="h-6 w-6 text-amber-700 animate-pulse" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900">Website Live Activity Watch</h3>
                  <p className="text-xs text-amber-800 font-medium">Real-time surveillance stream of visitors on your website</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> Live Visitors
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  Waiting for visitor actions on website...
                </div>
              ) : (
                activities.map((act, i) => (
                  <div key={act.id || i} className="p-3 bg-white rounded-xl border border-gray-100 shadow-2xs flex items-start gap-3 hover:border-amber-300 transition-colors">
                    <div className="p-2 rounded-lg bg-amber-100/70 text-amber-900 shrink-0 mt-0.5">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 truncate">{act.user || 'Website Visitor'}</span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(act.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium mt-0.5">{act.details}</p>
                      <span className="text-[10px] text-amber-700/80 block mt-1">📍 {act.location || 'Surat, Gujarat'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* RECENT ORDERS TABLE */}
          <Card className="p-6 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Recent Customer Orders</h3>
                <p className="text-xs text-gray-500">Live order pipeline received from website checkout & POS counter.</p>
              </div>
              <Link to="/orders" className="text-xs text-[var(--color-cafe-primary)] font-bold hover:underline flex items-center gap-1">
                View All Orders <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No orders recorded yet.</div>
              ) : (
                recentOrders.map((ord) => (
                  <div key={ord._id || ord.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">#{String(ord._id || ord.id).slice(-4)}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {ord.table || 'Dine-In'}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ord.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Customer: <strong>{ord.customer || 'Guest'}</strong> • {ord.items ? ord.items.length : 0} items
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <span className="font-heading font-bold text-base text-[var(--color-cafe-primary)]">
                        ₹{ord.totalAmount || 0}
                      </span>
                      {ord.status === 'pending' && (
                        <Button
                          onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'preparing')}
                          size="sm"
                          className="bg-[var(--color-cafe-primary)] text-white text-xs gap-1"
                        >
                          Accept & Cook
                        </Button>
                      )}
                      {ord.status === 'preparing' && (
                        <Button
                          onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'ready')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1"
                        >
                          Mark Ready
                        </Button>
                      )}
                      {ord.status === 'ready' && (
                        <Button
                          onClick={() => handleUpdateOrderStatus(ord._id || ord.id, 'served')}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                        >
                          Mark Served
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: RESERVATIONS, REVIEWS & INQUIRIES */}
        <div className="lg:col-span-5 space-y-6">

          {/* TABLE RESERVATIONS WIDGET */}
          <Card className="p-6 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">Table Reservations ({reservations.length})</h3>
              <Link to="/tables" className="text-xs text-[var(--color-cafe-primary)] font-bold hover:underline">
                Manage Tables →
              </Link>
            </div>

            <div className="space-y-3">
              {reservations.slice(0, 3).map((res) => (
                <div key={res._id || res.id} className="p-3.5 rounded-xl bg-gray-50 text-xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{res.customerName}</h4>
                    <p className="text-gray-500 mt-0.5">{res.tableNumber || 'Table Request'} • {res.guests} Guests ({res.timeSlot})</p>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* CONTACT INQUIRIES WIDGET */}
          <Card className="p-6 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">Website Messages ({contacts.length})</h3>
              <Link to="/inquiries" className="text-xs text-[var(--color-cafe-primary)] font-bold hover:underline">
                View Messages →
              </Link>
            </div>

            <div className="space-y-3">
              {contacts.slice(0, 3).map((msg) => (
                <div key={msg._id} className="p-3.5 rounded-xl bg-gray-50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{msg.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${msg.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-gray-600 truncate">"{msg.subject || msg.message}"</p>
                </div>
              ))}
            </div>
          </Card>

          {/* RECENT REVIEWS WIDGET */}
          <Card className="p-6 border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-gray-900">Customer Feedback ({reviews.length})</h3>
              <Link to="/feedback" className="text-xs text-[var(--color-cafe-primary)] font-bold hover:underline">
                View Feedback →
              </Link>
            </div>

            <div className="space-y-3">
              {reviews.slice(0, 3).map((rev) => (
                <div key={rev._id || rev.id} className="p-3.5 rounded-xl bg-gray-50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-gray-900">
                    <span>{rev.customerName || 'Customer'}</span>
                    <div className="flex items-center text-amber-500">
                      {'★'.repeat(rev.rating || 5)}
                    </div>
                  </div>
                  <p className="text-gray-600 line-clamp-2">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </Card>

        </div>

      </div>
    </div>
  );
};
