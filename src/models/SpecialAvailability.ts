import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISpecialAvailability extends Document {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialAvailabilitySchema: Schema = new Schema(
  {
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

// Create a compound index on day and date range
SpecialAvailabilitySchema.index({ day: 1, startDate: 1, endDate: 1 }, { unique: true });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.SpecialAvailability || mongoose.model<ISpecialAvailability>('SpecialAvailability', SpecialAvailabilitySchema);