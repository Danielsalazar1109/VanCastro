import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: Date;
  timeSlot: string;
  service: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    service: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentId: { type: String },
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
