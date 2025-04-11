import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalAvailability extends Document {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalAvailabilitySchema: Schema = new Schema(
  {
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  { timestamps: true }
);

// Remove any existing indexes
GlobalAvailabilitySchema.index({ day: 1 }, { unique: false });

// Create a compound index on day and date range to allow multiple records per day with different date ranges
// This allows multiple records for the same day as long as they have different date ranges
// If startDate and endDate are null, they are treated as distinct values in the index
GlobalAvailabilitySchema.index(
  { 
    day: 1, 
    startDate: 1, 
    endDate: 1 
  }, 
  { 
    unique: true,
    // Handle the case where startDate or endDate might be null
    partialFilterExpression: {
      $and: [
        { startDate: { $type: "date" } },
        { endDate: { $type: "date" } }
      ]
    }
  }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.GlobalAvailability || mongoose.model<IGlobalAvailability>('GlobalAvailability', GlobalAvailabilitySchema);