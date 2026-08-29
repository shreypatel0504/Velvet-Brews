import React from "react";
import { Users, QrCode, Plus, CheckCircle, X, Calendar, RefreshCw, Trash2, Filter, Clock, Phone, MapPin, Sparkles, MessageSquare } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { socket } from "../utils/socket";
import { sharedSync } from "../utils/sharedSync";
import { playReservationChime } from "../utils/audioAlert";
import toast from "react-hot-toast";

interface Table {
  id: number;
  capacity: number;
  status: string;
  time: string | null;
  orderTotal: string | null;
}

interface Reservation {
  _id: string;
  customerName: string;
  phone: string;
  email: string;
  guests: number;
  date: string;
  timeSlot: string;
  tableNumber: string;
  seatingArea: string;
  occasion?: string;
  specialRequest?: string;
  status: string;
  createdAt?: string;
}

const SEATING_AREAS = [
  "Cozy Indoor Booth",
  "Outdoor Garden Patio",
  "Main Dining Hall",
  "VIP Private Lounge",
  "Mezzanine Lounge"
];

const TIME_SLOTS = [
  "08:30 AM", "10:00 AM", "11:30 AM",
  "01:00 PM", "02:30 PM", "04:00 PM",
  "06:00 PM", "07:30 PM", "09:00 PM"
];

const EMPTY_RESERVATION_FORM = {
  customerName: '',
  phone: '',
  email: '',
  guests: 2,
  date: new Date().toISOString().split('T')[0],
  timeSlot: '07:30 PM',
  tableNumber: 'Table 1',
  seatingArea: 'Cozy Indoor Booth',
  occasion: 'Casual Coffee & Dining',
  specialRequest: ''
};

