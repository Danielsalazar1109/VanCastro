import mongoose, { Schema, Document } from 'mongoose';
import { IInstructor } from './Instructor';

export interface ISchedule extends Document {
  instructor: IInstructor['_id'];
  date: Date;
  slots: {
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
    date: { type: Date, required: true },
    slots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isBooked: { type: Boolean, default: false }
    }]
  },
  { timestamps: true }
);

// Create a compound index on instructor and date to ensure uniqueness
ScheduleSchema.index({ instructor: 1, date: 1 }, { unique: true });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);