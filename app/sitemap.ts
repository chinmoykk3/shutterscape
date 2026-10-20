import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Activity } from '@/lib/models/Activity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shutterscape.gcuniversity.ac.in';

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/activities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Dynamic activity routes from MongoDB
  try {
    await connectDB();
    const activities = await Activity.find({ status: 'published' })
      .select('slug updatedAt date')
      .lean<{ slug: string; updatedAt?: Date; date: Date }[]>();

    const dynamicRoutes: MetadataRoute.Sitemap = activities.map((act) => ({
      url: `${baseUrl}/activities/${act.slug}`,
      lastModified: act.updatedAt ? new Date(act.updatedAt) : new Date(act.date),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes:', error);
    return staticRoutes;
  }
}
