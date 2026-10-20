import { connectDB } from '@/lib/db';
import { Settings, ISettings } from '@/lib/models/Settings';

export interface PublicSettings {
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
}

export const DEFAULT_SETTINGS: PublicSettings = {
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
        {
            url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1600&auto=format&fit=crop',
            publicId: 'hero_darkroom_light',
            caption: 'Light meeting silver halide',
        },
    ],
    footerTagline: 'End Credits — Capturing the fleeting moments of GCU since 2023.',
    stats: {
        members: 74,
        events: 22,
        photos: 1850,
    },
};

export async function getPublicSettings(): Promise<PublicSettings> {
    try {
        await connectDB();
        const doc = await Settings.findOne().lean<ISettings | null>();
        if (!doc) {
            return DEFAULT_SETTINGS;
        }

        return {
            instagramUrl: doc.instagramUrl || DEFAULT_SETTINGS.instagramUrl,
            whatsappUrl: doc.whatsappUrl || DEFAULT_SETTINGS.whatsappUrl,
            email: doc.email || DEFAULT_SETTINGS.email,
            address: doc.address || DEFAULT_SETTINGS.address,
            mapEmbedUrl: doc.mapEmbedUrl || DEFAULT_SETTINGS.mapEmbedUrl,
            heroTitle: doc.heroTitle || DEFAULT_SETTINGS.heroTitle,
            heroSubtitle: doc.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
            heroImages:
                doc.heroImages && doc.heroImages.length > 0
                    ? doc.heroImages.map((img) => ({
                        url: img.url,
                        publicId: img.publicId,
                        caption: img.caption,
                    }))
                    : DEFAULT_SETTINGS.heroImages,
            footerTagline: doc.footerTagline || DEFAULT_SETTINGS.footerTagline,
            stats: {
                members: doc.stats?.members ?? DEFAULT_SETTINGS.stats.members,
                events: doc.stats?.events ?? DEFAULT_SETTINGS.stats.events,
                photos: doc.stats?.photos ?? DEFAULT_SETTINGS.stats.photos,
            },
        };
    } catch (error) {
        console.error('Failed to query Settings from MongoDB:', error);
        return DEFAULT_SETTINGS;
    }
}