import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStorySceneImage {
  url: string;
  publicId: string;
  blurDataURL?: string;
}

export interface IStoryScene extends Document {
  key: string;
  order: number;
  headline: string;
  bodyText: string;
  image?: IStorySceneImage;
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

const StorySceneSchema = new Schema<IStoryScene>(
  {
    key: {
      type: String,
      required: [true, 'Key is required'],
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      trim: true,
    },
    bodyText: {
      type: String,
      required: [true, 'Body text is required'],
      trim: true,
    },
    image: {
      url: { type: String },
      publicId: { type: String },
      blurDataURL: { type: String },
    },
    status: {
      type: String,
      enum: ['active', 'disabled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export const StoryScene: Model<IStoryScene> =
  mongoose.models.StoryScene || mongoose.model<IStoryScene>('StoryScene', StorySceneSchema);