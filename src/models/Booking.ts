import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import { IInstructor } from './Instructor';

export interface IBookingModel extends Model<IBooking> {
  updateExpiredBookings(): Promise<number>;
}

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
  price?: number;
  notes?: string;
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
      enum: [60, 90, 120],
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
  price: { type: Number },
  notes: { type: String },
  },
  { timestamps: true }
);

// Static method to update pending bookings older than 24 hours to cancelled
BookingSchema.statics.updateExpiredBookings = async function(): Promise<number> {
  // Calculate the date 24 hours ago
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
  
  // Find and update all pending bookings created more than 24 hours ago
  const result = await this.updateMany(
    { 
      status: 'pending',
      createdAt: { $lt: twentyFourHoursAgo }
    },
    { 
      $set: { status: 'cancelled' } 
    }
  );
  
  return result.modifiedCount;
};

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Booking || mongoose.model<IBooking, IBookingModel>('Booking', BookingSchema);