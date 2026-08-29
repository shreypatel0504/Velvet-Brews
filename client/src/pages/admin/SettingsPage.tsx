import * as React from "react";
import { Save, Store, Bell, Percent } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";
import toast from "react-hot-toast";

export const SettingsPage = () => {
  const [cafeName, setCafeName] = React.useState("Velvet Brews");
  const [address, setAddress] = React.useState("102 VIP Road, Vesu, Surat, Gujarat 395007");
  const [phone, setPhone] = React.useState("+91 98765 43210");
  const [gstRate, setGstRate] = React.useState("5");
  const [soundAlerts, setSoundAlerts] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Admin & Store Settings</h2>
        <p className="text-sm text-[var(--color-cafe-text-secondary)]">Manage store information, GST tax calculations, and sound alerts.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Info Card */}
        <Card className="p-6 border-transparent glass-panel space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Store className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-heading text-lg font-bold">Cafe Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="Cafe Name" 
              value={cafeName} 
              onChange={(e) => setCafeName(e.target.value)} 
            />
            <Input 
              label="Contact Phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-cafe-text-secondary)] mb-1">Address</label>
            <textarea 
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-cafe-primary)]"
            />
          </div>
        </Card>

        {/* Taxes & Currency Card */}
        <Card className="p-6 border-transparent glass-panel space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Percent className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-heading text-lg font-bold">Tax & Currency</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input 
              label="GST Percentage (%)" 
              type="number"
              value={gstRate} 
              onChange={(e) => setGstRate(e.target.value)} 
            />
            <div>
              <label className="block text-sm font-medium text-[var(--color-cafe-text-secondary)] mb-1">Currency Symbol</label>
              <input 
                type="text" 
                value="₹ (INR)" 
                disabled 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500"
              />
            </div>
          </div>
        </Card>

        {/* Notifications & Sound Card */}
        <Card className="p-6 border-transparent glass-panel space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Bell className="h-5 w-5 text-[var(--color-cafe-primary)]" />
            <h3 className="font-heading text-lg font-bold">Order Alerts & Sounds</h3>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <div>
              <p className="font-medium text-sm text-[var(--color-cafe-text-primary)]">Sound Notifications</p>
              <p className="text-xs text-[var(--color-cafe-text-secondary)]">Play audio alert when a new order arrives</p>
            </div>
            <input 
              type="checkbox" 
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-cafe-primary)] cursor-pointer"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="gap-2 px-8 h-12 shadow-lg shadow-[var(--color-cafe-primary)]/20">
            <Save className="h-4 w-4" /> Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