export const TableManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState<'reservations' | 'tables'>('reservations');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedTableQR, setSelectedTableQR] = React.useState<number | null>(null);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_RESERVATION_FORM);
  const [saving, setSaving] = React.useState(false);

  const [tables, setTables] = React.useState<Table[]>([
    { id: 1, capacity: 2, status: 'occupied', time: '45m', orderTotal: '₹320' },
    { id: 2, capacity: 2, status: 'free', time: null, orderTotal: null },
    { id: 3, capacity: 4, status: 'free', time: null, orderTotal: null },
    { id: 4, capacity: 4, status: 'occupied', time: '12m', orderTotal: '₹480' },
    { id: 5, capacity: 6, status: 'occupied', time: '1h 10m', orderTotal: '₹1,250' },
    { id: 6, capacity: 4, status: 'free', time: null, orderTotal: null },
    { id: 7, capacity: 2, status: 'occupied', time: '5m', orderTotal: '₹210' },
    { id: 8, capacity: 2, status: 'free', time: null, orderTotal: null },
  ]);

  const fetchReservations = React.useCallback(async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      const apiRes = Array.isArray(data) ? data : [];
      const localRes = sharedSync.getReservations();

      const merged: any[] = [...apiRes];
      localRes.forEach(lr => {
        const id = lr._id || lr.id;
        if (id && !merged.some(m => (m._id === id || m.id === id))) {
          merged.unshift(lr);
        }
      });

      setReservations(merged);
    } catch {
      setReservations(sharedSync.getReservations() as any);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchReservations();
    socket.connect();

    // Live sync: when customer books table on website
    socket.on('new-reservation', (res: any) => {
      playReservationChime();
      setReservations(prev => {
        const id = res._id || res.id;
        if (id && prev.some(r => r._id === id || (r as any).id === id)) {
          return prev;
        }
        return [res, ...prev];
      });
      toast.success(`📅 New Booking: ${res.tableNumber} for ${res.customerName} (${res.guests} guests)!`, { duration: 6000 });
    });

    socket.on('reservation-updated', (updated: any) => {
      setReservations(prev => prev.map(r => (r._id === updated._id || r._id === updated.id) ? { ...r, ...updated } : r));
    });

    socket.on('reservation-deleted', (payload: any) => {
      setReservations(prev => prev.filter(r => r._id !== payload._id && r._id !== payload.id));
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchReservations();
    });

    return () => {
      socket.off('new-reservation');
      socket.off('reservation-updated');
      socket.off('reservation-deleted');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchReservations]);

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.phone) {
      toast.error("Customer name and phone number are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) throw new Error("Failed to save");
      const created = await res.json();
      toast.success(`🎉 Reservation created for ${created.customerName} on ${created.tableNumber}!`);
      setShowAddModal(false);
      setForm(EMPTY_RESERVATION_FORM);
      fetchReservations();
    } catch (e: any) {
      toast.error("Failed to create reservation");
    } finally {
      setSaving(false);
    }
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      await fetch(`http://localhost:5000/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success(`Reservation status updated to: ${status.toUpperCase()}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteReservation = async (id: string, name: string) => {
    if (!confirm(`Delete reservation for "${name}"?`)) return;
    try {
      await fetch(`http://localhost:5000/api/reservations/${id}`, { method: 'DELETE' });
      setReservations(prev => prev.filter(r => r._id !== id));
      toast.success("Reservation deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleTableStatus = (id: number) => {
    setTables(tables.map(t => {
      if (t.id === id) {
        const isFree = t.status === 'free';
        return {
          ...t,
          status: isFree ? 'occupied' : 'free',
          time: isFree ? 'Just now' : null,
          orderTotal: isFree ? '₹0' : null
        };
      }
      return t;
    }));
    toast.success(`Table ${id} status updated`);
  };

  const handleAddFloorTable = () => {
    const nextId = tables.length + 1;
    setTables([...tables, { id: nextId, capacity: 4, status: 'free', time: null, orderTotal: null }]);
    toast.success(`Table ${nextId} added to floor layout!`);
  };

  const filteredReservations = reservations.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const counts = {
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[var(--color-cafe-primary)]" /> Table Bookings & Floor Management
          </h2>
          <p className="text-sm text-gray-500">
            Real-time table reservations from the customer website + live floor table monitoring.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Book Table
          </Button>

          <button
            onClick={fetchReservations}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reservations' ? 'bg-[var(--color-cafe-primary)] text-white shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" /> Bookings ({reservations.length})
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tables' ? 'bg-white text-[var(--color-cafe-primary)] shadow' : 'text-gray-600 hover:text-black'
              }`}
            >
              Floor Layout ({tables.length})
            </button>
          </div>
        </div>
      </div>

      {/* RESERVATIONS TAB */}
      {activeTab === 'reservations' && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Confirmed Bookings", count: counts.confirmed, color: "bg-amber-50 text-amber-800 border-amber-200", filterKey: "confirmed" },
              { label: "Guests Seated Now", count: counts.seated, color: "bg-emerald-50 text-emerald-800 border-emerald-200", filterKey: "seated" },
              { label: "Completed Today", count: counts.completed, color: "bg-blue-50 text-blue-800 border-blue-200", filterKey: "completed" },
              { label: "Cancelled", count: counts.cancelled, color: "bg-red-50 text-red-800 border-red-200", filterKey: "cancelled" },
            ].map((s) => (
              <Card
                key={s.label}
                onClick={() => setStatusFilter(statusFilter === s.filterKey ? 'all' : s.filterKey)}
                className={`p-4 border cursor-pointer transition-all hover:scale-[1.02] ${s.color} ${
                  statusFilter === s.filterKey ? 'ring-2 ring-[var(--color-cafe-primary)] shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">{s.count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-md">
                    {s.filterKey}
                  </span>
                </div>
                <p className="text-xs font-bold mt-1">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Filter Status:
            </span>
            {['all', 'confirmed', 'seated', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase border transition-all ${
                  statusFilter === st
                    ? 'bg-[var(--color-cafe-primary)] text-white border-transparent shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Reservation List Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="h-60 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredReservations.length === 0 ? (
            <Card className="p-12 text-center bg-gray-50/80 border-dashed">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700">No Reservations Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Customer bookings from the website or walk-in entries created via "+ Book Table" will appear here in real-time.
              </p>
              <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-2 text-xs">
                <Plus className="h-4 w-4" /> Create Reservation
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservations.map((res) => (
                <Card key={res._id} className="p-5 bg-white border-2 border-amber-100 hover:border-amber-300 transition-all shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-cafe-primary)]">
                          #{String(res._id).slice(-6).toUpperCase()}
                        </span>
                        <h3 className="font-bold text-lg text-gray-900 leading-snug">{res.customerName}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'confirmed' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        res.status === 'seated' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        res.status === 'completed' ? 'bg-blue-50 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    {/* Reservation Details */}
                    <div className="space-y-1.5 text-xs text-gray-600 mt-3 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reserved Table:</span>
                        <span className="font-bold text-emerald-700">{res.tableNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Seating Area:</span>
                        <span className="font-bold text-gray-800">{res.seatingArea}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date & Slot:</span>
                        <span className="font-bold text-gray-800">{res.date} @ {res.timeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Guests Count:</span>
                        <span className="font-bold text-[var(--color-cafe-primary)]">{res.guests} Guests</span>
                      </div>
                      {res.occasion && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Occasion:</span>
                          <span className="font-bold text-amber-800">{res.occasion}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-gray-100 pt-1.5">
                        <span className="text-gray-400">Contact Phone:</span>
                        <a href={`tel:${res.phone}`} className="font-bold text-blue-600 hover:underline">{res.phone}</a>
                      </div>
                    </div>

                    {/* Special Request */}
                    {res.specialRequest && (
                      <div className="bg-amber-50/60 p-2.5 rounded-xl text-xs text-amber-900 border border-amber-200/60 mb-3">
                        <p className="italic">"{res.specialRequest}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      {res.status === 'confirmed' && (
                        <Button
                          onClick={() => updateReservationStatus(res._id, 'seated')}
                          className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Seat Guests ✓
                        </Button>
                      )}
                      {res.status === 'seated' && (
                        <Button
                          onClick={() => updateReservationStatus(res._id, 'completed')}
                          variant="outline"
                          className="w-full text-xs h-8 text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          Mark Completed
                        </Button>
                      )}
                      {res.status === 'completed' && (
                        <span className="w-full text-center text-xs font-bold text-emerald-700 py-1.5 bg-emerald-50 rounded-lg">
                          Completed ✓
                        </span>
                      )}
                      {res.status === 'cancelled' && (
                        <span className="w-full text-center text-xs font-bold text-red-600 py-1.5 bg-red-50 rounded-lg">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {res.status !== 'cancelled' && res.status !== 'completed' && (
                      <button
                        onClick={() => updateReservationStatus(res._id, 'cancelled')}
                        title="Cancel Reservation"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteReservation(res._id, res.customerName)}
                      title="Delete Entry"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* FLOOR TABLES TAB */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Interactive Floor Table Control</h3>
              <p className="text-xs text-amber-700">Click any table card to toggle vacant vs occupied, or preview table QR code.</p>
            </div>
            <Button onClick={handleAddFloorTable} variant="outline" className="gap-2 text-xs bg-white">
              <Plus className="h-4 w-4" /> Add Floor Table
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map(table => (
              <Card key={table.id} className={`p-6 border-2 transition-all hover:shadow-md ${
                table.status === 'occupied' ? 'border-amber-300 bg-amber-50/40' : 'border-gray-100 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-2xl font-bold text-gray-900">Table {table.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    table.status === 'occupied' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {table.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-gray-600 text-sm mb-6">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Users className="h-4 w-4 text-[var(--color-cafe-primary)]" />
                    <span>{table.capacity} Seats</span>
                  </div>
                  <button
                    onClick={() => setSelectedTableQR(table.id)}
                    title="View Table QR Code"
                    className="p-2 bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] rounded-xl hover:bg-[var(--color-cafe-primary)] hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
                  >
                    <QrCode className="h-4 w-4" /> QR Code
                  </button>
                </div>

                {table.status === 'occupied' ? (
                  <div className="space-y-2 border-t border-amber-200/60 pt-4">
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Seated Duration:</span><span className="font-bold text-gray-800">{table.time}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-gray-500">Current Bill:</span><span className="font-bold text-[var(--color-cafe-primary)]">{table.orderTotal}</span></div>
                    <Button onClick={() => toggleTableStatus(table.id)} className="w-full mt-2 text-xs" variant="outline" size="sm">
                      Mark Table Vacant
                    </Button>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 pt-4">
                    <Button onClick={() => toggleTableStatus(table.id)} className="w-full text-xs" variant="ghost" size="sm">
                      Seat Customer Here
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CREATE NEW RESERVATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading text-xl font-bold text-gray-900">Book Table Reservation</h3>
                <p className="text-xs text-gray-500">Record a phone-in or walk-in table booking for a customer.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Customer Name *"
                    value={form.customerName}
                    onChange={(e: any) => setForm({ ...form, customerName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Phone Number *"
                    value={form.phone}
                    onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(e: any) => setForm({ ...form, email: e.target.value })}
                    placeholder="customer@gmail.com"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Guests Count</label>
                  <select
                    value={form.guests}
                    onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                      <option key={g} value={g}>{g} Guests</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <Input
                    label="Date *"
                    type="date"
                    value={form.date}
                    onChange={(e: any) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Time Slot</label>
                  <select
                    value={form.timeSlot}
                    onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Table</label>
                  <select
                    value={form.tableNumber}
                    onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {tables.map(t => <option key={t.id} value={`Table ${t.id}`}>Table {t.id} ({t.capacity} seats)</option>)}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Seating Area</label>
                  <select
                    value={form.seatingArea}
                    onChange={(e) => setForm({ ...form, seatingArea: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  >
                    {SEATING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Special Request / Notes</label>
                  <textarea
                    value={form.specialRequest}
                    onChange={(e) => setForm({ ...form, specialRequest: e.target.value })}
                    rows={2}
                    placeholder="e.g. Window seat requested, anniversary cake setup..."
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-cafe-primary)]/30"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" onClick={() => setShowAddModal(false)} variant="outline" className="w-full">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="w-full gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {saving ? "Saving..." : "Confirm Booking"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* QR CODE MODAL */}
      {selectedTableQR !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 bg-white text-center rounded-3xl shadow-2xl space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setSelectedTableQR(null)} className="p-1 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cafe-primary)]">Velvet Brews Cafe</span>
            <h3 className="font-heading text-3xl font-bold text-gray-900">Table {selectedTableQR}</h3>
            
            <div className="mx-auto w-48 h-48 bg-gray-50 border-2 border-[var(--color-cafe-primary)]/20 rounded-2xl flex items-center justify-center p-2 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://localhost:5173/menu?table=${selectedTableQR}`}
                alt={`Table ${selectedTableQR} QR`}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-gray-500">Scan to view menu & place orders directly for Table {selectedTableQR}</p>
            
            <Button
              onClick={() => {
                toast.success(`Table ${selectedTableQR} QR Standee sent to printer!`);
                setSelectedTableQR(null);
              }}
              className="w-full gap-2 mt-2"
            >
              <CheckCircle className="h-4 w-4" /> Print QR Standee
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
