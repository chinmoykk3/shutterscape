// File: scripts/updateLatestPost.ts
import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import { GalleryItem } from '../lib/models';

async function updateDb() {
  await connectDB();
  console.log('Connected to MongoDB Atlas');

  // Reset any other photoOfTheWeek
  await GalleryItem.updateMany({}, { photoOfTheWeek: false });

  // 1. Update or insert the latest post: DejCSHaFLVz (Oct 16, 2026)
  // Give it the latest timestamp so it always sorts to position #1 in all views
  const latestPost = {
    image: {
      url: '/uploads/instagram/post_DejCSHaFLVz_0.jpg',
      publicId: 'ig_post_DejCSHaFLVz',
      width: 1920,
      height: 1080,
      focalPoint: { x: 0.5, y: 0.5 },
    },
    caption: 'GCU 4th Foundation Day Photography Competition: 1st Prize Winner',
    story:
      'The Photography Club of Girijananda Chowdhury University proudly announces the winners of the Photography Competition held on the occasion of the 4th Foundation Day. 1st Prize: Aryan Deep Singh (1st Semester, B.Tech). Capturing the swift geometry, intense focus, and high-contrast motion of badminton in the GCU sports hall.',
    photographer: 'Aryan Deep Singh (@shutterscape_gcu)',
    cameraInfo: 'GCU Foundation Day • B.Tech 1st Sem • 1st Prize Winner',
    room: 'Monochrome',
    instagramUrl: 'https://www.instagram.com/p/DejCSHaFLVz/',
    instagramId: 'DejCSHaFLVz',
    featured: true,
    photoOfTheWeek: true,
    status: 'published',
    createdAt: new Date('2026-10-21T12:00:00.000Z'),
    updatedAt: new Date(),
  };

  // 1. Update latest post: DejCSHaFLVz with newest timestamp
  await mongoose.connection.collection('galleryitems').updateOne(
    { instagramId: 'DejCSHaFLVz' },
    {
      $set: {
        ...latestPost,
        createdAt: new Date('2026-10-21T13:00:00.000Z'),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log('Updated latest post DejCSHaFLVz as #1 and Photo of the Week!');

  // 2. Update or insert the 2nd latest post: DeDsB0TCDz6 (Oct 3, 2026)
  const workshopPost = {
    image: {
      url: '/uploads/instagram/latest_DeDsB0TCDz6_0.jpg',
      publicId: 'ig_post_DeDsB0TCDz6',
      width: 1200,
      height: 900,
      focalPoint: { x: 0.5, y: 0.5 },
    },
    caption: 'Creative Smartphone & Canon Masterclass at GCU Guwahati',
    story:
      'Our flagship photography workshop at Girijananda Chowdhury University, Guwahati with Vinee Studio and Canon India. A hands-on creative masterclass challenging participants to explore composition, perspective, light, framing and visual storytelling—proving that creativity often matters more than the equipment we use.',
    photographer: 'Vinee Studio x ShutterScape GCU (@vinee.studio)',
    cameraInfo: 'Canon India x ShutterScape • GCU Guwahati Masterclass',
    room: 'Activities',
    instagramUrl: 'https://www.instagram.com/p/DeDsB0TCDz6/',
    instagramId: 'DeDsB0TCDz6',
    featured: true,
    photoOfTheWeek: false,
    status: 'published',
  };

  await mongoose.connection.collection('galleryitems').updateOne(
    { instagramId: 'DeDsB0TCDz6' },
    {
      $set: {
        ...workshopPost,
        createdAt: new Date('2026-10-21T12:00:00.000Z'),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
  console.log('Updated 2nd post DeDsB0TCDz6 as #2!');

  // Verify and print items
  const all = await GalleryItem.find({ status: 'published' })
    .sort({ featured: -1, createdAt: -1 })
    .lean();

  console.log('\n--- Gallery Items in Order of Display ---');
  all.forEach((item: any, idx: number) => {
    console.log(
      `${idx + 1}. [${item.instagramId || 'local'}] ${item.caption} (PhotoOfTheWeek: ${item.photoOfTheWeek}, Date: ${item.createdAt?.toISOString?.() || item.createdAt})`
    );
  });

  process.exit(0);
}

updateDb().catch((err) => {
  console.error(err);
  process.exit(1);
});
