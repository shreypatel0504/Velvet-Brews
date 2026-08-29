import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  tableNumber: number;
  capacity: number;
  status: 'free' | 'occupied';
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema: Schema = new Schema(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['free', 'occupied'],
      default: 'free',
    },
    qrCodeUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITable>('Table', TableSchema);
