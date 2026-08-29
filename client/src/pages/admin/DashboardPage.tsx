import React from "react";
import { Card } from "@/components/ui";
import { ArrowUpRight, DollarSign, ShoppingBag, Users, Star, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const fetchAll = React.useCallback(async () => {
    try {
      const [ordersRes, resRes, revRes] = await Promise.all([
        fetch('/api/orders').then(r => r.json()).catch(() => []),
        fetch('/api/reservations').then(r => r.json()).catch(() => []),
        fetch('/api/reviews').then(r => r.json()).catch(() => []),
      ]);

      const localOrders = sharedSync.getOrders();
      const localReservations = sharedSync.getReservations();
      const localReviews = sharedSync.getReviews();

      const mergedOrders = Array.isArray(ordersRes) ? [...ordersRes] : [];
      localOrders.forEach(lo => {
        const id = lo._id || lo.id;
        if (id && !mergedOrders.some(mo => (mo._id === id || mo.id === id))) {
          mergedOrders.unshift(lo);
        }
      });

      const mergedRes = Array.isArray(resRes) ? [...resRes] : [];
      localReservations.forEach(lr => {
        const id = lr._id || lr.id;
        if (id && !mergedRes.some(mr => (mr._id === id || mr.id === id))) {
          mergedRes.unshift(lr);
        }
      });

      const mergedRev = Array.isArray(revRes) ? [...revRes] : [];
      localReviews.forEach(lrv => {
        const id = lrv._id || lrv.id;
        if (id && !mergedRev.some(mrv => (mrv._id === id || mrv.id === id))) {
          mergedRev.unshift(lrv);
        }
      });

      setOrders(mergedOrders);
      setReservations(mergedRes);
      setReviews(mergedRev);
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
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchAll]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
  const avgRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : '5.0';
  const todayReservations = reservations.length;

  const chartData = [
    { name: 'Mon', revenue: Math.round(totalRevenue * 0.1) || 2000 },
    { name: 'Tue', revenue: Math.round(totalRevenue * 0.15) || 3000 },
    { name: 'Wed', revenue: Math.round(totalRevenue * 0.12) || 2400 },
    { name: 'Thu', revenue: Math.round(totalRevenue * 0.18) || 3600 },
    { name: 'Fri', revenue: Math.round(totalRevenue * 0.22) || 4500 },
    { name: 'Sat', revenue: Math.round(totalRevenue * 0.25) || 5200 },
    { name: 'Sun', revenue: totalRevenue || 6000 },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Admin Dashboard</h2>
          <p className="text-xs text-gray-500">Live order feeds and customer reservations in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {isConnected ? 'Live Socket Connected' : 'Storage Sync Active'}
          </div>
          <button onClick={fetchAll} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, trend: `${orders.length} orders` },
          { title: "Pending / Active Orders", value: pendingOrders, icon: ShoppingBag, trend: `${orders.length} total` },
          { title: "Table Reservations", value: todayReservations, icon: Users, trend: "Bookings" },
          { title: "Avg Customer Rating", value: avgRating, icon: Star, trend: `${reviews.length} reviews` },
        ].map((stat) => (
          <Card key={stat.title} className="p-6 border-transparent bg-white shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-cafe-text-secondary)]">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-[var(--color-cafe-text-primary)]">{loading ? '—' : stat.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-[var(--color-cafe-primary)]/10 flex items-center justify-center text-[var(--color-cafe-primary)]">
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-[var(--color-cafe-accent)] mr-1" />
              <span className="text-[var(--color-cafe-accent)] font-medium">{stat.trend}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6 border-transparent bg-white shadow-xs">
          <h3 className="font-heading text-lg font-semibold text-[var(--color-cafe-text-primary)] mb-6">Revenue Overview</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cafe-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-cafe-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#785E4F'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#785E4F'}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(140,98,57,0.1)' }}
                  itemStyle={{ color: 'var(--color-cafe-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-cafe-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Recent Orders List */}
        <Card className="p-6 border-transparent bg-white shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-[var(--color-cafe-text-primary)]">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-[var(--color-cafe-primary)] hover:underline">View All →</Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No customer orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">#{String(order._id || order.id || '').slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-gray-500">{order.table || 'Table'}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} items · {order.customer || 'Customer'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-emerald-700">₹{order.totalAmount || 0}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
