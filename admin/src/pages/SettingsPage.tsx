import React from "react";
import { Store, MapPin, Phone, Mail, Clock, DollarSign, Receipt, Save, RefreshCw, CheckCircle2, ShieldCheck, QrCode } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import toast from "react-hot-toast";

export interface CafeSettings {
  storeName: string;
  slogan: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  upiVpa: string;
  upiName: string;
  openingTime: string;
  closingTime: string;
  weeklyOff: string;
  isOpenToday: boolean;
  gstRate: number;
  serviceChargeRate: number;
  currencySymbol: string;
  receiptFooterMsg: string;
  autoPrintReceipt: boolean;
  autoAcceptOrders: boolean;
}

const DEFAULT_SETTINGS: CafeSettings = {
  storeName: "Velvet Brews Artisan Cafe & Bistro",
  slogan: "Crafting Coffee Excellence & Gourmet Delights",
  address: "102 VIP Road, Vesu",
  city: "Surat, Gujarat",
  pincode: "395007",
  phone: "+91 98765 43210",
  email: "hello@velvetbrews.com",
  upiVpa: "velvetbrews@upi",
  upiName: "Velvet Brews Coffee House",
  openingTime: "08:00 AM",
  closingTime: "11:00 PM",
  weeklyOff: "None (Open 7 Days)",
  isOpenToday: true,
  gstRate: 5,
  serviceChargeRate: 0,
  currencySymbol: "₹",
  receiptFooterMsg: "Thank you for brewing memories with Velvet Brews! Visit us again soon. ☕",
  autoPrintReceipt: true,
  autoAcceptOrders: true,
};

export const SettingsPage = () => {
  const [settings, setSettings] = React.useState<CafeSettings>(() => {
    try {
      const saved = localStorage.getItem("velvet_store_settings");
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [saving, setSaving] = React.useState(false);

  const handleChange = (key: keyof CafeSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem("velvet_store_settings", JSON.stringify(settings));
        toast.success("Store settings updated & saved successfully! ✨");
      } catch {
        toast.error("Failed to save settings");
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("velvet_store_settings");
    toast.success("Reset settings to default");
  };

  return (
    <div className="max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="h-6 w-6 text-[var(--color-cafe-primary)]" />
            Cafe Store Settings
          </h2>
          <p className="text-sm text-gray-500">Configure store identity, operating hours, tax parameters, and receipt settings.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Reset Defaults
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[var(--color-cafe-primary)] hover:bg-[#724e2c] text-white gap-2 shadow-sm">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Identity Card */}
        <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-bold text-base text-gray-900">Store Profile & Branding</h3>
          </div>

          <Input
            label="Cafe Brand Name"
            value={settings.storeName}
            onChange={(e) => handleChange("storeName", e.target.value)}
          />

          <Input
            label="Tagline / Slogan"
            value={settings.slogan}
            onChange={(e) => handleChange("slogan", e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <Input
              label="Support Email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <Input
            label="Address Street"
            value={settings.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City & State"
              value={settings.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
            <Input
              label="Pincode"
              value={settings.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
            />
          </div>
        </Card>

        {/* Operating Hours & Live Status */}
        <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Clock className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-bold text-base text-gray-900">Operating Hours & Store Status</h3>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
            <div>
              <p className="font-bold text-sm text-emerald-900">Live Store Status</p>
              <p className="text-xs text-emerald-700">Allow online customer orders & table reservations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isOpenToday}
                onChange={(e) => handleChange("isOpenToday", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Opening Time"
              value={settings.openingTime}
              onChange={(e) => handleChange("openingTime", e.target.value)}
            />
            <Input
              label="Closing Time"
              value={settings.closingTime}
              onChange={(e) => handleChange("closingTime", e.target.value)}
            />
          </div>

          <Input
            label="Weekly Off Day"
            value={settings.weeklyOff}
            onChange={(e) => handleChange("weeklyOff", e.target.value)}
          />

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              When store status is toggled OFF, customers on the website will see a polite banner saying "We are currently closed for orders".
            </p>
          </div>
        </Card>

        {/* UPI Payments & Taxes */}
        <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <QrCode className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-bold text-base text-gray-900">UPI Billing & Tax Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="UPI VPA Address"
              value={settings.upiVpa}
              onChange={(e) => handleChange("upiVpa", e.target.value)}
            />
            <Input
              label="Merchant Account Name"
              value={settings.upiName}
              onChange={(e) => handleChange("upiName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="GST / Tax Rate (%)"
              type="number"
              value={settings.gstRate}
              onChange={(e) => handleChange("gstRate", Number(e.target.value))}
            />
            <Input
              label="Service Charge (%)"
              type="number"
              value={settings.serviceChargeRate}
              onChange={(e) => handleChange("serviceChargeRate", Number(e.target.value))}
            />
            <Input
              label="Currency Symbol"
              value={settings.currencySymbol}
              onChange={(e) => handleChange("currencySymbol", e.target.value)}
            />
          </div>
        </Card>

        {/* Thermal Print & Receipt Options */}
        <Card className="p-6 bg-white shadow-xs space-y-4 border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Receipt className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-bold text-base text-gray-900">POS Receipts & Automation</h3>
          </div>

          <Input
            label="Thermal Receipt Footer Message"
            value={settings.receiptFooterMsg}
            onChange={(e) => handleChange("receiptFooterMsg", e.target.value)}
          />

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-sm font-semibold text-gray-800">Auto-Prompt Print Receipt after POS Checkout</span>
              <input
                type="checkbox"
                checked={settings.autoPrintReceipt}
                onChange={(e) => handleChange("autoPrintReceipt", e.target.checked)}
                className="h-4 w-4 text-[var(--color-cafe-primary)] rounded border-gray-300 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-sm font-semibold text-gray-800">Auto-Accept New Online Orders on Arrival</span>
              <input
                type="checkbox"
                checked={settings.autoAcceptOrders}
                onChange={(e) => handleChange("autoAcceptOrders", e.target.checked)}
                className="h-4 w-4 text-[var(--color-cafe-primary)] rounded border-gray-300 focus:ring-amber-500"
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-[var(--color-cafe-primary)] hover:bg-[#724e2c] text-white px-8 py-2.5 text-sm font-bold shadow-md">
          {saving ? "Saving Store Settings..." : "Save All Store Settings"}
        </Button>
      </div>
    </div>
  );
};

