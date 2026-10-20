import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGalleryItem extends Document {
  image: {
    url: string;
    publicId: string;
    width: number;
    height: number;
    blurDataURL?: string;
  };
  caption: string;
  story?: string;
  photographer?: string;
  cameraInfo?: string;
  room: string;
  featured: boolean;
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
    featured: {
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