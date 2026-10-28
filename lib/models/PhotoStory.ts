import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhotoStoryFrame {
  galleryItemId: mongoose.Types.ObjectId;
  narration: string;
}

export interface IPhotoStory extends Document {
  title: string;
  slug: string;
  intro: string;
  frames: IPhotoStoryFrame[];
  cover: {
    url: string;
    publicId: string;
    blurDataURL?: string;
  };
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const PhotoStorySchema = new Schema<IPhotoStory>(
  {
    title: {
      type: String,
      required: [true, 'Story title is required'],
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
    intro: {
      type: String,
      required: [true, 'Introductory narrative is required'],
      trim: true,
    },
    frames: [
      {
        galleryItemId: {
          type: Schema.Types.ObjectId,
          ref: 'GalleryItem',
          required: true,
        },
        narration: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    cover: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      blurDataURL: { type: String },
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

export const PhotoStory: Model<IPhotoStory> =
  mongoose.models.PhotoStory || mongoose.model<IPhotoStory>('PhotoStory', PhotoStorySchema);
