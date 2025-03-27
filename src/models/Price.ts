import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPrice extends Document {
  classType: string;
  duration: number;
  package: string;
  price: number;
}

const PriceSchema: Schema = new Schema(
  {
    classType: { 
      type: String, 
      enum: ['class 4', 'class 5', 'class 7'],
      required: true 
    },
    duration: { 
      type: Number, 
      enum: [60, 90, 120],
      required: true 
    },
    package: { 
      type: String, 
      enum: ['1 lesson', '3 lessons', '10 lessons'],
      required: true 
    },
    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// Create a compound index to ensure uniqueness of classType, duration, and package combination
PriceSchema.index({ classType: 1, duration: 1, package: 1 }, { unique: true });

// Check if the model is already defined to prevent overwriting during hot reloads
export default mongoose.models.Price || mongoose.model<IPrice>('Price', PriceSchema);