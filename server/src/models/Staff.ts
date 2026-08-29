import mongoose, { Schema, Document } from 'mongoose';

export interface IStaff extends Document {
  name: string;
  role: string;
  phone: string;
  email: string;
  shift: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  hourlyRate: number;
  avatar: string;
  emergencyContact: string;
  joinedDate: string;
  createdAt: Date;
}

const StaffSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'Barista' },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    shift: { type: String, required: true, default: 'Morning (8 AM - 4 PM)' },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Inactive'],
      default: 'Active',
    },
    hourlyRate: { type: Number, default: 220 },
    avatar: { type: String },
    emergencyContact: { type: String, default: '' },
    joinedDate: { type: String, default: new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>('Staff', StaffSchema);
