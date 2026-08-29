import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { CartDrawer, MobileBottomNav, WhatsAppWidget, SplashLoader, InstallPWABanner, OfferPopupModal, NotificationCenterModal } from '@/components';
import { useCartStore } from '@/store/useCartStore';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { isNotificationOpen, setNotificationOpen, activeOffer } = useCartStore();

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashLoader key="splash-screen" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen w-full relative"
          >
            <Toaster position="top-center" />
            <OfferPopupModal />
            <NotificationCenterModal
              isOpen={isNotificationOpen}
              onClose={() => setNotificationOpen(false)}
              activeOffer={activeOffer}
            />
            <CartDrawer />
            <MobileBottomNav />
            <WhatsAppWidget />
            <InstallPWABanner />
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
          </motion.div>
        )}
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
