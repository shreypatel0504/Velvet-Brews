import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  customerName: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  timeSlot: string;
  tableNumber: string;
  seatingArea: string;
  occasion?: string;
  specialRequest?: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
  createdAt: Date;
}

const ReservationSchema: Schema = new Schema(
  {
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    guests: { type: Number, required: true, default: 2 },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true },
    tableNumber: { type: String, required: true },
    seatingArea: { type: String, required: true, default: 'Main Dining Hall' },
    occasion: { type: String, default: 'Casual Coffee & Dining' },
    specialRequest: { type: String },
    status: {
      type: String,
      enum: ['confirmed', 'seated', 'completed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
