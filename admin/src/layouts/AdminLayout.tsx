import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Coffee, ShoppingBag, Grid, Users, Settings, LogOut, Bell, X, CheckCircle2, Menu, MessageSquare, Printer, Key, Mail, Volume2, VolumeX, Flame, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import { playOrderChime, playReservationChime, playFeedbackChime, playMessageChime, setSoundEnabled, getSoundEnabled } from "../utils/audioAlert";

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);

  const [notifications, setNotifications] = React.useState([
    { id: 1, text: "🚨 New Order #1026 received for ₹540", time: "Just now", unread: true },
    { id: 2, text: "📅 Table 3 reserved by Priya Sharma", time: "5 mins ago", unread: true },
    { id: 3, text: "💬 New Contact Inquiry from Amit", time: "15 mins ago", unread: true },
  ]);

  React.useEffect(() => {
    socket.connect();

    socket.on('new-order', (order: any) => {
      playOrderChime();
      const text = `🚨 New Order #${(order._id || order.id || '1000').slice(-4)} (${order.table || 'Dine-In'}): ₹${order.totalAmount || 0}`;
      setNotifications(prev => [{ id: Date.now(), text, time: "Just now", unread: true }, ...prev]);
    });

    socket.on('new-reservation', (res: any) => {
      playReservationChime();
      const text = `📅 Table Booking: ${res.customerName} booked ${res.tableNumber || 'Table'} for ${res.guests || 2} guests`;
      setNotifications(prev => [{ id: Date.now(), text, time: "Just now", unread: true }, ...prev]);
    });

    socket.on('new-feedback', (data: any) => {
      playFeedbackChime();
      const text = `⭐ New Customer Review: ${data.customerName || 'Customer'} left a rating`;
      setNotifications(prev => [{ id: Date.now(), text, time: "Just now", unread: true }, ...prev]);
    });

    socket.on('new-contact', (msg: any) => {
      playMessageChime();
      const text = `💬 New Message: ${msg.name} sent contact inquiry "${msg.subject || 'Inquiry'}"`;
      setNotifications(prev => [{ id: Date.now(), text, time: "Just now", unread: true }, ...prev]);
    });

    socket.on('new-subscriber', (sub: any) => {
      playMessageChime();
      const text = `📧 New Subscriber: ${sub.email}`;
      setNotifications(prev => [{ id: Date.now(), text, time: "Just now", unread: true }, ...prev]);
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      // Shared sync listener
    });

    return () => {
      socket.off('new-order');
      socket.off('new-reservation');
      socket.off('new-feedback');
      socket.off('new-contact');
      socket.off('new-subscriber');
      unsubscribeStorage();
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    toast.success(next ? "Audio Alert Chimes Enabled 🔊" : "Audio Muted 🔇");
  };

  const handleLogout = () => {
    toast.success("Logged out from Admin Portal");
    navigate("/login");
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "📢 Promotions & Broadcast", href: "/broadcast", icon: Megaphone },
    { name: "POS Counter Billing", href: "/pos", icon: Printer },
    { name: "Kitchen KDS (Chef Screen)", href: "/kds", icon: Flame },
    { name: "Orders", href: "/orders", icon: ShoppingBag },
    { name: "Menu", href: "/menu", icon: Coffee },
    { name: "Tables & Bookings", href: "/tables", icon: Grid },
    { name: "Messages & Subscribers", href: "/inquiries", icon: Mail },
    { name: "Customer Feedback", href: "/feedback", icon: MessageSquare },
    { name: "Staff Management", href: "/staff", icon: Users },
    { name: "API Keys & Integrations", href: "/integrations", icon: Key },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Coffee className="h-6 w-6 text-[var(--color-cafe-primary)]" />
          <span className="ml-2 font-heading text-xl font-bold text-[var(--color-cafe-primary)]">Velvet Owner</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? "bg-[var(--color-cafe-primary)] text-white shadow-sm font-bold" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3 text-gray-400 group-hover:text-red-600" />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-6 w-6 text-[var(--color-cafe-primary)]" />
                    <span className="font-heading text-xl font-bold text-[var(--color-cafe-primary)]">Velvet Owner</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-black">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                          isActive 
                            ? "bg-[var(--color-cafe-primary)] text-white shadow-md" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" /> Log out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
              title="Open Navigation Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-gray-900 truncate">
              {navigation.find((n) => location.pathname === n.href || (n.href !== "/" && location.pathname.startsWith(n.href)))?.name || "Owner Portal"}
            </h1>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-full transition-colors ${
                soundOn ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-gray-400 bg-gray-100'
              }`}
              title={soundOn ? "Sound Chime Enabled" : "Sound Muted"}
            >
              {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>

            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-500 hover:text-[var(--color-cafe-primary)] relative rounded-full hover:bg-gray-50 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>

            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-full bg-[var(--color-cafe-primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                A
              </div>
              <span className="text-sm font-bold text-gray-800 hidden sm:inline-block group-hover:text-[var(--color-cafe-primary)]">
                Admin Owner
              </span>
            </Link>
          </div>
        </header>

        {/* Notifications Popover */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-4 sm:right-6 top-16 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden p-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[var(--color-cafe-primary)]" />
                  <h3 className="font-bold text-sm text-[var(--color-cafe-text-primary)]">Live Website Alerts</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs text-[var(--color-cafe-primary)] font-bold hover:underline">
                    Mark all read
                  </button>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-black">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3 rounded-xl text-xs flex gap-3 ${n.unread ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}
                  >
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${n.unread ? 'text-amber-700' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{n.text}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
