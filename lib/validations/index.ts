import { z } from 'zod';

// Shared Image Schema (supports both absolute URLs, Cloudinary, and local relative paths like /uploads/...)
export const ImageUrlSchema = z
  .string()
  .min(1, 'Image URL or path is required')
  .refine(
    (val) =>
      val.startsWith('/') ||
      val.startsWith('http://') ||
      val.startsWith('https://') ||
      val.startsWith('data:') ||
      val.startsWith('blob:'),
    { message: 'Invalid image URL or path. Must start with http://, https://, or /' }
  );

export const ImageAssetSchema = z.object({
  url: ImageUrlSchema,
  publicId: z.string().min(1, 'Public ID is required'),
  blurDataURL: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  focalPoint: z
    .object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    })
    .optional(),
});

// Admin Auth Validation
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  totpToken: z.string().optional(),
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
  publishAt: z.coerce.date().optional(),
  status: z.enum(['draft', 'scheduled', 'published']),
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
  activityId: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  photoOfTheWeek: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
});

// PhotoStory Validation
export const PhotoStorySchema = z.object({
  title: z.string().min(3, 'Title is required').max(150),
  slug: z
    .string()
    .min(3)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case lowercase numbers and hyphens'),
  intro: z.string().min(10, 'Intro must be at least 10 characters'),
  cover: ImageAssetSchema,
  frames: z.array(
    z.object({
      galleryItemId: z.string().min(1, 'Gallery item ID is required'),
      narration: z.string().min(3, 'Narration must be at least 3 characters'),
    })
  ).min(1, 'At least one frame is required'),
  status: z.enum(['draft', 'published']).default('published'),
});

// Member Validation
export const MemberSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  role: z.string().min(2, 'Role is required').max(150),
  type: z.enum(['faculty', 'core', 'alumni']),
  image: ImageAssetSchema,
  batch: z.string().max(100).optional().nullable(),
  quote: z.string().max(500).optional().nullable(),
  whereNow: z.string().max(200).optional().nullable(),
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

// Submission Validation
export const SubmissionSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  message: z.string().max(1000).optional(),
  honeypot: z.string().max(0, 'Bot detected').optional(),
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
      url: ImageUrlSchema,
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
  soundDefault: z.boolean().default(false),
  themeMode: z.enum(['auto', 'dawn', 'daylight', 'golden', 'night']).default('auto'),
});