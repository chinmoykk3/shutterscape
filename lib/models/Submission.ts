import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubmission extends Document {
  name: string;
  email: string;
  message?: string;
  handled: boolean;
  createdAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    handled: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
