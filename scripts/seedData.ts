import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import {
  Admin,
  Member,
  Activity,
  GalleryItem,
  StoryScene,
  Settings,
} from '../lib/models';

// Load environment variables from .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/shutterscape';

async function seed() {
  console.log('🌱 Starting ShutterScape database seeding...');
  console.log(`Connecting to MongoDB...`);

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB successfully.');

  // Clean existing collections
  console.log('Cleaning existing collections...');
  await Promise.all([
    Admin.deleteMany({}),
    Member.deleteMany({}),
    Activity.deleteMany({}),
    GalleryItem.deleteMany({}),
    StoryScene.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  // 1. Seed Admin
  console.log('Seeding initial admin user...');
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL || 'admin@shutterscape.com';
  const rawPassword = process.env.ADMIN_INITIAL_PASSWORD || 'ShutterScape@2026!';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await Admin.create({
    name: 'Lead Curator',
    email: adminEmail,
    passwordHash,
    failedAttempts: 0,
    lockUntil: null,
    lastLogin: null,
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // 2. Seed Members
  console.log('Seeding club members (Faculty, Core, Alumni)...');
  const members = await Member.insertMany([
    {
      name: 'Dr. Debasish Sarma',
      role: 'Faculty Advisor',
      type: 'faculty',
      batch: 'Department of Media Studies',
      quote: 'Photography is not about looking, it is about feeling with light.',
      image: {
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        publicId: 'shutterscape/members/faculty_debasish',
      },
      order: 1,
      status: 'active',
    },
    {
      name: 'Priyanka Das',
      role: 'Club President & Lead Storyteller',
      type: 'core',
      batch: 'Batch of 2026',
      quote: 'Capturing the raw, unfiltered heartbeat of GCU campus life.',
      image: {
        url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
        publicId: 'shutterscape/members/priyanka_das',
      },
      order: 2,
      status: 'active',
    },
    {
      name: 'Arindam Goswami',
      role: 'Head of Darkroom & Visual Curation',
      type: 'core',
      batch: 'Batch of 2026',
      quote: 'Every dark room conceals a latent memory waiting to emerge.',
      image: {
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        publicId: 'shutterscape/members/arindam_goswami',
      },
      order: 3,
      status: 'active',
    },
    {
      name: 'Kallol Barman',
      role: 'Founding Member & Mentor',
      type: 'alumni',
      batch: 'Batch of 2024',
      quote: 'The shutter sound remains constant, but the perspective matures.',
      image: {
        url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
        publicId: 'shutterscape/members/kallol_barman',
      },
      order: 4,
      status: 'active',
    },
  ]);
  console.log(`✓ Created ${members.length} members.`);

  // 3. Seed Activities
  console.log('Seeding club activities...');
  const activities = await Activity.insertMany([
    {
      title: 'Monsoon Framing: Wet Plate & Street Photowalk',
      slug: 'monsoon-framing-wet-plate-street-photowalk',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      venue: 'Azara Campus Botanical Gardens & Lakeside',
      descriptionHtml:
        '<p>A guided photography walk exploring high contrast reflections, water drops, and dynamic monsoon tones across the university grounds.</p>',
      pullQuote: 'Rain softens the world; the lens clarifies the emotion.',
      image: {
        url: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1200&q=80',
        publicId: 'shutterscape/activities/monsoon_framing',
      },
      registrationLink: 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc',
      status: 'published',
    },
    {
      title: 'Cyanotype & Darkroom Chemistry Workshop',
      slug: 'cyanotype-darkroom-chemistry-workshop',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
      venue: 'Media Studio Block B, Darkroom Annex',
      descriptionHtml:
        '<p>Hands-on historical printmaking and photogram creation utilizing traditional iron-salt solutions under safelight conditions.</p>',
      pullQuote: 'Tracing sunlight with iron and shadow.',
      image: {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80',
        publicId: 'shutterscape/activities/cyanotype_workshop',
      },
      status: 'published',
    },
  ]);
  console.log(`✓ Created ${activities.length} activities.`);

  // 4. Seed Gallery Items
  console.log('Seeding gallery frames...');
  const galleryItems = await GalleryItem.insertMany([
    {
      caption: 'Twilight over Brahmaputra',
      story:
        'Captured during the autumn expedition. The river currents reflected the last crimson hues as fisherman moored their wooden boats.',
      photographer: 'Priyanka Das',
      cameraInfo: 'Sony A7 IV • FE 24-70mm f/2.8 • 1/160s • f/4.5 • ISO 200',
      room: 'Rivers & Mist',
      featured: true,
      status: 'published',
      image: {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/gallery/brahmaputra_twilight',
        width: 1600,
        height: 1067,
      },
    },
    {
      caption: 'The Latent Courtyard',
      story:
        'Archways of GCU bathed in angled afternoon light, creating geometric shadows across the cobblestones.',
      photographer: 'Arindam Goswami',
      cameraInfo: 'Fujifilm X-T5 • XF 35mm f/1.4 • 1/250s • f/2.0 • ISO 160',
      room: 'Architecture',
      featured: true,
      status: 'published',
      image: {
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/gallery/gcu_courtyard',
        width: 1600,
        height: 1067,
      },
    },
    {
      caption: 'Whispering Canopy',
      story: 'Dense bamboo grottos of Assam shrouded in morning mist.',
      photographer: 'Kallol Barman',
      cameraInfo: 'Nikon Z6 II • 50mm f/1.8 • 1/125s • f/2.8 • ISO 400',
      room: 'Nature',
      featured: false,
      status: 'published',
      image: {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/gallery/bamboo_canopy',
        width: 1600,
        height: 1067,
      },
    },
  ]);
  console.log(`✓ Created ${galleryItems.length} gallery items.`);

  // 5. Seed Story Scenes
  console.log('Seeding narrative story scenes...');
  const storyScenes = await StoryScene.insertMany([
    {
      key: 'scene-aperture-first-light',
      order: 1,
      headline: 'Frame I: The Latent Image',
      bodyText:
        'Before the silver crystals react, before the shutter blades part—there is only anticipation. In every corner of GCU, stories wait in dormant light.',
      image: {
        url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/scenes/scene_1',
      },
      status: 'active',
    },
    {
      key: 'scene-safelight-development',
      order: 2,
      headline: 'Frame II: Under the Safelight',
      bodyText:
        'In the amber and crimson glow of the darkroom, memory transforms into permanence. Chemistry meets craft.',
      image: {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/scenes/scene_2',
      },
      status: 'active',
    },
    {
      key: 'scene-the-print',
      order: 3,
      headline: 'Frame III: The Final Exposure',
      bodyText:
        'A print hung to dry, fixed in time. ShutterScape is not just our club; it is the visual collective of our university.',
      image: {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/scenes/scene_3',
      },
      status: 'active',
    },
  ]);
  console.log(`✓ Created ${storyScenes.length} story scenes.`);

  // 6. Seed Site Settings
  console.log('Seeding site configuration & statistics...');
  const settings = await Settings.create({
    instagramUrl: 'https://www.instagram.com/shutterscape_gcu',
    whatsappUrl: 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
    email: 'shutterscape@gcuniversity.ac.in',
    address: 'Girijananda Chowdhury University, Azara, Guwahati, Assam 781017',
    mapEmbedUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.7915570530733!2d91.61936107609825!3d26.133231792965684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a452efbb07f87%3A0xe543cbe26b52a514!2sGirijananda%20Chowdhury%20University!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
    heroTitle: 'Every frame tells a story.',
    heroSubtitle: 'We are ShutterScape. The eyes of GCU.',
    heroImages: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/hero/hero_1',
        caption: 'Brahmaputra Serenade',
      },
      {
        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80',
        publicId: 'shutterscape/hero/hero_2',
        caption: 'Campus Solitude',
      },
    ],
    footerTagline: 'End Credits — Capturing the fleeting moments of GCU since 2023.',
    stats: {
      members: 65,
      events: 18,
      photos: 1200,
    },
  });
  console.log(`✓ Site settings and stats created.`);

  console.log('✨ All ShutterScape seed data populated successfully!');
}

seed()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log('Mongoose disconnected.');
    process.exit(0);
  });
