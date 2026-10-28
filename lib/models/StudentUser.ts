import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  rollNumber?: string;
  department?: string;
  semester?: string;
  phone?: string;
  instagramHandle?: string;
  cameraGear?: string;
  bio?: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  role: 'member' | 'student';
  status: 'active' | 'pending' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const StudentUserSchema = new Schema<IStudentUser>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    rollNumber: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: 'General',
    },
    semester: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    instagramHandle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    cameraGear: {
      type: String,
      trim: true,
      maxlength: 150,
      default: 'Smartphone / Digital Camera',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    avatar: {
      url: { type: String },
      publicId: { type: String },
    },
    role: {
      type: String,
      enum: ['member', 'student'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StudentUser: Model<IStudentUser> =
  mongoose.models.StudentUser || mongoose.model<IStudentUser>('StudentUser', StudentUserSchema);

