import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPhotoSubmission extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  department?: string;
  title: string;
  story?: string;
  room: string;
  cameraInfo?: string;
  image: {
    url: string;
    publicId: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
  };
  status: 'pending' | 'approved' | 'featured' | 'rejected';
  curatorNotes?: string;
  exhibitionItemId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSubmissionSchema = new Schema<IPhotoSubmission>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentUser',
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    studentEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Exposure title / caption is required'],
      trim: true,
      maxlength: 150,
    },
    story: {
      type: String,
      trim: true,
      maxlength: 1500,
    },
    room: {
      type: String,
      required: true,
      default: 'Campus Life',
      index: true,
    },
    cameraInfo: {
      type: String,
      trim: true,
      maxlength: 120,
      default: 'Digital Exposure',
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      blurDataURL: { type: String },
      width: { type: Number, default: 1200 },
      height: { type: Number, default: 800 },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'featured', 'rejected'],
      default: 'pending',
      index: true,
    },
    curatorNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    exhibitionItemId: {
      type: Schema.Types.ObjectId,
      ref: 'GalleryItem',
    },
  },
  {
    timestamps: true,
  }
);

export const PhotoSubmission: Model<IPhotoSubmission> =
  mongoose.models.PhotoSubmission ||
  mongoose.model<IPhotoSubmission>('PhotoSubmission', PhotoSubmissionSchema);

