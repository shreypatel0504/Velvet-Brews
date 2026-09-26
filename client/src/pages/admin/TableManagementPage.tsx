import React from "react";
import { Users, QrCode, Plus, CheckCircle, X, Calendar, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
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

export const TableManagementPage = () => {
  const [activeTab, setActiveTab] = React.useState<'reservations' | 'tables'>('reservations');
  const [selectedTableQR, setSelectedTableQR] = React.useState<number | null>(null);
  const [reservations, setReservations] = React.useState<Reservation[]>([]);

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

  const isDuplicateReservation = (a: any, b: any) => {
    const idA = a._id || a.id;
    const idB = b._id || b.id;
    if (idA && idB && String(idA) === String(idB)) return true;
    const normTable = (t: string) => {
      const match = String(t || '').match(/\d+/);
      return match ? `Table ${match[0]}` : String(t || '').trim().toLowerCase();
    };
    const normDate = (d: string) => (d || '').split('T')[0].trim();
    const normSlot = (s: string) => (s || '').toLowerCase().replace(/^0/, '').replace(/\s+/g, '');

    const tableMatch = normTable(a.tableNumber) === normTable(b.tableNumber);
    const dateMatch = normDate(a.date) === normDate(b.date);
    const slotMatch = normSlot(a.timeSlot) === normSlot(b.timeSlot);
    const nameMatch = (a.customerName || '').trim().toLowerCase() === (b.customerName || '').trim().toLowerCase();
    return (tableMatch && dateMatch && slotMatch && nameMatch) || (tableMatch && dateMatch && slotMatch);
  };

  const fetchReservations = React.useCallback(async () => {
    try {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      const apiRes = Array.isArray(data) ? data : [];
      const localRes = sharedSync.getReservations();

      const merged: any[] = [];
      apiRes.forEach((item) => {
        if (!merged.some((m) => isDuplicateReservation(m, item))) {
          merged.push(item);
        }
      });
      localRes.forEach((lr) => {
        if (!merged.some((m) => isDuplicateReservation(m, lr))) {
          merged.push(lr);
        }
      });

      setReservations(merged);
    } catch {
      setReservations(sharedSync.getReservations() as any);
    }
  }, []);

  React.useEffect(() => {
    fetchReservations();
    socket.connect();

    socket.on('new-reservation', (res: any) => {
      const newRes: Reservation = {
        _id: String(res._id || res.id || `RES-${Math.floor(1000 + Math.random() * 9000)}`),
        customerName: res.customerName || "Guest",
        phone: res.phone || "",
        email: res.email || "",
        guests: res.guests || 2,
        date: res.date || "Today",
        timeSlot: res.timeSlot || "07:00 PM",
        tableNumber: res.tableNumber || "Table 1",
        seatingArea: res.seatingArea || "Cozy Indoor Booth",
        occasion: res.occasion || "Dining",
        specialRequest: res.specialRequest || "",
        status: res.status || "confirmed"
      };

      setReservations((prev) => {
        if (prev.some((r) => isDuplicateReservation(r, newRes))) return prev;
        toast.success(`🎉 New Table Reservation: ${newRes.tableNumber} (${newRes.customerName})!`, { duration: 5000 });
        return [newRes, ...prev];
      });
    });

    socket.on('reservation-updated', (updated: any) => {
      setReservations(prev => prev.map(r => r._id === updated._id || r._id === updated.id ? { ...r, status: updated.status } : r));
    });

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchReservations();
    });

    return () => {
      socket.off('new-reservation');
      socket.off('reservation-updated');
      socket.disconnect();
      unsubscribeStorage();
    };
  }, [fetchReservations]);

  const toggleReservationStatus = async (id: string, nextStatus: string) => {
    setReservations(prev => prev.map(r => r._id === id || (r as any).id === id ? { ...r, status: nextStatus } : r));
    socket.emit('reservation-updated', { _id: id, id, status: nextStatus });

    const localRes = sharedSync.getReservations();
    const target = localRes.find(r => r._id === id || r.id === id);
    if (target) {
      target.status = nextStatus;
      sharedSync.saveReservation(target);
    }
    sharedSync.updateReservationStatus(id, nextStatus);

    try {
      await fetch(`/api/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch {
      // Storage and socket already updated
    }

    if (nextStatus === 'completed') {
      toast.success(`🎉 Reservation #${String(id).slice(-4)} marked COMPLETED! Table has been released and is now open for new bookings.`);
    } else if (nextStatus === 'cancelled') {
      toast.success(`Reservation cancelled. Table has been released.`);
    } else {
      toast.success(`Reservation status updated to: ${nextStatus.toUpperCase()}`);
    }
  };

  const handleDeleteReservation = async (id: string, name: string) => {
    if (!confirm(`Delete reservation for "${name}"? This will also release the table.`)) return;
    setReservations(prev => prev.filter(r => r._id !== id && (r as any).id !== id));
    socket.emit('reservation-deleted', { _id: id, id });
    sharedSync.deleteReservation(id);

    try {
      await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
    } catch {}
    toast.success("Reservation deleted & table released");
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

  const handleAddTable = () => {
    const newId = tables.length + 1;
    setTables([...tables, { id: newId, capacity: 4, status: 'free', time: null, orderTotal: null }]);
    toast.success(`Table ${newId} added!`);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">
            Table & Reservation Management
          </h2>
          <p className="text-sm text-[var(--color-cafe-text-secondary)]">
            Manage live seating, table QR codes, and customer online reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tables' ? 'bg-white text-[var(--color-cafe-primary)] shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              Floor Tables ({tables.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reservations' ? 'bg-[var(--color-cafe-primary)] text-white shadow-xs' : 'text-gray-600 hover:text-black'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" /> Bookings ({reservations.filter(r => r.status === 'confirmed').length})
            </button>
          </div>

          <Button onClick={handleAddTable} className="gap-2">
            <Plus className="h-4 w-4" /> Add Table
          </Button>
        </div>
      </div>

      {activeTab === 'reservations' ? (
        /* Live Customer Reservations List */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((res) => (
              <Card key={res._id} className="p-6 bg-white border-2 border-amber-100 hover:border-amber-300 transition-all shadow-xs relative">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-cafe-primary)]">
                      {res._id}
                    </span>
                    <h3 className="font-bold text-lg text-[var(--color-cafe-text-primary)]">
                      {res.customerName}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    res.status === 'confirmed' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    res.status === 'seated' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    res.status === 'completed' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {res.status === 'completed' ? 'Completed (Table Free)' : res.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">Reserved Table:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">{res.tableNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">Seating Area:</span>
                    <span className="font-bold text-gray-800">{res.seatingArea}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">Date & Slot:</span>
                    <span className="font-bold text-gray-800">{res.date} @ {res.timeSlot}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">Party Size:</span>
                    <span className="font-bold text-[var(--color-cafe-primary)]">{res.guests} Guests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500">Occasion:</span>
                    <span className="font-bold text-gray-800">{res.occasion}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="font-semibold text-gray-500">Phone:</span>
                    <a href={`tel:${res.phone}`} className="font-bold text-blue-600 hover:underline">{res.phone}</a>
                  </div>
                </div>

                {res.specialRequest && (
                  <div className="bg-gray-50 p-2.5 rounded-xl text-xs text-gray-600 mb-4 border border-gray-100">
                    <span className="font-bold text-gray-700 block">Note:</span>
                    <p className="italic">"{res.specialRequest}"</p>
                  </div>
                )}

                {/* Actions: Admin can Mark Completed to free table */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    {res.status === 'confirmed' && (
                      <>
                        <Button
                          onClick={() => toggleReservationStatus(res._id, 'seated')}
                          className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                        >
                          Seat Guests
                        </Button>
                        <Button
                          onClick={() => toggleReservationStatus(res._id, 'completed')}
                          variant="outline"
                          className="flex-1 text-xs h-8 text-blue-700 border-blue-300 hover:bg-blue-50"
                        >
                          Mark Completed
                        </Button>
                      </>
                    )}
                    {res.status === 'seated' && (
                      <Button
                        onClick={() => toggleReservationStatus(res._id, 'completed')}
                        className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ✓ Mark Completed (Release Table)
                      </Button>
                    )}
                    {res.status === 'completed' && (
                      <div className="w-full flex items-center justify-between bg-blue-50/70 border border-blue-200 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-bold text-blue-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> Completed (Table Freed)
                        </span>
                        <button
                          onClick={() => toggleReservationStatus(res._id, 'confirmed')}
                          className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Re-open
                        </button>
                      </div>
                    )}
                    {res.status === 'cancelled' && (
                      <div className="w-full flex items-center justify-between bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                        <span className="text-xs font-bold text-red-700">Cancelled (Table Freed)</span>
                        <button
                          onClick={() => toggleReservationStatus(res._id, 'confirmed')}
                          className="text-[11px] font-semibold text-red-700 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Re-open
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {res.status !== 'cancelled' && res.status !== 'completed' && (
                      <button
                        onClick={() => toggleReservationStatus(res._id, 'cancelled')}
                        className="text-red-500 hover:text-red-700 font-medium text-[11px] hover:underline"
                      >
                        Cancel Reservation
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReservation(res._id, res.customerName)}
                      className="ml-auto text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* Floor Tables Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {tables.map(table => (
          <Card key={table.id} className={`p-6 border-2 transition-all hover:shadow-md glass-panel ${
            table.status === 'occupied' ? 'border-amber-300 bg-amber-50/40' : 'border-transparent hover:border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-2xl font-bold text-[var(--color-cafe-text-primary)]">Table {table.id}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                table.status === 'occupied' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {table.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-[var(--color-cafe-text-secondary)] text-sm mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{table.capacity} Seats</span>
              </div>
              <button 
                onClick={() => setSelectedTableQR(table.id)} 
                title="View Table QR Code"
                className="p-2 bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] rounded-xl hover:bg-[var(--color-cafe-primary)] hover:text-white transition-colors"
              >
                <QrCode className="h-5 w-5" />
              </button>
            </div>

            {table.status === 'occupied' ? (
              <div className="space-y-3 border-t border-amber-200/60 pt-4 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-cafe-text-secondary)]">Time Seated</span>
                  <span className="font-medium text-[var(--color-cafe-text-primary)]">{table.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-cafe-text-secondary)]">Current Bill</span>
                  <span className="font-bold text-[var(--color-cafe-primary)]">{table.orderTotal}</span>
                </div>
                <Button onClick={() => toggleTableStatus(table.id)} className="w-full mt-2" variant="outline" size="sm">
                  Mark as Vacant
                </Button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 mt-2">
                <Button onClick={() => toggleTableStatus(table.id)} className="w-full" variant="ghost" size="sm">
                  Seat Customer
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      )}

      {/* QR Code Printable Modal */}
      {selectedTableQR !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-sm w-full p-6 bg-white text-center rounded-3xl shadow-2xl">
            <div className="flex justify-end">
              <button onClick={() => setSelectedTableQR(null)} className="p-1 text-gray-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="py-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-cafe-primary)]">Velvet Brews Cafe</span>
              <h3 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mt-1 mb-4">
                Table {selectedTableQR}
              </h3>
              
              <div className="mx-auto w-48 h-48 bg-gray-50 border-2 border-[var(--color-cafe-primary)]/20 rounded-2xl flex flex-col items-center justify-center p-4 my-4 shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://localhost:5173/menu?table=${selectedTableQR}`}
                  alt={`Table ${selectedTableQR} QR`}
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-xs text-[var(--color-cafe-text-secondary)] mt-2">
                Scan with phone camera to view menu & order directly to Table {selectedTableQR}
              </p>
            </div>

            <Button onClick={() => { toast.success(`Sent Table ${selectedTableQR} QR Code to printer!`); setSelectedTableQR(null); }} className="w-full mt-2 gap-2">
              <CheckCircle className="h-4 w-4" /> Print QR Code Standee
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
