// File: app/api/admin/instagram/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { GalleryItem } from '@/lib/models/GalleryItem';

export interface RecentInstagramPost {
  code: string;
  url: string;
  caption: string;
  room: string;
  photographer: string;
  imageUrl?: string;
  alreadyImported: boolean;
}

const KNOWN_SHUTTERSCAPE_POSTS = [
  {
    code: 'DejCSHaFLVz',
    url: 'https://www.instagram.com/p/DejCSHaFLVz/',
    caption: 'GCU CELEBRATES ITS 4TH FOUNDATION DAY WITH PHOTOGRAPHY COMPETITION\n\nThe Photography Club of Girijananda Chowdhury University proudly announces the winners: 1st Prize: Aryan Deep Singh (B.Tech), 2nd Prize: Asgory Begum (Psychology), 3rd Prize: Beda Prakash Sarmah (ECE).',
    room: 'Monochrome',
    photographer: 'Aryan Deep Singh & ShutterScape',
    imageUrl: 'https://scontent.cdninstagram.com/v/t51.82787-15/851887513_17997138270047166_1314791726476711389_n.jpg?stp=c423.0.1269.1269a_dst-jpg_e35_s640x640_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=o50tWC7pfrQQ7kNvwE0WEDw&_nc_oc=AdortRO0mvD9e9FVez4myvp3bXuj0b1JR7AhhjdLusPtXnwTU_-BWYnKe-FRInY6e9g&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=rtWm3Ggr8lPmqd-fO8x8Pg&_nc_ss=7ca8c&oh=00_AQS7QeiLRu-eU2Df0Kqo28b9Z7gSzv4B-MObcYrGrecyyg&oe=6AE75BAC',
  },
  {
    code: 'DeDsB0TCDz6',
    url: 'https://www.instagram.com/p/DeDsB0TCDz6/',
    caption: 'Our first photography workshop at Girijananda Chowdhury University, Guwahati was a wonderful experience—and our 4th workshop in Guwahati made it even more special. The session was all about creative exploration, observation and learning to see through light.',
    room: 'Activities',
    photographer: 'Virendra Adhikari | Light Painting',
    imageUrl: '/uploads/instagram/latest_DeDsB0TCDz6_0.jpg',
  },
  {
    code: 'DdoYKVQyrYB',
    url: 'https://www.instagram.com/p/DdoYKVQyrYB/',
    caption: 'Celebrating the 100th Birth Anniversary of Dr. Bhupen Hazarika. Through the viewfinder: Media & Mass Communication Lab session.',
    room: 'Campus Life',
    photographer: 'Journalism And Mass Communication GCU',
    imageUrl: '/uploads/instagram/ig_3_DdoYKVQyrYB.jpg',
  },
  {
    code: 'DdWDZl1uysO',
    url: 'https://www.instagram.com/p/DdWDZl1uysO/',
    caption: 'Centenary Tribute to Dr. Bhupen Hazarika on the GCU campus grounds.',
    room: 'Campus Life',
    photographer: 'ShutterScape Collective',
    imageUrl: '/uploads/instagram/ig_4_DdWDZl1uysO.jpg',
  },
  {
    code: 'DdOUEDbBZwO',
    url: 'https://www.instagram.com/p/DdOUEDbBZwO/',
    caption: 'Heartiest congratulations to Imran Farhat, alumnus, on receiving the prestigious photography recognition.',
    room: 'Portraits',
    photographer: 'Imran Farhat',
    imageUrl: '/uploads/instagram/ig_5_DdOUEDbBZwO.jpg',
  },
  {
    code: 'DdMNbragWUX',
    url: 'https://www.instagram.com/p/DdMNbragWUX/',
    caption: 'A random day in GCU 🍃 Different frames, different stories. The gentle light across the Azara greens.',
    room: 'Street',
    photographer: 'Akash Visuals (@_akash_visuallls_)',
    imageUrl: '/uploads/instagram/ig_6_DdMNbragWUX.jpg',
  },
  {
    code: 'Dc0hl1NJKuD',
    url: 'https://www.instagram.com/p/Dc0hl1NJKuD/',
    caption: 'Confidence in every step. Style in every stride. GCU Grooming & Fashion Society runway photography.',
    room: 'Campus Life',
    photographer: 'Akash Visuals (@_akash_visuallls_)',
    imageUrl: '/uploads/instagram/ig_7_Dc0hl1NJKuD.jpg',
  },
  {
    code: 'Dc0ENbRhEM-',
    url: 'https://www.instagram.com/p/Dc0ENbRhEM-/',
    caption: 'Welcome to GCU Tashanbaaz Youth Festival with RED FM 93.5! High energy, electric frames, live auditorium stages.',
    room: 'Activities',
    photographer: 'Dr. Subham Sharma (PT) & ShutterScape',
    imageUrl: '/uploads/instagram/ig_8_Dc0ENbRhEM-.jpg',
  },
  {
    code: 'Dcxd4vzhv-F',
    url: 'https://www.instagram.com/p/Dcxd4vzhv-F/',
    caption: 'A new beginning... Monsoons at GCU with rain reflections across the courtyard.',
    room: 'Nature',
    photographer: 'ShutterScape Collective',
    imageUrl: '/uploads/instagram/ig_9_Dcxd4vzhv-F.jpg',
  },
  {
    code: 'DchuX7vzgh0',
    url: 'https://www.instagram.com/p/DchuX7vzgh0/',
    caption: 'Sunrise over GCU grounds. Dew on the leaves and warm golden hour light.',
    room: 'Nature',
    photographer: 'ShutterScape Collective',
    imageUrl: '/uploads/instagram/ig_10_DchuX7vzgh0.jpg',
  },
  {
    code: 'DcdEL2eRLdN',
    url: 'https://www.instagram.com/p/DcdEL2eRLdN/',
    caption: 'Two days. Countless moments. One unforgettable beginning. Welcome to the new batch of photographers.',
    room: 'Campus Life',
    photographer: 'ShutterScape Collective',
    imageUrl: '/uploads/instagram/ig_11_DcdEL2eRLdN.jpg',
  },
  {
    code: 'DcStaBhlBQW',
    url: 'https://www.instagram.com/p/DcStaBhlBQW/',
    caption: 'GCU CELEBRATES WORLD PHOTOGRAPHY DAY WITH SHUTTERSCAPE. The collective assembled for the annual gallery showcase.',
    room: 'Campus Life',
    photographer: 'ShutterScape Collective',
    imageUrl: '/uploads/instagram/ig_12_DcStaBhlBQW.jpg',
  },
];

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const existingItems = await GalleryItem.find({
      instagramId: { $in: KNOWN_SHUTTERSCAPE_POSTS.map((p) => p.code) },
    }).select('instagramId image');

    const importedIds = new Set(existingItems.map((it) => it.instagramId));

    const posts: RecentInstagramPost[] = KNOWN_SHUTTERSCAPE_POSTS.map((p) => {
      const dbMatch = existingItems.find((it) => it.instagramId === p.code);
      return {
        ...p,
        imageUrl: dbMatch?.image?.url || p.imageUrl,
        alreadyImported: importedIds.has(p.code),
      };
    });

    return NextResponse.json({
      success: true,
      account: '@shutterscape_gcu',
      posts,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve recent posts' },
      { status: 500 }
    );
  }
}

