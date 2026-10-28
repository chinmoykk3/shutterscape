import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMemberImage {
  url: string;
  publicId: string;
  blurDataURL?: string;
}

export interface IMember extends Document {
  name: string;
  role: string;
  type: 'faculty' | 'core' | 'alumni';
  image: IMemberImage;
  batch?: string;
  quote?: string;
  whereNow?: string;
  order: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['faculty', 'core', 'alumni'],
      required: true,
      index: true,
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      blurDataURL: { type: String },
    },
    batch: {
      type: String,
      trim: true,
    },
    quote: {
      type: String,
      trim: true,
    },
    whereNow: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);