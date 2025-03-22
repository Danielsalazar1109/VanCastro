import mongoose, { Schema, Document } from 'mongoose';

export interface IClassType extends Document {
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClassTypeSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.ClassType || mongoose.model<IClassType>('ClassType', ClassTypeSchema);