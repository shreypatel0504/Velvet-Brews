import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  password?: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    role: { 
      type: String, 
      enum: ['admin', 'staff', 'customer'], 
      default: 'customer' 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
