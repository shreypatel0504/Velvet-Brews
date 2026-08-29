import axios from 'axios';

// ASP.NET Core API Base URL (defaulting to FoodChow .NET API port or custom env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7143/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Standard API Response shape matching ASP.NET Core ApiResponse<T>
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Payment Configuration Types & API
export interface PaymentConfiguration {
  id?: number;
  shopId: number;
  providerName: string; // Stripe, Yoco, Affinia, PayPal, Razorpay
  apiKey: string;
  secretKey: string;
  publishableKey?: string;
  merchantId?: string;
  isTestMode: boolean;
  isActive: boolean;
  createdAt?: string;
}

export const paymentConfigApi = {
  getAll: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<PaymentConfiguration[]>>(`/PaymentConfiguration/get?shopId=${shopId}`);
    return res.data;
  },
  add: async (dto: PaymentConfiguration) => {
    const res = await apiClient.post<ApiResponse<number>>('/PaymentConfiguration/add', dto);
    return res.data;
  },
  update: async (dto: PaymentConfiguration) => {
    const res = await apiClient.put<ApiResponse<boolean>>('/PaymentConfiguration/update', dto);
    return res.data;
  },
  delete: async (id: number, shopId: number) => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/PaymentConfiguration/delete?id=${id}&shopId=${shopId}`);
    return res.data;
  },
};

// Delivery Logistics API Credentials (DoorDash, Lalamove, Porter, UberDirect)
export interface DeliveryApiConfig {
  id?: number;
  shopId: number;
  provider: 'DoorDash' | 'Lalamove' | 'Porter' | 'UberDirect';
  developerId?: string;
  keyId?: string;
  signingSecret?: string;
  market?: string;
  merchantId?: string;
  customerId?: string;
  isActive: boolean;
  isSandbox: boolean;
}

export const deliveryApi = {
  getLalamoveConfig: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<any>>(`/Lalamove/config?shopId=${shopId}`);
    return res.data;
  },
  saveLalamoveConfig: async (dto: any) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/Lalamove/config', dto);
    return res.data;
  },
  getPorterConfig: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<any>>(`/Porter/config?shopId=${shopId}`);
    return res.data;
  },
  savePorterConfig: async (dto: any) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/Porter/config', dto);
    return res.data;
  },
  getDoorDashConfig: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<any>>(`/DoorDashDelivery/config?shopId=${shopId}`);
    return res.data;
  },
  saveDoorDashConfig: async (dto: any) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/DoorDashDelivery/config', dto);
    return res.data;
  },
  getUberDirectConfig: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<any>>(`/UberDirect/config?shopId=${shopId}`);
    return res.data;
  },
  saveUberDirectConfig: async (dto: any) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/UberDirect/config', dto);
    return res.data;
  },
};

// WhatsApp Integration API
export interface WhatsAppConfig {
  shopId: number;
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  businessName: string;
  autoSendOrderConfirmation: boolean;
  autoSendDeliveryStatus: boolean;
  isActive: boolean;
}

export const whatsappApi = {
  getConfig: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<WhatsAppConfig>>(`/Whatsapp/config?shopId=${shopId}`);
    return res.data;
  },
  saveConfig: async (dto: WhatsAppConfig) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/Whatsapp/config', dto);
    return res.data;
  },
  sendTestMessage: async (phone: string, message: string) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/Whatsapp/send-test', { phone, message });
    return res.data;
  },
};

// Hardware / Thermal Printer & KDS API Settings
export interface PrinterConfig {
  id?: number;
  shopId: number;
  printerName: string;
  ipAddress: string;
  port: number;
  paperSize: '58mm' | '80mm';
  interfaceType: 'Network' | 'USB' | 'Bluetooth';
  isDefault: boolean;
  autoPrintOrders: boolean;
}

export const printerApi = {
  getAll: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<PrinterConfig[]>>(`/Printer/list?shopId=${shopId}`);
    return res.data;
  },
  save: async (dto: PrinterConfig) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/Printer/save', dto);
    return res.data;
  },
  delete: async (id: number, shopId: number) => {
    const res = await apiClient.delete<ApiResponse<boolean>>(`/Printer/delete?id=${id}&shopId=${shopId}`);
    return res.data;
  },
  testPrint: async (printerId: number) => {
    const res = await apiClient.post<ApiResponse<boolean>>(`/Printer/test-print?id=${printerId}`);
    return res.data;
  },
};

// KDS Terminals Setting API
export interface KdsTerminalConfig {
  id?: number;
  shopId: number;
  terminalName: string;
  assignedCategories: string[];
  screenRefreshRate: number; // in seconds
  soundNotification: boolean;
  isActive: boolean;
}

export const kdsApi = {
  getSettings: async (shopId: number) => {
    const res = await apiClient.get<ApiResponse<KdsTerminalConfig[]>>(`/KdsTerminalsSetting/get?shopId=${shopId}`);
    return res.data;
  },
  saveSettings: async (dto: KdsTerminalConfig) => {
    const res = await apiClient.post<ApiResponse<boolean>>('/KdsTerminalsSetting/save', dto);
    return res.data;
  },
};
