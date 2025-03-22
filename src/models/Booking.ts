import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IInstructor } from './Instructor';

export interface IBooking extends Document {
  user: IUser['_id'];
  instructor: IInstructor['_id'];
  location: string;
  classType: string;
  package: string;
  duration: number;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
    location: { 
      type: String, 
      enum: ['Surrey', 'Burnaby', 'North Vancouver'],
      required: true 
    },
    classType: { 
      type: String, 
      enum: ['class 4', 'class 5', 'class 7'],
      required: true 
    },
    package: { 
      type: String, 
      enum: ['1 lesson', '3 lessons', '10 lessons'],
      required: true 
    },
    duration: { 
      type: Number, 
      enum: [60, 90],
      required: true 
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
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