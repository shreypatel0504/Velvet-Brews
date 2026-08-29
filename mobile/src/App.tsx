import React, { useState, useCallback, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav, TabType } from './components/BottomNav';
import { ItemCustomizationModal } from './components/ItemCustomizationModal';
import { OfferPopupModal, BroadcastOfferPayload } from './components/OfferPopupModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { MenuItem } from './types';

// Lazy-load screens → separate JS chunks, smaller initial bundle
const HomeScreen = lazy(() => import('./screens/HomeScreen').then(m => ({ default: m.HomeScreen })));
const MenuScreen = lazy(() => import('./screens/MenuScreen').then(m => ({ default: m.MenuScreen })));
const CartScreen = lazy(() => import('./screens/CartScreen').then(m => ({ default: m.CartScreen })));
const OrderTrackingScreen = lazy(() => import('./screens/OrderTrackingScreen').then(m => ({ default: m.OrderTrackingScreen })));
const TableBookingScreen = lazy(() => import('./screens/TableBookingScreen').then(m => ({ default: m.TableBookingScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeOffer, setActiveOffer] = useState<BroadcastOfferPayload | null>(null);

  const handleSelectItem = useCallback((item: MenuItem) => setSelectedMenuItem(item), []);
  const handleCloseModal = useCallback(() => setSelectedMenuItem(null), []);
  const handleTabChange = useCallback((tab: TabType) => setActiveTab(tab), []);
  const handleOpenNotif = useCallback(() => setIsNotificationOpen(true), []);
  const handleCloseNotif = useCallback(() => setIsNotificationOpen(false), []);
  const handleProfileNav = useCallback(() => setActiveTab('profile'), []);
  const handleOrderPlaced = useCallback(() => setActiveTab('tracking'), []);
  const handleActiveOffer = useCallback((offer: BroadcastOfferPayload | null) => setActiveOffer(offer), []);

  return (
    <div className="min-h-screen bg-[#120d0a] text-[#fef3c7] flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-[#d97706]/10">
      
      {/* React Hot Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />

      {/* Real-time Broadcast Offer Pop-up Modal */}
      <OfferPopupModal 
        onNavigateTab={handleTabChange}
        onActiveOfferChange={handleActiveOffer}
      />

      {/* Mobile Notification Inbox & Deals Drawer */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={handleCloseNotif}
        activeOffer={activeOffer}
        onNavigateTab={handleTabChange}
      />

      {/* Top Mobile App Header */}
      <MobileHeader 
        onNotificationClick={handleOpenNotif}
        onProfileClick={handleProfileNav}
      />

      {/* Main Screen Router View — lazy chunks, 0 paint block */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain">
        <Suspense fallback={null}>
          {activeTab === 'home' && (
            <HomeScreen 
              onSelectItem={handleSelectItem}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'menu' && (
            <MenuScreen 
              onSelectItem={handleSelectItem}
            />
          )}

          {activeTab === 'cart' && (
            <CartScreen 
              onOrderPlaced={handleOrderPlaced}
            />
          )}

          {activeTab === 'tracking' && (
            <OrderTrackingScreen />
          )}

          {activeTab === 'booking' && (
            <TableBookingScreen />
          )}

          {activeTab === 'profile' && (
            <ProfileScreen />
          )}
        </Suspense>
      </main>

      {/* Customization Modal */}
      <ItemCustomizationModal 
        item={selectedMenuItem}
        onClose={handleCloseModal}
      />

      {/* Bottom Sticky Mobile Navigation Bar */}
      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOffersClick={handleOpenNotif}
      />

    </div>
  );
}

export default App;
