import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
  email: string;
  ipAddress: string;
  timestamp: Date;
  successful: boolean;
}

const LoginAttemptSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  successful: {
    type: Boolean,
    default: false
  }
});

// Create a compound index for more efficient queries
LoginAttemptSchema.index({ email: 1, ipAddress: 1, timestamp: 1 });

export default mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
