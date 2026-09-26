import { Request, Response } from 'express';
import Reservation from '../models/Reservation';
import { io } from '../app';

// In-memory array store for seamless fallback when MongoDB is offline
const inMemoryReservations: any[] = [
  {
    _id: 'RES8921',
    customerName: 'Aarav Mehta',
    email: 'aarav@example.com',
    phone: '+91 98765 12345',
    guests: 2,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '07:30 PM',
    tableNumber: 'Table 1',
    seatingArea: 'Cozy Indoor Booth',
    occasion: 'Romantic Date',
    specialRequest: 'Window booth requested with ambient light',
    status: 'confirmed',
    createdAt: new Date()
  },
  {
    _id: 'RES8922',
    customerName: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 99887 65432',
    guests: 4,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 PM',
    tableNumber: 'Table 3',
    seatingArea: 'Outdoor Garden Patio',
    occasion: 'Birthday Party',
    specialRequest: 'Fairy lights & celebration setup',
    status: 'seated',
    createdAt: new Date()
  }
];

// Helper to normalize table naming e.g. "Table 1 (Window Pair)", "table-1", "1", "T-1" -> "Table 1"
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

export const createReservation = async (req: Request, res: Response) => {
  try {
    const { customerName, email, phone, guests, date, timeSlot, tableNumber, seatingArea, occasion, specialRequest } = req.body;

    const targetTable = normalizeTableNumber(tableNumber || 'Table 1');
    const targetDate = normalizeDate(date || new Date().toISOString());
    const targetSlot = (timeSlot || '07:30 PM').trim();

    const isConflict = (r: any) => {
      const isTableSame = normalizeTableNumber(r.tableNumber) === targetTable;
      const isDateSame = normalizeDate(r.date) === targetDate;
      const isSlotSame = normalizeSlot(r.timeSlot) === normalizeSlot(targetSlot);
      const isActive = r.status === 'confirmed' || r.status === 'seated';
      return isActive && isTableSame && isDateSame && isSlotSame;
    };

    // 1. Conflict Check in MongoDB (Active statuses: confirmed, seated)
    try {
      const activeInDb = await Reservation.find({
        status: { $in: ['confirmed', 'seated'] }
      });

      const conflict = activeInDb.find(isConflict);
      if (conflict) {
        return res.status(409).json({
          message: `Yeh table yeh time pe book hai! ${targetTable} is already booked for ${targetDate} at ${targetSlot}.`,
          conflict: true,
          tableNumber: targetTable,
          date: targetDate,
          timeSlot: targetSlot
        });
      }
    } catch {
      // MongoDB check skipped if disconnected
    }

    // 2. Conflict Check in In-Memory Store
    const memConflict = inMemoryReservations.find(isConflict);

    if (memConflict) {
      return res.status(409).json({
        message: `Yeh table yeh time pe book hai! ${targetTable} is already booked for ${targetDate} at ${targetSlot}.`,
        conflict: true,
        tableNumber: targetTable,
        date: targetDate,
        timeSlot: targetSlot
      });
    }

    const clientAssignedId = req.body._id || req.body.id;
    const assignedId = clientAssignedId || ('RES' + Math.floor(1000 + Math.random() * 9000));

    const reservationData = {
      _id: assignedId,
      id: assignedId,
      customerName: customerName || 'Guest Customer',
      email: email || 'customer@example.com',
      phone: phone || '+91 98765 43210',
      guests: Number(guests) || 2,
      date: targetDate,
      timeSlot: targetSlot,
      tableNumber: targetTable,
      seatingArea: seatingArea || 'Cozy Indoor Booth',
      occasion: occasion || 'Casual Coffee & Dining',
      specialRequest: specialRequest || '',
      status: 'confirmed' as const,
      createdAt: new Date()
    };

    let createdReservation: any = null;

    try {
      const reservation = new Reservation(reservationData);
      createdReservation = await reservation.save();
      createdReservation = createdReservation.toObject();
    } catch {
      // In-memory fallback if MongoDB offline
      createdReservation = { ...reservationData };
    }

    const broadcastPayload = {
      ...reservationData,
      _id: createdReservation?._id ? String(createdReservation._id) : assignedId,
      id: createdReservation?._id ? String(createdReservation._id) : assignedId,
    };

    // Store in fallback memory list without duplicates
    const existingIndex = inMemoryReservations.findIndex(
      (r) =>
        (r._id === broadcastPayload._id || r.id === broadcastPayload.id) ||
        (normalizeTableNumber(r.tableNumber) === targetTable &&
          r.date === targetDate &&
          r.timeSlot === targetSlot &&
          (r.customerName || '').trim().toLowerCase() === (broadcastPayload.customerName || '').trim().toLowerCase())
    );

    if (existingIndex >= 0) {
      inMemoryReservations[existingIndex] = broadcastPayload;
    } else {
      inMemoryReservations.unshift(broadcastPayload);
    }

    // Notify admin dashboards in real time via Socket.io
    io.emit('new-reservation', broadcastPayload);

    res.status(201).json(broadcastPayload);
  } catch (error: any) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find({}).sort({ createdAt: -1 });
    if (reservations && reservations.length > 0) {
      const unique: any[] = [];
      reservations.forEach((r) => {
        const robj = (r as any).toObject ? (r as any).toObject() : r;
        const exists = unique.some(
          (u) =>
            (u._id && robj._id && String(u._id) === String(robj._id)) ||
            (normalizeTableNumber(u.tableNumber) === normalizeTableNumber(robj.tableNumber) &&
              u.date === robj.date &&
              u.timeSlot === robj.timeSlot &&
              (u.customerName || '').trim().toLowerCase() === (robj.customerName || '').trim().toLowerCase())
        );
        if (!exists) unique.push(robj);
      });
      return res.json(unique);
    }
    // Return in-memory fallback if Mongo returns empty or offline
    res.json(inMemoryReservations);
  } catch (error: any) {
    res.json(inMemoryReservations);
  }
};

export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    let updatedPayload: any = null;

    try {
      const reservation = await Reservation.findById(id);
      if (reservation) {
        reservation.status = status;
        const updated = await reservation.save();
        updatedPayload = updated.toObject();
      }
    } catch {
      // Ignore DB error and fallback to memory response
    }

    // Update in memory fallback
    const memItem = inMemoryReservations.find(r => r._id === id || r.id === id);
    if (memItem) {
      memItem.status = status;
      if (!updatedPayload) {
        updatedPayload = { ...memItem };
      }
    }

    if (!updatedPayload) {
      updatedPayload = { _id: id, id, status };
    }

    // Broadcast status change to both customer website and admin portal
    io.emit('reservation-updated', updatedPayload);
    res.json(updatedPayload);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Remove from in-memory fallback
    const index = inMemoryReservations.findIndex(r => r._id === id || r.id === id);
    if (index !== -1) {
      inMemoryReservations.splice(index, 1);
    }

    try {
      await Reservation.deleteOne({ _id: id });
    } catch {
      // Ignore DB error
    }

    io.emit('reservation-deleted', { _id: id, id });
    res.json({ message: 'Reservation deleted', _id: id });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

