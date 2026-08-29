import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Sparkles, CheckCircle2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const TableBookingScreen: React.FC = () => {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('2026-08-05');
  const [timeSlot, setTimeSlot] = useState('19:30');
  const [seatingZone, setSeatingZone] = useState('Cozy Window');
  const [specialRequest, setSpecialRequest] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const timeSlots = ['17:00', '18:00', '19:00', '19:30', '20:00', '21:00'];
  const zones = [
    { id: 'Cozy Window', label: 'Cozy Window', desc: 'Warm city street view' },
    { id: 'VIP Lounge', label: 'VIP Lounge', desc: 'Private leather booths' },
    { id: 'Outdoor Terrace', label: 'Outdoor Terrace', desc: 'Open air under fairy lights' },
    { id: 'Bar Counter', label: 'Bar Counter', desc: 'Watch baristas in action' }
  ];

  const handleReserve = () => {
    setIsBooked(true);
    toast.success('Table Reserved at Velvet Brews! 🥂', {
      style: { background: '#1c1410', color: '#fef3c7', border: '1px solid #d97706' }
    });
  };

  if (isBooked) {
    return (
      <div className="pb-safe pt-10 px-4 text-center space-y-4 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-full bg-[#f59e0b]/20 border-2 border-[#f59e0b] flex items-center justify-center mx-auto text-[#f59e0b]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold font-heading text-[#fef3c7]">Reservation Confirmed!</h3>
        <p className="text-xs text-[#a89988]">
          We look forward to hosting you at <span className="text-[#f59e0b]">Velvet Brews Cyber Hub</span>.
        </p>

        <div className="glass-card p-4 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#a89988]">Guests</span>
            <span className="font-bold text-[#fef3c7]">{guests} Persons</span>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-2">
            <span className="text-[#a89988]">Date & Time</span>
            <span className="font-bold text-[#fef3c7]">{date} at {timeSlot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#a89988]">Seating Area</span>
            <span className="font-bold text-[#f59e0b]">{seatingZone}</span>
          </div>
        </div>

        <button
          onClick={() => setIsBooked(false)}
          className="w-full py-3 rounded-2xl bg-[#1c1410] border border-[#d97706]/40 text-xs font-bold text-[#f59e0b]"
        >
          Book Another Table
        </button>
      </div>
    );
  }

  return (
    <div className="pb-safe pt-2 px-4 space-y-5 animate-in fade-in duration-300">

      {/* Screen Title */}
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold text-[#f59e0b] tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Instant Table Booking
        </span>
        <h2 className="text-xl font-extrabold font-heading text-[#fef3c7]">Reserve Your Atmosphere</h2>
      </div>

      {/* Guest Counter Card */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block">Number of Guests</label>
        <div className="flex items-center justify-between bg-[#120d0a] border border-white/10 rounded-2xl p-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#fef3c7]">
            <Users className="w-4 h-4 text-[#f59e0b]" />
            <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 4, 6, 8].map((g) => (
              <button
                key={g}
                onClick={() => setGuests(g)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                  guests === g
                    ? 'bg-[#d97706] text-[#120d0a]'
                    : 'bg-[#1c1410] border border-white/5 text-[#a89988]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date & Time Slot Selector */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block">Select Date & Time</label>
        
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-[#120d0a] border border-white/10 rounded-xl p-2.5 text-xs text-[#fef3c7] outline-none focus:border-[#d97706]"
        />

        <div className="grid grid-cols-3 gap-2 pt-1">
          {timeSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => setTimeSlot(slot)}
              className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                timeSlot === slot
                  ? 'bg-[#d97706] border-[#d97706] text-[#120d0a]'
                  : 'bg-[#120d0a] border-white/5 text-[#a89988]'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Seating Zone Cards */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider block">Preferred Seating Zone</label>
        <div className="grid grid-cols-2 gap-2">
          {zones.map((z) => (
            <div
              key={z.id}
              onClick={() => setSeatingZone(z.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                seatingZone === z.id
                  ? 'bg-[#d97706]/20 border-[#d97706] text-[#fef3c7] shadow-md shadow-[#d97706]/20'
                  : 'bg-[#1c1410] border-white/5 text-[#a89988]'
              }`}
            >
              <h5 className="text-xs font-bold font-heading">{z.label}</h5>
              <p className="text-[10px] opacity-70 mt-0.5">{z.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Reservation Button */}
      <button
        onClick={handleReserve}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#b45309] to-[#d97706] text-[#120d0a] font-bold text-sm font-heading shadow-xl shadow-[#d97706]/30 active:scale-98 transition-all"
      >
        Confirm Table Reservation
      </button>

    </div>
  );
};
