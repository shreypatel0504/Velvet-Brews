import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Coffee, ShoppingBag, Grid, Users, Settings, LogOut, Bell, X, CheckCircle2, Menu, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const role = user?.role?.toLowerCase();
  const isAdmin = Boolean(user && (role === 'admin' || role === 'owner'));

  React.useEffect(() => {
    if (!isAdmin) {
      toast.error("Admin access required. Please log in with admin credentials.");
      navigate("/login");
    }
  }, [isAdmin, navigate]);

  const [notifications, setNotifications] = React.useState([
    { id: 1, text: "New Order #1026 received from Table 3", time: "2 mins ago", unread: true },
    { id: 2, text: "Table 5 requested bill", time: "10 mins ago", unread: true },
    { id: 3, text: "Low stock alert: Blueberry Muffin", time: "1 hour ago", unread: false },
  ]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out from Admin Portal");
    navigate("/login");
  };

  if (!isAdmin) {
    return null;
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Menu", href: "/admin/menu", icon: Coffee },
    { name: "Tables", href: "/admin/tables", icon: Grid },
    { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
    { name: "Staff", href: "/admin/staff", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Coffee className="h-6 w-6 text-[var(--color-cafe-primary)]" />
          <span className="ml-2 font-heading text-xl font-bold text-[var(--color-cafe-primary)]">Velvet Owner</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] font-bold shadow-xs" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`h-5 w-5 mr-3 ${isActive ? "text-[var(--color-cafe-primary)]" : "text-gray-400"}`} />
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
                    const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
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
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
              title="Open Navigation Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-heading text-lg sm:text-xl font-semibold text-gray-800 truncate">
              {navigation.find((n) => location.pathname === n.href || (n.href !== "/admin" && location.pathname.startsWith(n.href)))?.name || (location.pathname.includes("profile") ? "Owner Profile" : "Dashboard")}
            </h1>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Notification Bell Icon */}
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

            {/* Profile Avatar Header */}
            <Link to="/admin/profile" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-full bg-[var(--color-cafe-primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block group-hover:text-[var(--color-cafe-primary)]">
                {user?.name || "Owner"}
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
                  <h3 className="font-bold text-sm text-[var(--color-cafe-text-primary)]">Notifications</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs text-[var(--color-cafe-primary)] hover:underline">
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
                    className={`p-3 rounded-xl text-xs flex gap-3 ${n.unread ? 'bg-[var(--color-cafe-primary)]/5 border border-[var(--color-cafe-primary)]/20' : 'bg-gray-50'}`}
                  >
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${n.unread ? 'text-[var(--color-cafe-primary)]' : 'text-gray-400'}`} />
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
