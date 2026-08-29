import React from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Save, X } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import toast from "react-hot-toast";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
}

const CATEGORIES = ["Coffee", "Tea", "Pizza", "Sandwich", "Pastries", "Food"];

const EMPTY_FORM = { name: '', description: '', category: 'Coffee', price: '', imageUrl: '', isAvailable: true };

export const MenuManagementPage = () => {
  const [items, setItems] = React.useState<MenuItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editItem, setEditItem] = React.useState<MenuItem | null>(null);
  const [form, setForm] = React.useState<any>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("All");

  // Fetch menu from backend API
  const fetchMenu = React.useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.warn("Failed to load menu from server");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMenu();
    socket.connect();
    // If another admin changes menu, stay in sync
    socket.on('menu-updated', fetchMenu);
    return () => { socket.off('menu-updated'); socket.disconnect(); };
  }, [fetchMenu]);

  const openAddForm = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description, category: item.category, price: String(item.price), imageUrl: item.imageUrl, isAvailable: item.isAvailable });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error("Name and Price are required");
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      const url = editItem ? `/api/menu/${editItem._id}` : `/api/menu`;
      const method = editItem ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editItem ? "Menu item updated! Website will refresh automatically." : "New item added to menu!");
      setShowForm(false);
      fetchMenu();
    } catch (e: any) {
      toast.error("Failed to save menu item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}" from menu?`)) return;
    try {
      await fetch(`/api/menu/${item._id}`, { method: 'DELETE' });
      toast.success(`"${item.name}" removed from menu. Website updated!`);
      fetchMenu();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable })
      });
      if (!res.ok) throw new Error();
      toast.success(`"${item.name}" is now ${!item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} on the website`);
      fetchMenu();
    } catch {
      toast.error("Update failed");
    }
  };

  const displayItems = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-500">
            Changes here update the <strong>customer website menu in real-time</strong> via live sync.
          </p>
        </div>
        <Button onClick={openAddForm} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> Add Menu Item
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeCategory === cat ? 'bg-[var(--color-cafe-primary)] text-white border-[var(--color-cafe-primary)]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: items.length, color: "bg-blue-50 text-blue-700" },
          { label: "Available", value: items.filter(i => i.isAvailable).length, color: "bg-emerald-50 text-emerald-700" },
          { label: "Unavailable", value: items.filter(i => !i.isAvailable).length, color: "bg-red-50 text-red-700" },
          { label: "Categories", value: [...new Set(items.map(i => i.category))].length, color: "bg-amber-50 text-amber-700" },
        ].map((s, i) => (
          <Card key={i} className={`p-4 ${s.color} border-0`}>
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayItems.map(item => (
            <Card key={item._id} className={`p-0 bg-white shadow-xs overflow-hidden border-2 ${item.isAvailable ? 'border-transparent hover:border-emerald-200' : 'border-red-100'} transition-all`}>
              <div className="relative h-40 bg-gray-100">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className={`absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.isAvailable ? '✓ Available' : '✕ Hidden'}
                </span>
                <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-lg text-emerald-700">₹{item.price}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      title={item.isAvailable ? "Mark Unavailable" : "Mark Available"}
                      className={`p-2 rounded-xl transition-colors ${item.isAvailable ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      {item.isAvailable ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit Item"
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Delete Item"
                      className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold">{editItem ? 'Edit Menu Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input label="Item Name *" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Vanilla Latte" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Input label="Price (₹) *" type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} placeholder="180" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Short description of the item..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                />
              </div>
              <div className="col-span-2">
                <Input label="Image URL" value={form.imageUrl} onChange={(e: any) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://images.unsplash.com/..." />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Available on Website?</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${form.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-xs font-bold text-gray-500">{form.isAvailable ? 'Visible to customers' : 'Hidden from customers'}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setShowForm(false)} variant="outline" className="w-full">Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : (editItem ? 'Update Item' : 'Add to Menu')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
