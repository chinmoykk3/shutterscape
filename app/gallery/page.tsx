import React from 'react';
import { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { GalleryItem, IGalleryItem } from '@/lib/models/GalleryItem';
import { Badge } from '@/components/ui/Badge';
import { CameraReadout } from '@/components/story/CameraReadout';
import { GalleryLightTable, GalleryItemData } from '@/components/gallery/GalleryLightTable';

export const revalidate = 60; // ISR cache every 60s

export const metadata: Metadata = {
  title: 'Gallery & Light Table | ShutterScape GCU',
  description:
    'Curated 35mm exposures, student fine prints, and visual stories illuminated on the ShutterScape Darkroom Light Table.',
  openGraph: {
    title: 'Gallery & Light Table // ShutterScape GCU',
    description:
      'Curated 35mm exposures, student fine prints, and visual stories illuminated on the ShutterScape Darkroom Light Table.',
  },
};

async function getGalleryItems(): Promise<GalleryItemData[]> {
  try {
    await connectDB();
    const items = await GalleryItem.find({ status: 'published' })
      .sort({ featured: -1, createdAt: -1 })
      .lean<IGalleryItem[]>();

    return JSON.parse(JSON.stringify(items));
  } catch (error) {
    console.error('Failed to query gallery items:', error);
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Light Leak Glows */}
      <div className="absolute top-12 left-1/4 w-[500px] h-[400px] rounded-full light-leak-amber blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-12 w-[450px] h-[450px] rounded-full light-leak-safelight blur-[160px] pointer-events-none" />

      {/* Hero Header */}
      <header className="relative z-10 text-center max-w-3xl mx-auto space-y-6 pt-8">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="amber">
            {'● CHAPTER 03 // THE LIGHT TABLE'}
          </Badge>
          <CameraReadout
            aperture="f/1.4"
            shutter="1/1000s"
            iso="ILLUMINATION 5000K"
            mode="FINE PRINT"
          />
        </div>

        <div className="space-y-3">
          <h1 className="font-title text-4xl sm:text-5xl md:text-6xl font-black text-offwhite tracking-tight leading-[1.1]">
            Curated Exposures &amp; Fine Prints
          </h1>
          <p className="font-mono text-sm sm:text-base text-offwhite-muted max-w-2xl mx-auto">
            Place your loupe on the light table. Discover fine prints, street silhouettes,
            and landscapes captured by the lenses of Girijananda Chowdhury University.
          </p>
        </div>
      </header>

      {/* Interactive Light Table View */}
      <section aria-label="Light table photo collection" className="relative z-10">
        <GalleryLightTable initialItems={items} />
      </section>
    </div>
  );
}
