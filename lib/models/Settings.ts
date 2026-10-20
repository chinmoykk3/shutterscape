import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  instagramUrl: string;
  whatsappUrl: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImages: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  footerTagline: string;
  stats: {
    members: number;
    events: number;
    photos: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    instagramUrl: {
      type: String,
      default: 'https://www.instagram.com/shutterscape_gcu',
    },
    whatsappUrl: {
      type: String,
      default: 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
    },
    email: {
      type: String,
      default: 'shutterscape@gcuniversity.ac.in',
    },
    address: {
      type: String,
      default: 'Girijananda Chowdhury University, Azara, Guwahati, Assam 781017',
    },
    mapEmbedUrl: {
      type: String,
      default:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.7915570530733!2d91.61936107609825!3d26.133231792965684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a452efbb07f87%3A0xe543cbe26b52a514!2sGirijananda%20Chowdhury%20University!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
    },
    heroTitle: {
      type: String,
      default: 'Every frame tells a story.',
    },
    heroSubtitle: {
      type: String,
      default: 'We are ShutterScape. The eyes of GCU.',
    },
    heroImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String },
      },
    ],
    footerTagline: {
      type: String,
      default: 'End Credits — Capturing the fleeting moments of GCU since 2023.',
    },
    stats: {
      members: { type: Number, default: 65 },
      events: { type: Number, default: 18 },
      photos: { type: Number, default: 1200 },
    },
  },
  {
    timestamps: true,
  }
);

export const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);