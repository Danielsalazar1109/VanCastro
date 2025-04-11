import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './User';
import Location from './Location';

export interface IAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IAbsence {
  startDate: Date;
  endDate: Date;
  reason?: string;
}

export interface IInstructor extends Document {
  user: IUser['_id'];
  availability: IAvailability[];
  absences: IAbsence[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InstructorModel extends Model<IInstructor> {
  getLocations(): Promise<string[]>;
}

const AvailabilitySchema: Schema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

const AbsenceSchema: Schema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String }
});

const InstructorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    availability: [AvailabilitySchema],
    absences: [AbsenceSchema],
    image: { type: String }
  },
  { timestamps: true }
);

// Static method to get all active locations from database
InstructorSchema.statics.getLocations = async function() {
  try {
    // Get all active locations from the database
    const locations = await Location.find({ isActive: true }).select('name').sort({ name: 1 });
    return locations.map(location => location.name);
  } catch (error) {
    console.error('Error fetching locations:', error);
    // Fallback to empty array if there's an error
    return [];
  }
};

// Virtual property for locations - returns all active locations
InstructorSchema.virtual('locations').get(async function() {
  try {
    // Get all active locations from the database
    const locations = await Location.find({ isActive: true }).select('name').sort({ name: 1 });
    return locations.map(location => location.name);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
});

InstructorSchema.virtual('classTypes').get(function() {
  return ['class 4', 'class 5', 'class 7'];
});

// Configure the schema to include virtuals when converting to JSON
InstructorSchema.set('toJSON', { virtuals: true });
InstructorSchema.set('toObject', { virtuals: true });

// Check if the model is already defined to prevent overwriting during hot reloads
export default (mongoose.models.Instructor || mongoose.model<IInstructor, InstructorModel>('Instructor', InstructorSchema)) as Model<IInstructor, {}, {}, {}, InstructorModel>;