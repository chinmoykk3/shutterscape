import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  adminId?: mongoose.Types.ObjectId | null;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'lockout';
  entity: 'Activity' | 'GalleryItem' | 'Member' | 'StoryScene' | 'Settings' | 'Auth';
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: false,
      default: null,
      index: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'lockout'],
      required: true,
      index: true,
    },
    entity: {
      type: String,
      enum: ['Activity', 'GalleryItem', 'Member', 'StoryScene', 'Settings', 'Auth'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);