import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { Admin } from '../lib/models/Admin';
import { Settings } from '../lib/models/Settings';
import { StoryScene } from '../lib/models/StoryScene';
import { Activity } from '../lib/models/Activity';
import { GalleryItem } from '../lib/models/GalleryItem';
import { Member } from '../lib/models/Member';
import { AuditLog } from '../lib/models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing from environment');
  process.exit(1);
}

async function runSeed() {
  console.log('🎞️ Initializing ShutterScape Database Seed with verified document records...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('✅ Connected to MongoDB.');

  await Promise.all([
    Admin.deleteMany({}),
    Settings.deleteMany({}),
    StoryScene.deleteMany({}),
    Activity.deleteMany({}),
    GalleryItem.deleteMany({}),
    Member.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. Master Admin
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@gcuniversity.ac.in';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ShutterScape@2026!Master';
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const masterAdmin = await Admin.create({
    name: process.env.ADMIN_SEED_NAME || 'ShutterScape Lead',
    email: adminEmail,
    passwordHash,
    failedAttempts: 0,
    lockUntil: null,
  });

  // 2. Settings
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
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600&auto=format&fit=crop',
        publicId: 'hero_camera_vintage',
        caption: 'The mechanical eye',
      },
    ],
    footerTagline: 'End Credits — Capturing the fleeting moments of GCU since 2023[cite: 32].',
    stats: {
      members: 74,
      events: 22,
      photos: 1850,
    },
  });

  // 3. Homepage Story Scenes
  const storyScenes = [
    { key: 'scene-0-darkness', order: 0, headline: 'Darkness', bodyText: 'Every photograph begins in the dark.', status: 'active' },
    { key: 'scene-1-light', order: 1, headline: 'Light', bodyText: 'We are ShutterScape. The eyes of GCU[cite: 33].', status: 'active' },
    { key: 'scene-2-frame', order: 2, headline: 'Frame', bodyText: 'We learn to see before we learn to shoot.', status: 'active' },
    { key: 'scene-3-moments', order: 3, headline: 'Moments', bodyText: '36 exposures. Countless stories.', status: 'active' },
    { key: 'scene-4-next-frame', order: 4, headline: 'Next Frame', bodyText: 'The next frame is still blank.', status: 'active' },
    { key: 'scene-5-epilogue', order: 5, headline: 'Epilogue', bodyText: 'Your story could be the next shot.', status: 'active' },
  ];
  await StoryScene.insertMany(storyScenes);

  // 4. Activities
  const activities = [
    {
      title: 'Monochrome Expressions: Darkroom Printing Workshop',
      slug: 'monochrome-expressions-workshop-2026',
      date: new Date('2026-11-14T10:00:00+05:30'),
      venue: 'GCU Media Lab & Darkroom, Block C',
      descriptionHtml: '<p>Step into the safelight. A hands-on physical printmaking workshop exploring silver gelatin processing.</p>',
      pullQuote: 'Seeing your shot bloom in the chemicals is pure magic.',
      image: { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop', publicId: 'activity_workshop_future' },
      status: 'published',
    },
    {
      title: 'World Photography Day Exhibition 2026',
      slug: 'world-photography-day-exhibition-2026',
      date: new Date('2026-08-19T09:30:00+05:30'),
      venue: 'Main Auditorium Foyer, GCU Campus',
      descriptionHtml: '<p>Celebrating World Photography Day with student prints displayed across the central gallery wall[cite: 41].</p>',
      pullQuote: 'A frame is not complete until it shares space with the world.',
      image: { url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1200&auto=format&fit=crop', publicId: 'activity_wpd_2026' },
      status: 'published',
    },
    {
      title: 'Euphuism Artsy Lens Photowalk: Barduar Tea Estates',
      slug: 'artsy-lens-barduar-tea-estate',
      date: new Date('2025-03-22T08:00:00+05:30'),
      venue: 'Barduar Tea Garden No. 3, Assam[cite: 42]',
      descriptionHtml: '<p>Our flagship rural photowalk capturing early morning mist, geometric foliage lines, and plantation life[cite: 42].</p>',
      pullQuote: 'Your eye. Your idea. Your story[cite: 43].',
      image: { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop', publicId: 'activity_barduar_walk' },
      status: 'published',
    },
  ];
  await Activity.insertMany(activities);

  // 5. Gallery Items
  const galleryItems = [
    {
      image: {
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        publicId: 'gallery_brahmaputra_sunset',
        width: 1200,
        height: 800,
      },
      caption: 'Golden Dusk over the Brahmaputra',
      photographer: 'Ikhyt De Neog',
      room: 'Landscape',
      featured: true,
      status: 'published',
    },
  ];
  await GalleryItem.insertMany(galleryItems);

  // 6. Members (Exact Roster from Document)
  const members = [
    // Faculty Mentors
    {
      name: 'Dr. Sangeeta Das',
      role: 'Faculty Coordinator (Asst. Prof, Dept. of Mechanical Engg)',
      type: 'faculty',
      image: { url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop', publicId: 'faculty_sangeeta_das' },
      quote: 'Photography is technical precision harmonized with emotional truth.',
      order: 1,
    },
    {
      name: 'Dr. Barsha Chhetri',
      role: 'Faculty Co-Coordinator (Asst. Prof & Head i/c, Dept. of Education)',
      type: 'faculty',
      image: { url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=800&auto=format&fit=crop', publicId: 'faculty_barsha_chhetri' },
      quote: 'Every picture taken by a student is a lens into their personal universe.',
      order: 2,
    },
    // Core Committee
    {
      name: 'Uttama Purkayastha',
      role: 'President',
      type: 'core',
      image: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', publicId: 'core_uttama_purkayastha' },
      order: 1,
    },
    {
      name: 'Ikhyt De Neog',
      role: 'Vice-President',
      type: 'core',
      image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', publicId: 'core_ikhyt_de_neog' },
      order: 2,
    },
    {
      name: 'Richita Sarma',
      role: 'Secretary',
      type: 'core',
      image: { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', publicId: 'core_richita_sarma' },
      order: 3,
    },
    // Core Members
    { name: 'Sohaib Hussain', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop', publicId: 'core_sohaib' }, order: 4 },
    { name: 'Mahadananda Dutta', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop', publicId: 'core_mahadananda' }, order: 5 },
    { name: 'Manash Pratim Sarma', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop', publicId: 'core_manash' }, order: 6 },
    { name: 'Mubina Ahmed', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', publicId: 'core_mubina' }, order: 7 },
    { name: 'Pratyush Bikash Choudhury', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=800&auto=format&fit=crop', publicId: 'core_pratyush' }, order: 8 },
    { name: 'Hiya Das', role: 'Core Member', type: 'core', image: { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop', publicId: 'core_hiya' }, order: 9 },
    // Alumni Negatives (Founders & Team Carried Forward)
    { name: 'Dheemaan Deka', role: 'Founding Member (2023)', type: 'alumni', batch: 'Class of 2024', image: { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop', publicId: 'alumni_dheemaan' }, order: 1 },
    { name: 'Subhrajyoti Goswami', role: 'Founding Member (2023)', type: 'alumni', batch: 'Class of 2024', image: { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop', publicId: 'alumni_subhrajyoti' }, order: 2 },
    { name: 'Imran Farhat', role: 'Alumni / Core Contributor', type: 'alumni', batch: 'Class of 2025', image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop', publicId: 'alumni_imran' }, order: 3 },
    { name: 'Gargi Medhi', role: 'Alumni / Core Contributor', type: 'alumni', batch: 'Class of 2025', image: { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop', publicId: 'alumni_gargi' }, order: 4 },
  ];
  await Member.insertMany(members);

  await AuditLog.create({
    adminId: masterAdmin._id,
    action: 'create',
    entity: 'Settings',
    entityId: (settings._id as mongoose.Types.ObjectId).toString(),
    details: { note: 'Database seeded with official club document roster.' },
    ipAddress: '127.0.0.1',
  });

  console.log('✨ Seed process completed with official document roster!');
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seed execution failed:', err);
  mongoose.disconnect();
  process.exit(1);
});