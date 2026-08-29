import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  customerName: string;
  rating: number;
  comment: string;
  category: string;
  ownerReply?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    customerName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    category: { type: String, default: 'Overall' },
    ownerReply: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>('Review', ReviewSchema);
