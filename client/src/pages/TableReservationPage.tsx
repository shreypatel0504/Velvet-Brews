import React from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  Coffee,
  Heart,
  PartyPopper,
  Briefcase,
  ArrowLeft,
  Download,
  User,
  Lock,
  AlertCircle,
  X,
  AlertTriangle
} from "lucide-react";
import { Navbar, Footer } from "@/components/layout";
import { Card, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/store/useAuthStore";
import { socket } from "@/utils/socket";
import { sharedSync } from "@/utils/sharedSync";
import { trackWebsiteActivity } from "@/utils/activityTracker";
import toast from "react-hot-toast";

interface SeatingOption {
  id: string;
  name: string;
  capacity: string;
  area: string;
  desc: string;
  img: string;
  tag: string;
}

const SEATING_AREAS: SeatingOption[] = [
  {
    id: "table-1",
    name: "Table 1 (Window Pair)",
    capacity: "2 Guests",
    area: "Cozy Indoor Booth",
    desc: "Plush velvet seating right next to our sunlit floor-to-ceiling glass window.",
    img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80",
    tag: "Most Popular"
  },
  {
    id: "table-2",
    name: "Table 2 (Barista View)",
    capacity: "2 Guests",
    area: "Cozy Indoor Booth",
    desc: "A romantic corner with direct view of live specialty coffee brewing.",
    img: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=500&q=80",
    tag: "Quiet Corner"
  },
  {
    id: "table-3",
    name: "Table 3 (Garden Canopy)",
    capacity: "4 Guests",
    area: "Outdoor Garden Patio",
    desc: "Open air dining surrounded by lush botanical plants and warm fairy lights.",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80",
    tag: "Fresh Air"
  },
  {
    id: "table-4",
    name: "Table 4 (Center Lounge)",
    capacity: "4 Guests",
    area: "Cozy Indoor Booth",
    desc: "Spacious central table ideal for family lunches and casual coffee catch-ups.",
    img: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=500&q=80",
    tag: "Family Choice"
  },
  {
    id: "table-5",
    name: "Table 5 (Grand Dining)",
    capacity: "6 Guests",
    area: "Main Dining Hall",
    desc: "Large wooden feast table designed for birthday celebrations and group parties.",
    img: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=500&q=80",
    tag: "Group Dining"
  },
  {
    id: "table-6",
    name: "Table 6 (Royal VIP Suite)",
    capacity: "8+ Guests",
    area: "VIP Private Lounge",
    desc: "Exclusive private section with customized ambient lighting & dedicated server.",
    img: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=500&q=80",
    tag: "VIP Luxury"
  }
];

const TIME_SLOTS = [
  "08:30 AM", "10:00 AM", "11:30 AM",
  "01:00 PM", "02:30 PM", "04:00 PM",
  "06:00 PM", "07:30 PM", "09:00 PM"
];

const OCCASIONS = [
  { label: "Casual Coffee & Catchup", icon: Coffee },
  { label: "Birthday Party", icon: PartyPopper },
  { label: "Romantic Date", icon: Heart },
  { label: "Business Meeting", icon: Briefcase }
];

// Universal normalizers to guarantee zero mismatch between any input formats
export const normalizeTableNumber = (val: string | number): string => {
  if (!val && val !== 0) return '';
  const str = String(val).trim();
  const match = str.match(/\d+/);
  return match ? `Table ${match[0]}` : str;
};

export const normalizeDate = (d: string): string => {
  return (d || '').split('T')[0].trim();
};

export const normalizeSlot = (s: string): string => {
  return (s || '').toLowerCase().replace(/^0/, '').replace(/\s+/g, '');
};

export const TableReservationPage = () => {
  const authUser = useAuthStore((s) => s.user);
  const [selectedTable, setSelectedTable] = React.useState<SeatingOption>(SEATING_AREAS[0]);
  const [guestsCount, setGuestsCount] = React.useState("2");
  const [reservationDate, setReservationDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = React.useState("07:30 PM");
  const [selectedOccasion, setSelectedOccasion] = React.useState("Casual Coffee & Catchup");
  const [specialRequest, setSpecialRequest] = React.useState("");

  // Customer Contact Info
  const [customerName, setCustomerName] = React.useState(authUser?.name || "");
  const [email, setEmail] = React.useState(authUser?.email || "");
  const [phone, setPhone] = React.useState("");

  // Realtime reservations store — initialize with shared storage instantly (0 delay)
  const [reservations, setReservations] = React.useState<any[]>(() => sharedSync.getReservations());
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmedReservation, setConfirmedReservation] = React.useState<any>(null);

  // POPUP NOTIFICATION MODAL STATE: "Yeh Table Yeh Time Pe Book Hai"
  const [bookedNoticeModal, setBookedNoticeModal] = React.useState<{
    isOpen: boolean;
    table: SeatingOption | null;
    slot: string;
    date: string;
  }>({
    isOpen: false,
    table: null,
    slot: '',
    date: ''
  });

  React.useEffect(() => {
    if (authUser) {
      if (authUser.name) setCustomerName(authUser.name);
      if (authUser.email) setEmail(authUser.email);
    }
  }, [authUser]);

  const isDuplicateReservation = (a: any, b: any) => {
    const idA = a._id || a.id;
    const idB = b._id || b.id;
    if (idA && idB && String(idA) === String(idB)) return true;
    const tableMatch = normalizeTableNumber(a.tableNumber) === normalizeTableNumber(b.tableNumber);
    const dateMatch = normalizeDate(a.date) === normalizeDate(b.date);
    const slotMatch = normalizeSlot(a.timeSlot) === normalizeSlot(b.timeSlot);
    const nameMatch = (a.customerName || '').trim().toLowerCase() === (b.customerName || '').trim().toLowerCase();
    return tableMatch && dateMatch && slotMatch && nameMatch;
  };

  // Fetch reservations from server & local storage with strict deduplication
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

  // Listen to realtime socket & cross-tab events
  React.useEffect(() => {
    fetchReservations();
    socket.connect();

    const handleNewReservation = (newRes: any) => {
      setReservations(prev => {
        if (prev.some(r => isDuplicateReservation(r, newRes))) {
          return prev.map(r => (r._id === newRes._id || r.id === newRes.id ? { ...r, ...newRes } : r));
        }
        return [newRes, ...prev];
      });

      // If the newly booked table matches the customer's selected table, date, and slot
      const currentSelectedNorm = normalizeTableNumber(selectedTable.name);
      const incomingTableNorm = normalizeTableNumber(newRes.tableNumber);
      if (
        incomingTableNorm === currentSelectedNorm &&
        normalizeDate(newRes.date) === normalizeDate(reservationDate) &&
        normalizeSlot(newRes.timeSlot) === normalizeSlot(timeSlot)
      ) {
        setBookedNoticeModal({
          isOpen: true,
          table: selectedTable,
          slot: timeSlot,
          date: reservationDate
        });
        toast.error(
          `⚠️ Alert: ${selectedTable.name.split(' (')[0]} abhi kisi aur ne book kar li (${timeSlot})!`,
          { duration: 6000, id: 'realtime-booked-alert' }
        );
      }
    };

    const handleUpdatedReservation = (updated: any) => {
      setReservations(prev => prev.map(r => {
        const id = updated._id || updated.id;
        if (r._id === id || (r as any).id === id) {
          return { ...r, ...updated };
        }
        return r;
      }));

      // If a table was marked completed by admin, notify customer if watching that table
      if (updated.status === 'completed') {
        const currentSelectedNorm = normalizeTableNumber(selectedTable.name);
        const updatedTableNorm = normalizeTableNumber(updated.tableNumber);
        if (
          updatedTableNorm === currentSelectedNorm &&
          normalizeDate(updated.date) === normalizeDate(reservationDate) &&
          normalizeSlot(updated.timeSlot) === normalizeSlot(timeSlot)
        ) {
          toast.success(
            `🎉 Alert: ${selectedTable.name.split(' (')[0]} ko Admin ne complete kar diya! Yeh table ab open ho gayi hai.`,
            { duration: 6000, id: 'realtime-released-alert' }
          );
        }
      }
    };

    const handleDeletedReservation = (payload: any) => {
      setReservations(prev => prev.filter(r => r._id !== payload._id && (r as any).id !== payload._id && r._id !== payload.id));
    };

    socket.on('new-reservation', handleNewReservation);
    socket.on('reservation-updated', handleUpdatedReservation);
    socket.on('reservation-deleted', handleDeletedReservation);

    const unsubscribeStorage = sharedSync.subscribe(() => {
      fetchReservations();
    });

    return () => {
      socket.off('new-reservation', handleNewReservation);
      socket.off('reservation-updated', handleUpdatedReservation);
      socket.off('reservation-deleted', handleDeletedReservation);
      unsubscribeStorage();
    };
  }, [fetchReservations, selectedTable, reservationDate, timeSlot]);

  // Determine if a table is booked for a specific date and time slot
  // Table is considered BOOKED only if status is 'confirmed' or 'seated'.
  // If admin marked it 'completed' or 'cancelled', the table is immediately RELEASED and OPEN!
  const getTableBookingInfo = (tableNameOrId: string, checkDate = reservationDate, checkSlot = timeSlot) => {
    const norm = normalizeTableNumber(tableNameOrId);
    const targetD = normalizeDate(checkDate);
    const targetS = normalizeSlot(checkSlot);

    const activeRes = reservations.find((r) => {
      const rNorm = normalizeTableNumber(r.tableNumber || '');
      const rDate = normalizeDate(r.date);
      const rSlot = normalizeSlot(r.timeSlot);
      const isActive = r.status === 'confirmed' || r.status === 'seated';
      return isActive && rNorm === norm && rDate === targetD && rSlot === targetS;
    });

    return {
      isBooked: !!activeRes,
      reservation: activeRes
    };
  };

  const currentTableStatus = getTableBookingInfo(selectedTable.name, reservationDate, timeSlot);
  const isCurrentTableBooked = currentTableStatus.isBooked;

  const vacantTables = SEATING_AREAS.filter(
    (t) => !getTableBookingInfo(t.name, reservationDate, timeSlot).isBooked
  );
  const bookedTables = SEATING_AREAS.filter(
    (t) => getTableBookingInfo(t.name, reservationDate, timeSlot).isBooked
  );

  // Trigger Notification Modal whenever a user tries to interact with or book a booked table
  const showBookedPopup = (table: SeatingOption, slot = timeSlot, date = reservationDate) => {
    setBookedNoticeModal({
      isOpen: true,
      table,
      slot,
      date
    });
  };

  // Handlers for selection
  const handleTableClick = (table: SeatingOption) => {
    const info = getTableBookingInfo(table.name, reservationDate, timeSlot);
    if (info.isBooked) {
      showBookedPopup(table, timeSlot, reservationDate);
      return;
    }
    setSelectedTable(table);
  };

  const handleTimeSlotClick = (slot: string) => {
    setTimeSlot(slot);
    const info = getTableBookingInfo(selectedTable.name, reservationDate, slot);
    if (info.isBooked) {
      showBookedPopup(selectedTable, slot, reservationDate);
    }
  };

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !email) {
      toast.error("Please fill in your name, phone number, and email");
      return;
    }

    // Availability check before submission — show popup if booked!
    const check = getTableBookingInfo(selectedTable.name, reservationDate, timeSlot);
    if (check.isBooked) {
      showBookedPopup(selectedTable, timeSlot, reservationDate);
      return;
    }

    setIsLoading(true);

    const generatedId = "RES-" + Math.floor(1000 + Math.random() * 9000);
    const targetTableNum = normalizeTableNumber(selectedTable.name);

    const payload = {
      _id: generatedId,
      id: generatedId,
      customerName,
      email,
      phone,
      guests: Number(guestsCount),
      date: normalizeDate(reservationDate),
      timeSlot,
      tableNumber: targetTableNum,
      seatingArea: selectedTable.area,
      occasion: selectedOccasion,
      specialRequest,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    let finalData = payload;
    let serverSuccess = false;

    try {
      socket.connect();

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        showBookedPopup(selectedTable, timeSlot, reservationDate);
        fetchReservations();
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        const resultData = await res.json();
        finalData = { ...payload, ...resultData };
        serverSuccess = true;
      }
    } catch {
      console.warn("Server POST /api/reservations failed, using shared local storage fallback");
    }

    // Save to shared sync (deduplicated)
    sharedSync.saveReservation(finalData);
    trackWebsiteActivity('reservation_place', customerName, `Booked ${payload.tableNumber} for ${payload.guests} guests on ${payload.date} (${payload.timeSlot})`);

    // Only emit from client if server POST was unreachable (offline mode)
    if (!serverSuccess) {
      socket.emit("new-reservation", finalData);
    }

    // Deduplicate when updating local state
    setReservations(prev => {
      if (prev.some(r => isDuplicateReservation(r, finalData))) return prev;
      return [finalData, ...prev];
    });

    toast.success("🎉 Table Reservation Confirmed! Pass generated.");
    setConfirmedReservation(finalData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col">
      <Navbar />

      {/* POPUP NOTIFICATION MODAL: YEH TABLE YEH TIME PE BOOK HAI */}
      <AnimatePresence>
        {bookedNoticeModal.isOpen && bookedNoticeModal.table && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border-4 border-rose-400 relative overflow-hidden"
            >
              {/* Pulsing red accent glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Header Badge & Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider border border-rose-300 shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                  🚨 TABLE ALREADY BOOKED
                </span>
                <button
                  type="button"
                  onClick={() => setBookedNoticeModal({ ...bookedNoticeModal, isOpen: false })}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Main Headline */}
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-rose-200">
                  <Lock className="h-8 w-8" />
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-rose-950 leading-tight">
                  Yeh Table Yeh Time Pe Book Hai!
                </h2>
                <p className="text-sm font-semibold text-rose-700 mt-1">
                  Table Already Reserved For This Time Slot
                </p>
              </div>

              {/* Conflict Details Card */}
              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 mb-5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Booked Table:</span>
                  <span className="font-bold text-rose-900 text-sm">{bookedNoticeModal.table.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-semibold">Date & Time:</span>
                  <span className="font-bold text-gray-900 text-sm">{bookedNoticeModal.date} @ {bookedNoticeModal.slot}</span>
                </div>
                <div className="flex items-center justify-between border-t border-rose-200 pt-2">
                  <span className="text-gray-600 font-semibold">Status:</span>
                  <span className="font-black text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    Booked by Another Customer (Uplabdh Nahi Hai)
                  </span>
                </div>
                <p className="text-[11px] text-rose-900 pt-1 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-200/60">
                  ⚠️ <strong>Aap yeh table {bookedNoticeModal.slot} ke liye book nahi kar sakte</strong> kyunki yeh pehle se kisi aur guest ke liye reserved hai. Kripya neeche diye gaye open time slots ya doosre available tables mein se select karein:
                </p>
              </div>

              {/* Smart Alternatives */}
              <div className="space-y-4 mb-6">
                {/* 1. Alternate Open Slots for THIS table */}
                <div>
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-[var(--color-cafe-primary)]" />
                    Isi Table ({bookedNoticeModal.table.name.split(' (')[0]}) Ke Doosre Open Time Slots:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map(slot => {
                      const isFree = !getTableBookingInfo(bookedNoticeModal.table!.name, bookedNoticeModal.date, slot).isBooked;
                      if (!isFree) return null;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setTimeSlot(slot);
                            setSelectedTable(bookedNoticeModal.table!);
                            setBookedNoticeModal({ ...bookedNoticeModal, isOpen: false });
                            toast.success(`✓ Time slot badalkar ${slot} kar diya gaya! ${bookedNoticeModal.table!.name.split(' (')[0]} ab open hai.`);
                          }}
                          className="p-2 rounded-xl text-[11px] font-bold border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>{slot}</span>
                          <span className="text-[9px] font-normal">✓</span>
                        </button>
                      );
                    })}
                  </div>
                  {TIME_SLOTS.every(s => getTableBookingInfo(bookedNoticeModal.table!.name, bookedNoticeModal.date, s).isBooked) && (
                    <p className="text-[11px] text-gray-500 italic">Yeh table aaj ke sabhi slots ke liye booked hai.</p>
                  )}
                </div>

                {/* 2. Alternate Available Tables at THIS slot */}
                <div>
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    {bookedNoticeModal.slot} Ke Liye Doosre Available Tables (Open Now):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SEATING_AREAS.filter(t => !getTableBookingInfo(t.name, bookedNoticeModal.date, bookedNoticeModal.slot).isBooked).map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTable(t);
                          setBookedNoticeModal({ ...bookedNoticeModal, isOpen: false });
                          toast.success(`✓ Table badalkar ${t.name.split(' (')[0]} select kar liya! Ready to book.`);
                        }}
                        className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-[var(--color-cafe-primary)] hover:text-white transition-all text-left group"
                      >
                        <div className="text-xs font-bold text-gray-800 group-hover:text-white">{t.name.split(' (')[0]}</div>
                        <div className="text-[10px] text-gray-500 group-hover:text-white/80">{t.capacity} • {t.area}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Action Close */}
              <div className="pt-2 border-t border-gray-100">
                <Button
                  onClick={() => setBookedNoticeModal({ ...bookedNoticeModal, isOpen: false })}
                  className="w-full text-xs font-bold py-3 rounded-xl bg-gray-900 hover:bg-black text-white"
                >
                  Theek Hai, Samjh Gaya (Close)
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-cafe-text-secondary)] hover:text-[var(--color-cafe-primary)] mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Confirmation Pass State */}
        {confirmedReservation ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto py-8"
          >
            <Card className="p-8 md:p-10 bg-white border-2 border-emerald-200 shadow-2xl rounded-3xl relative overflow-hidden text-center">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2 border border-emerald-200">
                Reservation Confirmed • Live Code #{confirmedReservation._id || 'RES-8921'}
              </span>

              <h1 className="font-heading text-3xl font-bold text-[var(--color-cafe-text-primary)] mb-2">
                Table Reserved Successfully!
              </h1>
              <p className="text-sm text-[var(--color-cafe-text-secondary)] max-w-md mx-auto mb-8">
                We are excited to welcome you to Velvet Brews Cafe. Your table is locked and reserved.
              </p>

              {/* Digital Pass Card */}
              <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/50 p-6 rounded-2xl border border-amber-200/80 text-left space-y-4 mb-8 shadow-inner">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Guest Name</p>
                    <p className="font-bold text-lg text-[var(--color-cafe-text-primary)]">{confirmedReservation.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Party Size</p>
                    <p className="font-bold text-lg text-[var(--color-cafe-primary)]">{confirmedReservation.guests} Guests</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium block">Date & Time:</span>
                    <span className="font-bold text-gray-800 text-sm">{confirmedReservation.date} @ {confirmedReservation.timeSlot}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">Seating Area:</span>
                    <span className="font-bold text-gray-800 text-sm">{confirmedReservation.seatingArea}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">Reserved Table:</span>
                    <span className="font-bold text-emerald-700 text-sm">{confirmedReservation.tableNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium block">Occasion:</span>
                    <span className="font-bold text-gray-800 text-sm">{confirmedReservation.occasion}</span>
                  </div>
                </div>

                {confirmedReservation.specialRequest && (
                  <div className="border-t border-amber-200/60 pt-3 text-xs">
                    <span className="text-gray-500 font-medium block">Special Note:</span>
                    <span className="text-gray-800 italic">"{confirmedReservation.specialRequest}"</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="w-full sm:w-auto gap-2 rounded-xl"
                >
                  <Download className="h-4 w-4" /> Download / Print Pass
                </Button>
                <Link to="/menu" className="w-full sm:w-auto">
                  <Button className="w-full gap-2 rounded-xl">
                    <Coffee className="h-4 w-4" /> Pre-order Food & Drinks
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Booking Form */
          <div>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-cafe-primary)]/10 text-[var(--color-cafe-primary)] text-xs font-bold mb-3">
                <Sparkles className="h-3.5 w-3.5" /> Instant Direct Table Reservation
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-gradient mb-3">
                Reserve Your Cafe Table
              </h1>
              <p className="text-base text-[var(--color-cafe-text-secondary)]">
                Live seating availability updated in real-time. Pick your preferred date, slot, and spot.
              </p>
            </div>

            <form onSubmit={handleBookTable} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Seating Layout & Slot Selection */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Date, Time & Guests Selector */}
                <Card className="p-6 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-6">
                  <h3 className="font-heading text-lg font-bold text-[var(--color-cafe-text-primary)] flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Calendar className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                    1. Choose Date, Guests & Time
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reservation Date</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={reservationDate}
                        onChange={(e) => setReservationDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium focus:border-[var(--color-cafe-primary)] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Number of Guests</label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium focus:border-[var(--color-cafe-primary)] focus:outline-none"
                      >
                        <option value="1">1 Person (Solo Coffee)</option>
                        <option value="2">2 Persons (Duo / Couple)</option>
                        <option value="4">4 Persons (Family / Friends)</option>
                        <option value="6">6 Persons (Group Table)</option>
                        <option value="8">8+ Persons (VIP Feast)</option>
                      </select>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <Clock className="h-4 w-4 text-[var(--color-cafe-primary)]" /> Available Time Slot
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Select a slot to check table availability
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isSlotSelected = timeSlot === slot;
                        const thisTableBookedInSlot = getTableBookingInfo(selectedTable.name, reservationDate, slot).isBooked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleTimeSlotClick(slot)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                              isSlotSelected
                                ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <span>{slot}</span>
                            {thisTableBookedInSlot && (
                              <span className={`text-[9px] font-semibold mt-0.5 flex items-center gap-0.5 ${isSlotSelected ? 'text-amber-200' : 'text-rose-600'}`}>
                                <Lock className="h-2.5 w-2.5" /> Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* Conflict Alert Banner if Current Table is Booked for this Slot */}
                {isCurrentTableBooked && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm flex items-start gap-3 text-rose-900"
                  >
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-rose-950">
                          ⛔ NOTIFICATION: {selectedTable.name.split(' (')[0]} iss time ({timeSlot}) ke liye booked hai!
                        </p>
                        <button
                          type="button"
                          onClick={() => showBookedPopup(selectedTable, timeSlot, reservationDate)}
                          className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-colors shadow-xs"
                        >
                          View Popup Notice
                        </button>
                      </div>
                      <p className="text-rose-700 mt-1 leading-relaxed">
                        Aap yeh table <strong>{timeSlot}</strong> ke liye book nahi kar sakte kyunki yeh already kisi aur ne reserve kiya hua hai.
                        Kripya doosra <strong>open table</strong> chunein ya koi doosra <strong>time slot</strong> select karein.
                      </p>
                      {vacantTables.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="font-semibold text-rose-900">Open Table Option:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedTable(vacantTables[0])}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                          >
                            Switch to {vacantTables[0].name.split(' (')[0]} (Vacant ✓)
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. Interactive Seating Layout Selector */}
                <Card className="p-6 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-heading text-lg font-bold text-[var(--color-cafe-text-primary)] flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                      2. Select Preferred Table & Seating Area
                    </h3>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      Slot: {timeSlot}
                    </span>
                  </div>

                  {/* Interactive Floor Plan Map Widget */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          🗺️ Visual Floor Plan Map ({reservationDate} @ {timeSlot})
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {vacantTables.length} Available • {bookedTables.length} Booked
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Vacant (Open)
                        </span>
                        <span className="flex items-center gap-1 text-rose-700">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Booked
                        </span>
                        <span className="flex items-center gap-1 text-amber-800">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-cafe-primary)]" /> Selected
                        </span>
                      </div>
                    </div>

                    {/* Interactive Graphical Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-amber-200/50 shadow-inner">
                      {SEATING_AREAS.map((table) => {
                        const { isBooked } = getTableBookingInfo(table.name);
                        const isSelected = selectedTable.id === table.id;

                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => handleTableClick(table)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all relative ${
                              isBooked
                                ? "bg-rose-50/90 text-rose-800 border-rose-300 hover:border-rose-400 cursor-pointer"
                                : isSelected
                                ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-lg scale-105 ring-2 ring-amber-300"
                                : "bg-emerald-50/40 text-gray-700 border-emerald-200 hover:bg-emerald-100/60 hover:border-emerald-400 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {isBooked && <Lock className="h-3 w-3 text-rose-600" />}
                              <span className="text-xs font-black">T-{table.id.split('-')[1]}</span>
                            </div>
                            <span className="text-[9px] opacity-80">{table.capacity}</span>
                            <span
                              className={`text-[8px] mt-1 font-bold px-1.5 py-0.5 rounded ${
                                isBooked
                                  ? "bg-rose-200 text-rose-900 border border-rose-300"
                                  : isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              }`}
                            >
                              {isBooked ? "BOOKED" : isSelected ? "SELECTED" : "VACANT"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seating Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SEATING_AREAS.map((table) => {
                      const { isBooked } = getTableBookingInfo(table.name);
                      const isSelected = selectedTable.id === table.id;

                      return (
                        <div
                          key={table.id}
                          onClick={() => handleTableClick(table)}
                          className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 group relative ${
                            isBooked
                              ? "border-rose-300 bg-rose-50/20 cursor-pointer"
                              : isSelected
                              ? "border-[var(--color-cafe-primary)] ring-2 ring-[var(--color-cafe-primary)]/20 bg-amber-50/20 shadow-md cursor-pointer"
                              : "border-gray-100 hover:border-gray-300 bg-white cursor-pointer"
                          }`}
                        >
                          <div className="relative h-28 overflow-hidden bg-gray-100">
                            <img
                              src={table.img}
                              alt={table.name}
                              className={`w-full h-full object-cover transition-transform duration-500 ${
                                isBooked ? "grayscale-30 opacity-75" : "group-hover:scale-105"
                              }`}
                            />
                            {isBooked ? (
                              <span className="absolute top-2 right-2 text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md">
                                <Lock className="h-2.5 w-2.5" /> Booked for {timeSlot}
                              </span>
                            ) : (
                              <span className="absolute top-2 right-2 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-md">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Vacant @ {timeSlot}
                              </span>
                            )}
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                              {table.tag}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm text-[var(--color-cafe-text-primary)]">
                                {table.name}
                              </h4>
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  isBooked
                                    ? "text-rose-700 bg-rose-100 font-bold"
                                    : "text-emerald-600 bg-emerald-50"
                                }`}
                              >
                                {isBooked ? "Booked" : table.capacity}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-cafe-text-secondary)] line-clamp-2">
                              {table.desc}
                            </p>

                            {isBooked ? (
                              <div className="mt-2 text-[11px] font-medium text-rose-700 bg-rose-100/70 p-2 rounded-lg flex items-center justify-between border border-rose-200">
                                <div className="flex items-center gap-1.5">
                                  <Lock className="h-3 w-3 shrink-0" />
                                  <span>Booked for {timeSlot}.</span>
                                </div>
                                <span className="text-[10px] underline font-bold text-rose-800">
                                  Click for Popup
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg flex items-center gap-1.5 border border-emerald-100">
                                <CheckCircle2 className="h-3 w-3 shrink-0" />
                                <span>Vacant • Ready to reserve for {timeSlot}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Right Column - Guest Details & Occasion */}
              <div className="lg:col-span-5 space-y-8">
                <Card className="p-6 md:p-8 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-6 sticky top-24">
                  <h3 className="font-heading text-lg font-bold text-[var(--color-cafe-text-primary)] border-b border-gray-100 pb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                    3. Guest Details & Occasion
                  </h3>

                  {/* Selected Summary Card */}
                  <div className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-colors ${
                    isCurrentTableBooked
                      ? "bg-rose-50 border-rose-300 text-rose-900"
                      : "bg-amber-50/70 border-amber-200/80 text-gray-800"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Selected Spot:</span>
                      <span className="font-bold text-[var(--color-cafe-primary)]">{selectedTable.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date & Slot:</span>
                      <span className="font-semibold text-gray-800">{reservationDate} @ {timeSlot}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Seating Area:</span>
                      <span className="font-semibold text-gray-800">{selectedTable.area}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                      <span className="text-gray-600 font-medium">Slot Status:</span>
                      {isCurrentTableBooked ? (
                        <button
                          type="button"
                          onClick={() => showBookedPopup(selectedTable, timeSlot, reservationDate)}
                          className="font-bold text-rose-600 flex items-center gap-1 hover:underline"
                        >
                          <Lock className="h-3.5 w-3.5" /> Booked for this slot (View Popup)
                        </button>
                      ) : (
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Vacant & Available
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Occasion Chips */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Dining Occasion</label>
                    <div className="grid grid-cols-2 gap-2">
                      {OCCASIONS.map((occ) => {
                        const Icon = occ.icon;
                        const isSelected = selectedOccasion === occ.label;
                        return (
                          <button
                            key={occ.label}
                            type="button"
                            onClick={() => setSelectedOccasion(occ.label)}
                            className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? "bg-[var(--color-cafe-primary)] text-white border-transparent"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{occ.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Guest Contact Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
                      <Input
                        placeholder="e.g. Rahul Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                      <Input
                        placeholder="+91 99784 21542"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="rahul@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Special Requests (Optional)</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. High chair needed, quiet booth, surprise candle"
                        value={specialRequest}
                        onChange={(e) => setSpecialRequest(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-[var(--color-cafe-primary)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button with Disabled State if Table is Booked */}
                  {isCurrentTableBooked ? (
                    <div className="space-y-2">
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold">Yeh table iss time ke liye already booked hai!</p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Aap yeh table iss time ke liye book nahi kar sakte. Kripya doosra time slot ya open table select karein.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showBookedPopup(selectedTable, timeSlot, reservationDate)}
                          className="text-[10px] font-bold text-rose-800 underline shrink-0"
                        >
                          View Popup
                        </button>
                      </div>
                      <Button
                        type="button"
                        onClick={() => showBookedPopup(selectedTable, timeSlot, reservationDate)}
                        className="w-full h-14 text-sm font-bold bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl gap-2 shadow-none border border-rose-300"
                      >
                        <Lock className="h-4 w-4 text-rose-600" /> Yeh Table Book Hai (Click to Change)
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="w-full h-14 text-base font-bold shadow-lg shadow-[var(--color-cafe-primary)]/20 rounded-xl gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" /> Confirm Table Reservation
                    </Button>
                  )}
                </Card>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
