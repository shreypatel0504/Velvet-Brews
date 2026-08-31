import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Coffee, Heart, PartyPopper, Briefcase, ArrowLeft, Download, User } from "lucide-react";
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

export const TableReservationPage = () => {
  const authUser = useAuthStore((s) => s.user);
  const [selectedTable, setSelectedTable] = React.useState<SeatingOption>(SEATING_AREAS[2]);
  const [guestsCount, setGuestsCount] = React.useState("2");
  const [reservationDate, setReservationDate] = React.useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [timeSlot, setTimeSlot] = React.useState("07:30 PM");
  const [selectedOccasion, setSelectedOccasion] = React.useState("Casual Coffee & Catchup");
  const [specialRequest, setSpecialRequest] = React.useState("");

  // Customer Contact Info
  const [customerName, setCustomerName] = React.useState(authUser?.name || "");
  const [email, setEmail] = React.useState(authUser?.email || "");
  const [phone, setPhone] = React.useState("");

  React.useEffect(() => {
    if (authUser) {
      if (authUser.name) setCustomerName(authUser.name);
      if (authUser.email) setEmail(authUser.email);
    }
  }, [authUser]);

  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmedReservation, setConfirmedReservation] = React.useState<any>(null);

  const handleBookTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !email) {
      toast.error("Please fill in your name, phone number, and email");
      return;
    }

    setIsLoading(true);

    const generatedId = "RES-" + Math.floor(1000 + Math.random() * 9000);

    const payload = {
      _id: generatedId,
      id: generatedId,
      customerName,
      email,
      phone,
      guests: Number(guestsCount),
      date: reservationDate,
      timeSlot,
      tableNumber: selectedTable.name.split(' (')[0],
      seatingArea: selectedTable.area,
      occasion: selectedOccasion,
      specialRequest,
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    sharedSync.saveReservation(payload);
    trackWebsiteActivity('reservation_place', customerName, `Booked ${payload.tableNumber} for ${payload.guests} guests on ${payload.date} (${payload.timeSlot})`);

    let finalData = payload;

    try {
      socket.connect();

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const resultData = await res.json();
        finalData = { ...payload, ...resultData };
        sharedSync.saveReservation(finalData);
      }
    } catch {
      console.warn("Server POST /api/reservations failed, using shared local storage fallback");
    }

    socket.emit("new-reservation", finalData);
    toast.success("🎉 Table Reservation Confirmed! Pass generated.");
    setConfirmedReservation(finalData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-cafe-background)] flex flex-col">
      <Navbar />

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
                Guarantee your favorite spot for coffee dates, family dinners, or group celebrations.
              </p>
            </div>

            <form onSubmit={handleBookTable} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column - Seating Layout & Slot Selection */}
              <div className="lg:col-span-7 space-y-8">
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
                    <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-[var(--color-cafe-primary)]" /> Available Time Slot
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                            timeSlot === slot
                              ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* 2. Interactive Seating Layout Selector */}
                <Card className="p-6 bg-white border-transparent shadow-[var(--shadow-cafe-card)] space-y-6">
                  <h3 className="font-heading text-lg font-bold text-[var(--color-cafe-text-primary)] flex items-center gap-2 border-b border-gray-100 pb-3">
                    <MapPin className="h-5 w-5 text-[var(--color-cafe-primary)]" />
                    2. Select Preferred Table & Seating Area
                  </h3>

                  {/* Interactive Floor Plan Map Widget */}
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        🗺️ Visual Floor Plan Map (Tap to Select Table)
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Vacant
                        </span>
                        <span className="flex items-center gap-1 text-amber-800">
                          <span className="w-2 h-2 rounded-full bg-[var(--color-cafe-primary)]" /> Selected
                        </span>
                      </div>
                    </div>

                    {/* Interactive Graphical Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-amber-200/50 shadow-inner">
                      {SEATING_AREAS.map((table) => {
                        const isSelected = selectedTable.id === table.id;
                        return (
                          <button
                            key={table.id}
                            type="button"
                            onClick={() => setSelectedTable(table)}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? "bg-[var(--color-cafe-primary)] text-white border-transparent shadow-lg scale-105"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300"
                            }`}
                          >
                            <span className="text-xs font-black">T-{table.id.split('-')[1]}</span>
                            <span className="text-[9px] opacity-80">{table.capacity}</span>
                            <span className={`text-[8px] mt-1 font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                              {isSelected ? 'SELECTED' : 'VACANT'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SEATING_AREAS.map((table) => {
                      const isSelected = selectedTable.id === table.id;
                      return (
                        <div
                          key={table.id}
                          onClick={() => setSelectedTable(table)}
                          className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 group ${
                            isSelected
                              ? "border-[var(--color-cafe-primary)] ring-2 ring-[var(--color-cafe-primary)]/20 bg-amber-50/20 shadow-md"
                              : "border-gray-100 hover:border-gray-300 bg-white"
                          }`}
                        >
                          <div className="relative h-28 overflow-hidden bg-gray-100">
                            <img
                              src={table.img}
                              alt={table.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-2 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                              {table.tag}
                            </span>
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-sm text-[var(--color-cafe-text-primary)]">{table.name}</h4>
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                {table.capacity}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--color-cafe-text-secondary)] line-clamp-2">{table.desc}</p>
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
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
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

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full h-14 text-base font-bold shadow-lg shadow-[var(--color-cafe-primary)]/20 rounded-xl gap-2"
                  >
                    <CheckCircle2 className="h-5 w-5" /> Confirm Table Reservation
                  </Button>
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
