import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface IInstructor extends Document {
  user: IUser['_id'];
  locations: string[];
  classTypes: string[];
  availability: IAvailability[];
  createdAt: Date;
  updatedAt: Date;
}

const AvailabilitySchema: Schema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
});

const InstructorSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    locations: [{ 
      type: String, 
      enum: ['Surrey', 'Burnaby', 'North Vancouver'],
      required: true 
    }],
    classTypes: [{ 
      type: String, 
      enum: ['class 4', 'class 5', 'class 7'],
      required: true 
    }],
    availability: [AvailabilitySchema]
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Instructor || mongoose.model<IInstructor>('Instructor', InstructorSchema);