import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { BroadcastOffersPage } from './pages/BroadcastOffersPage';
import { OrderManagementPage } from './pages/OrderManagementPage';
import { TableManagementPage } from './pages/TableManagementPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { FeedbackManagementPage } from './pages/FeedbackManagementPage';
import { StaffManagementPage } from './pages/StaffManagementPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { POSBillingPage } from './pages/POSBillingPage';
import { ApiKeyManagementPage } from './pages/ApiKeyManagementPage';
import { InquiriesManagementPage } from './pages/InquiriesManagementPage';
import { KitchenDisplayPage } from './pages/KitchenDisplayPage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="broadcast" element={<BroadcastOffersPage />} />
          <Route path="pos" element={<POSBillingPage />} />
          <Route path="kds" element={<KitchenDisplayPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
          <Route path="integrations" element={<ApiKeyManagementPage />} />
          <Route path="inquiries" element={<InquiriesManagementPage />} />
          <Route path="feedback" element={<FeedbackManagementPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

