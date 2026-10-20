import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Settings } from '@/lib/models/Settings';
import { AuditLog } from '@/lib/models/AuditLog';
import { SettingsSchema } from '@/lib/validations';
import { getClientIp } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectToDatabase();

    let settings: any = await Settings.findOne().lean();
    if (!settings) {
      const created = await Settings.create({
        instagramUrl: 'https://www.instagram.com/shutterscape_gcu',
        whatsappUrl: 'https://chat.whatsapp.com/Hs71BicR1Xj3PmOyPJ5wdc?s=sw&p=a&mlu=4&ilr=4',
        email: 'shutterscape@gcuniversity.ac.in',
        address: 'Girijananda Chowdhury University, Azara, Guwahati, Assam 781017',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.7915570530733!2d91.61936107609825!3d26.133231792965684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a452efbb07f87%3A0xe543cbe26b52a514!2sGirijananda%20Chowdhury%20University!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin',
        heroTitle: 'Every frame tells a story.',
        heroSubtitle: 'We are ShutterScape. The eyes of GCU.',
        heroImages: [],
        footerTagline: 'End Credits — Capturing the fleeting moments of GCU since 2023.',
        stats: { members: 65, events: 18, photos: 1200 },
      });
      settings = created.toObject();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const ip = getClientIp(request);
    const body = await request.json().catch(() => null);

    const validation = SettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: validation.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(validation.data);
    } else {
      Object.assign(settings, validation.data);
      await settings.save();
    }

    await AuditLog.create({
      adminId: new mongoose.Types.ObjectId(session.id),
      action: 'update',
      entity: 'Settings',
      entityId: settings._id.toString(),
      details: { action: 'updated_site_settings' },
      ipAddress: ip,
    });

    revalidatePath('/', 'page');
    revalidatePath('/activities', 'page');
    revalidatePath('/gallery', 'page');
    revalidatePath('/about', 'page');

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    if (error?.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
