import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  MenuPage,
  AboutPage,
  ContactPage,
  CheckoutPage,
  OrderTrackingPage,
  ReviewsPage,
  TableReservationPage,
  AmbiancePage,
  DashboardPage,
  OrderManagementPage,
  MenuManagementPage,
  TableManagementPage,
  FeedbackManagementPage,
  StaffManagementPage,
  SettingsPage,
  ProfilePage
} from '@/pages';
import { AdminLayout } from '@/components/layout';

import { Toaster } from 'react-hot-toast';
import { CartDrawer, MobileBottomNav, WhatsAppWidget, SplashLoader, NotificationCenterModal } from '@/components';
import { useCartStore } from '@/store/useCartStore';
import { prefetchMenu } from '@/utils/menuCache';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return !sessionStorage.getItem('velvet_splash_shown');
    } catch {
      return false;
    }
  });

  const { isNotificationOpen, setNotificationOpen, activeOffer } = useCartStore();

  // Background pre-warm backend and prefetch menu on website visit
  useEffect(() => {
    prefetchMenu().catch(() => {});
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('velvet_splash_shown', 'true');
    } catch {}
  };

  return (
    <BrowserRouter>
      {showSplash && (
        <SplashLoader onComplete={handleSplashComplete} />
      )}
      <div className="min-h-screen w-full relative">
        <Toaster position="top-center" />
        <NotificationCenterModal
          isOpen={isNotificationOpen}
          onClose={() => setNotificationOpen(false)}
          activeOffer={activeOffer}
        />
        <CartDrawer />
        <MobileBottomNav />
        <WhatsAppWidget />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/ambiance" element={<AmbiancePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reservation" element={<TableReservationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track/:id" element={<OrderTrackingPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrderManagementPage />} />
            <Route path="menu" element={<MenuManagementPage />} />
            <Route path="tables" element={<TableManagementPage />} />
            <Route path="feedback" element={<FeedbackManagementPage />} />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<LandingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
