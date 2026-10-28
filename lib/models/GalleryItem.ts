import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryItem extends Document {
  image: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    blurDataURL?: string;
    focalPoint?: {
      x: number;
      y: number;
    };
  };
  caption: string;
  story?: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  activityId?: mongoose.Types.ObjectId | null;
  instagramUrl?: string;
  instagramId?: string;
  featured: boolean;
  photoOfTheWeek: boolean;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>(
  {
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      blurDataURL: { type: String },
      focalPoint: {
        x: { type: Number, default: 0.5 },
        y: { type: Number, default: 0.5 },
      },
    },
    caption: {
      type: String,
      required: [true, 'Caption is required'],
      trim: true,
    },
    story: {
      type: String,
      trim: true,
    },
    photographer: {
      type: String,
      trim: true,
    },
    cameraInfo: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      required: true,
      default: 'General',
      index: true,
    },
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
      index: true,
    },
    instagramUrl: {
      type: String,
      trim: true,
    },
    instagramId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    photoOfTheWeek: {
      type: Boolean,
      default: false,
      index: true,
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

export const GalleryItem: Model<IGalleryItem> =
  mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);