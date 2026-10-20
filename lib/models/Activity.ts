import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityImage {
  url: string;
  publicId: string;
  blurDataURL?: string;
}

export interface IActivity extends Document {
  title: string;
  slug: string;
  date: Date;
  endDate?: Date;
  venue?: string;
  descriptionHtml: string;
  pullQuote?: string;
  image: IActivityImage;
  registrationLink?: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Activity date is required'],
      index: true,
    },
    endDate: {
      type: Date,
    },
    venue: {
      type: String,
      trim: true,
    },
    descriptionHtml: {
      type: String,
      required: [true, 'Description is required'],
    },
    pullQuote: {
      type: String,
      trim: true,
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      blurDataURL: { type: String },
    },
    registrationLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);