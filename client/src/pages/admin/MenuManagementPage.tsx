import React from "react";
import { Plus, Edit2, Trash2, Search, RefreshCw } from "lucide-react";
import { Card, Button } from "@/components/ui";
import toast from "react-hot-toast";

import { FALLBACK_MENU } from "@/data/fallbackMenu";

import type { MenuItem } from "@/types";

export const MenuManagementPage = () => {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error("Fetch error");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        setItems(FALLBACK_MENU);
      }
    } catch (err) {
      console.warn("Using fallback menu data:", err);
      setItems(FALLBACK_MENU);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = (id: string, currentStatus: boolean) => {
    setItems(items.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
    toast.success("Updated item status");
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Menu Item Management</h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">Manage active cafe items, prices in Indian Rupees (₹), and availability.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)] w-full sm:w-64"
            />
          </div>
          <Button onClick={fetchMenu} variant="outline" className="gap-2 px-3">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add New Item
          </Button>
        </div>
      </div>

      <Card className="flex-1 border-transparent overflow-hidden flex flex-col bg-white glass-panel shadow-[var(--shadow-cafe-card)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-[var(--color-cafe-text-secondary)]">Item</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--color-cafe-text-secondary)]">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--color-cafe-text-secondary)]">Price (INR)</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--color-cafe-text-secondary)]">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-[var(--color-cafe-text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-cafe-primary)]"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    No menu items found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-xl object-cover shadow-sm" />
                        <span className="font-bold text-[var(--color-cafe-text-primary)]">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-cafe-text-secondary)]">
                      <span className="bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-full text-xs">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--color-cafe-primary)]">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleAvailability(item._id || item.id || '', !!item.isAvailable)}
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                          item.isAvailable ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-[var(--color-cafe-primary)] transition-colors rounded-lg hover:bg-[var(--color-cafe-primary)]/10">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
