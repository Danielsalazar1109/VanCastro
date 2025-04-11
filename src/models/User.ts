import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'instructor' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  bookings?: string[];
}

const UserSchema: Schema = new Schema(
  {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: false }, // Made optional to support OAuth providers
  password: { type: String, required: false }, // Optional for OAuth providers
  googleId: { type: String, required: false }, // For Google authentication
    role: { 
      type: String, 
      enum: ['user', 'instructor', 'admin'], 
      default: 'user' 
    },
    bookings: [{ type: Schema.Types.ObjectId, ref: 'Booking' }]
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);