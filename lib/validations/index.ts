import { z } from 'zod';

// Shared Image Schema
export const ImageAssetSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string().min(1, 'Public ID is required'),
  blurDataURL: z.string().optional(),
});

// Admin Auth Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Activity Validation
export const ActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case lowercase numbers and hyphens'),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  venue: z.string().max(100).optional(),
  descriptionHtml: z.string().min(10, 'Description must be at least 10 characters'),
  pullQuote: z.string().max(300).optional(),
  image: ImageAssetSchema,
  registrationLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
});

// Gallery Item Validation
export const GalleryItemSchema = z.object({
  image: ImageAssetSchema.extend({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  caption: z.string().min(2, 'Caption is required').max(200),
  story: z.string().max(2000).optional(),
  photographer: z.string().max(100).optional(),
  cameraInfo: z.string().max(120).optional(),
  room: z.string().min(1, 'Room/Category is required').default('General'),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
});

// Member Validation
export const MemberSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  role: z.string().min(2, 'Role is required').max(100),
  type: z.enum(['faculty', 'core', 'alumni']),
  image: ImageAssetSchema,
  batch: z.string().max(50).optional(),
  quote: z.string().max(300).optional(),
  order: z.number().int().default(0),
  status: z.enum(['active', 'archived']).default('active'),
});

// StoryScene Validation
export const StorySceneSchema = z.object({
  key: z.string().min(1),
  order: z.number().int().min(0).max(10),
  headline: z.string().min(2),
  bodyText: z.string().min(5),
  image: ImageAssetSchema.optional(),
  status: z.enum(['active', 'disabled']).default('active'),
});

// Settings Validation
export const SettingsSchema = z.object({
  instagramUrl: z.string().url(),
  whatsappUrl: z.string().url(),
  email: z.string().email(),
  address: z.string().min(5),
  mapEmbedUrl: z.string().url(),
  heroTitle: z.string().min(3),
  heroSubtitle: z.string().min(3),
  heroImages: z.array(
    z.object({
      url: z.string().url(),
      publicId: z.string(),
      caption: z.string().optional(),
    })
  ),
  footerTagline: z.string().min(5),
  stats: z.object({
    members: z.number().int().nonnegative(),
    events: z.number().int().nonnegative(),
    photos: z.number().int().nonnegative(),
  }),
});