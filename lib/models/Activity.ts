import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityImage {
  url: string;
  publicId: string;
  blurDataURL?: string;
  focalPoint?: {
    x: number;
    y: number;
  };
}

export interface IActivityGalleryItem {
  url: string;
  publicId: string;
  caption?: string;
  blurDataURL?: string;
  width?: number;
  height?: number;
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
  gallery?: IActivityGalleryItem[];
  registrationLink?: string;
  status: 'draft' | 'scheduled' | 'published';
  publishAt?: Date;
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
      focalPoint: {
        x: { type: Number, default: 0.5 },
        y: { type: Number, default: 0.5 },
      },
    },
    gallery: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, trim: true },
        blurDataURL: { type: String },
        width: { type: Number },
        height: { type: Number },
      },
    ],
    registrationLink: {
      type: String,
      trim: true,
    },
    publishAt: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published'],
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