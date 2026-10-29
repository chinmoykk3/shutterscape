// File: app/page.tsx
import Image from 'next/image';
import { connectDB } from '@/lib/db';
import { getPublicSettings } from '@/lib/settings';
import {
  StoryScene,
  GalleryItem,
  Activity,
  Member,
  IStoryScene,
  IGalleryItem,
  IActivity,
  IMember,
} from '@/lib/models';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Countdown } from '@/components/ui/Countdown';
import { ImageCard } from '@/components/ui/ImageCard';
import { CameraReadout } from '@/components/story/CameraReadout';
import { QuickFactsStrip } from '@/components/story/QuickFactsStrip';
import { PhotoOfTheWeek } from '@/components/story/PhotoOfTheWeek';
import { HomepageStoryEngine } from '@/components/story/HomepageStoryEngine';
import { HeroFloatingGallery } from '@/components/story/HeroFloatingGallery';
import { InstagramIcon } from '@/components/ui/InstagramIcon';

export const revalidate = 60; // ISR cache every 60s

async function getHomeData() {
  try {
    await connectDB();
    const nowTimestamp = Date.now();

    const [settings, storyScenes, galleryItems, photoOfTheWeekDoc, activities, members] =
      await Promise.all([
        getPublicSettings(),
        StoryScene.find({ status: 'active' }).sort({ order: 1 }).lean<IStoryScene[]>(),
        GalleryItem.find({ status: 'published' })
          .sort({ featured: -1, createdAt: -1 })
          .limit(20)
          .lean<IGalleryItem[]>(),
        GalleryItem.findOne({ photoOfTheWeek: true, status: 'published' }).lean<IGalleryItem>(),
        Activity.find({ status: 'published' }).sort({ date: 1 }).limit(4).lean<IActivity[]>(),
        Member.find({ status: 'active' }).sort({ order: 1 }).lean<IMember[]>(),
      ]);

    const parsedActivities = JSON.parse(JSON.stringify(activities));
    const nextUpcomingEvent =
      parsedActivities.find((a: IActivity) => new Date(a.date).getTime() > nowTimestamp) ||
      null;

    // Pick photo of the week or fallback to highest featured gallery item
    const parsedGalleryItems = JSON.parse(JSON.stringify(galleryItems));
    const photoOfTheWeek = photoOfTheWeekDoc
      ? JSON.parse(JSON.stringify(photoOfTheWeekDoc))
      : parsedGalleryItems.length > 0
      ? parsedGalleryItems[0]
      : null;

    return {
      settings,
      storyScenes: JSON.parse(JSON.stringify(storyScenes)),
      galleryItems: parsedGalleryItems,
      photoOfTheWeek,
      activities: parsedActivities,
      nextUpcomingEvent,
      members: JSON.parse(JSON.stringify(members)),
    };
  } catch (error) {
    console.error('Failed to load homepage data:', error);
    const settings = await getPublicSettings();
    return {
      settings,
      storyScenes: [],
      galleryItems: [],
      photoOfTheWeek: null,
      activities: [],
      nextUpcomingEvent: null,
      members: [],
    };
  }
}

export default async function HomePage() {
  const {
    settings,
    storyScenes,
    galleryItems,
    photoOfTheWeek,
    activities,
    nextUpcomingEvent,
    members,
  } = await getHomeData();

  return (
    <div className="relative flex flex-col w-full">
      {/* =========================================================================
          HERO FRAME: Viewfinder HUD, Aperture Reveal, Analog Telemetry
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-theme-canvas text-theme-ink transition-colors duration-300">
        {/* Warm Ambient Golden Hour & Safelight Gradients */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[500px] rounded-full bg-amber-400/15 dark:bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[550px] h-[550px] rounded-full bg-rose-400/10 dark:bg-rose-600/15 blur-[150px] pointer-events-none" />

        {/* Architectural Optical Ground-Glass Lens Calibration Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          {/* Outer Reticle Ring */}
          <div className="w-[600px] h-[600px] sm:w-[920px] sm:h-[920px] rounded-full border border-amber-500/15 dark:border-amber/10 animate-pulse duration-1000" />
          {/* Mid Dashed Helicoid Ring */}
          <div className="absolute w-[440px] h-[440px] sm:w-[680px] sm:h-[680px] rounded-full border border-stone-300/50 dark:border-white/5 border-dashed" />
          {/* Inner Ground-Glass Optical Ring */}
          <div className="absolute w-[280px] h-[280px] sm:w-[460px] sm:h-[460px] rounded-full border border-stone-300/40 dark:border-white/5" />
          
          {/* Crosshair Rangefinder Axis Guides */}
          <div className="absolute w-[92%] max-w-6xl h-[1px] bg-gradient-to-r from-transparent via-stone-300/50 dark:via-white/10 to-transparent" />
          <div className="absolute h-[80%] max-h-[720px] w-[1px] bg-gradient-to-b from-transparent via-stone-300/50 dark:via-white/10 to-transparent" />

          {/* Technical Telemetry Watermarks at Optical Poles */}
          <div className="absolute top-[16%] font-mono text-[9px] tracking-[0.3em] uppercase text-stone-400 dark:text-offwhite-dim/40">
            OPTICAL GROUND GLASS // 35MM ARCHIVAL FRAME
          </div>
          <div className="absolute bottom-[16%] font-mono text-[9px] tracking-[0.3em] uppercase text-amber-700/60 dark:text-amber/40">
            AF-ACTIVE • 50MM F/1.4 GM • ∞
          </div>
        </div>

        {/* Viewfinder Perimeter Corner Reticles */}
        <div className="pointer-events-none absolute inset-6 sm:inset-12 hidden md:block select-none opacity-40 dark:opacity-30">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-600 dark:border-amber" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-600 dark:border-amber" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-600 dark:border-amber" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-600 dark:border-amber" />
        </div>

        {/* Ambient Floating 35mm Negatives Parallax Constellation */}
        <HeroFloatingGallery items={galleryItems} />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-8">
          {/* Top Camera Readout Meter */}
          <div className="flex flex-col items-center gap-3">
            <Badge variant="amber">
              {'● EXP. 01/36 // LIVE SENSOR'}
            </Badge>
            <CameraReadout
              aperture="f/1.4"
              shutter="1/1000s"
              iso="ISO 400"
              mode="MANUAL"
            />
          </div>

          {/* Master Editorial Headline */}
          <div className="space-y-4 max-w-4xl px-2 sm:px-0">
            <h1 className="font-title text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-offwhite tracking-tight leading-[1.1] sm:leading-[1.08]">
              {settings.heroTitle}
            </h1>
            <p className="font-mono text-xs sm:text-sm md:text-base lg:text-lg text-amber-600 dark:text-amber tracking-[0.15em] sm:tracking-[0.2em] uppercase font-semibold">
              {`// ${settings.heroSubtitle}`}
            </p>
          </div>

          {/* Editorial Hook */}
          <p className="font-body text-sm sm:text-base md:text-lg text-slate-600 dark:text-offwhite-muted max-w-2xl leading-relaxed px-2 sm:px-0">
            The official visual arts and photography society of Girijananda Chowdhury University.
            Archiving campus history through 35mm film aesthetics, silver halide chemistry, and modern digital observation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Button href="#story-scenes" variant="primary" size="lg">
              Begin Story Journey
            </Button>
            <Button
              href={settings.whatsappUrl}
              variant="secondary"
              size="lg"
              isExternal
            >
              Join Club Guild
            </Button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK FACTS STRIP: Analog specs, roll counts, darkroom telemetry
          ========================================================================= */}
      <QuickFactsStrip stats={settings.stats} />

      {/* =========================================================================
          CHAPTER 1: THE STORY ENGINE (Scenes 0 to 5, Contact Sheet Jump)
          ========================================================================= */}
      <section id="story-scenes" className="relative w-full bg-theme-canvas border-t border-theme-border transition-colors duration-300">
        <HomepageStoryEngine
          storyScenes={storyScenes}
          featuredGallery={galleryItems}
          nextUpcomingEvent={nextUpcomingEvent}
          whatsappUrl={settings.whatsappUrl}
          instagramUrl={settings.instagramUrl}
        />
      </section>

      {/* =========================================================================
          PHOTO OF THE WEEK: Curatorial Spotlight in Safelight Ambience
          ========================================================================= */}
      {photoOfTheWeek && <PhotoOfTheWeek item={photoOfTheWeek} />}

      {/* =========================================================================
          CHAPTER 2: GALLERY & EXHIBITION ROOMS
          ========================================================================= */}
      <section id="gallery-rooms" className="relative py-24 sm:py-32 bg-theme-canvas border-t border-theme-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <SectionHeading
              chapter="CHAPTER 02 // EXHIBITION ROOMS"
              title="Frames from GCU Society"
              subtitle="Browse the permanent collection capturing architectural geometry, riverfront mist, street shadows, and academic life."
            />
            <div className="flex items-center gap-3">
              <Button href="/gallery" variant="outline" size="sm">
                Examine All Rooms
              </Button>
            </div>
          </div>

          {/* Exhibition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item: IGalleryItem) => (
              <ImageCard
                key={item._id?.toString() || item.caption}
                src={item.image.url}
                alt={item.caption}
                aspectRatio="landscape"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-amber tracking-widest">
                      {item.room}
                    </span>
                    {item.instagramUrl && (
                      <a
                        href={item.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-mono text-pink-400 hover:text-pink-300 transition-colors pointer-events-auto"
                        title="View post on @shutterscape_gcu"
                      >
                        <InstagramIcon className="w-3 h-3" />
                        <span>Instagram</span>
                      </a>
                    )}
                  </div>
                  <h3 className="font-title text-lg font-bold text-offwhite line-clamp-1">
                    {item.caption}
                  </h3>
                  {item.photographer && (
                    <p className="font-mono text-[11px] text-offwhite-dim">
                      Photographer: {item.photographer}
                    </p>
                  )}
                  {item.cameraInfo && (
                    <p className="font-mono text-[10px] text-amber/80 truncate">
                      {item.cameraInfo}
                    </p>
                  )}
                </div>
              </ImageCard>
            ))}
          </div>

          {/* Instagram Society Dispatch Bar */}
          <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-charcoal via-[#14121a] to-charcoal border border-pink-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber via-pink-500 to-purple-600 p-[2px] shrink-0 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center text-pink-400">
                  <InstagramIcon className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-pink-400 font-bold">
                    Official Instagram Feed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-offwhite-dim">LIVE DISPATCH</span>
                </div>
                <h3 className="font-title text-xl sm:text-2xl font-bold text-offwhite">
                  @shutterscape_gcu
                </h3>
                <p className="font-body text-xs sm:text-sm text-offwhite-muted max-w-xl">
                  Daily visual stories, student exhibition highlights, photowalk reels, and announcements directly from Girijananda Chowdhury University.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                href={settings.instagramUrl || "https://www.instagram.com/shutterscape_gcu"}
                isExternal
                variant="primary"
                size="md"
                className="gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-none shadow-[0_0_25px_rgba(236,72,153,0.35)]"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Follow on Instagram</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 3: ACTIVITIES & LIVE PHOTOWALKS (with Intervalometer Countdown)
          ========================================================================= */}
      <section id="activities" className="relative py-24 sm:py-32 bg-theme-canvas border-t border-theme-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            chapter="CHAPTER 03 // FIELD EXPEDITIONS"
            title="Photowalks & Workshops"
            subtitle="We regularly step outside the classroom to explore environmental light, historical darkroom processes, and documentary storytelling."
            className="mb-14"
          />

          {/* Next upcoming event featured spotlight */}
          {nextUpcomingEvent && (
            <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-charcoal border border-amber/40 shadow-[0_0_50px_rgba(245,158,11,0.08)] flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="space-y-4 max-w-xl">
                <Badge variant="amber">
                  {'● NEXT SCHEDULED PHOTOWALK'}
                </Badge>
                <h3 className="font-title text-2xl sm:text-3xl font-bold text-offwhite">
                  {nextUpcomingEvent.title}
                </h3>
                {nextUpcomingEvent.venue && (
                  <p className="font-mono text-xs text-offwhite-dim flex items-center gap-2">
                    <span className="text-amber">VENUE:</span> {nextUpcomingEvent.venue}
                  </p>
                )}
                {nextUpcomingEvent.pullQuote && (
                  <blockquote className="font-title italic text-sm text-offwhite-muted border-l-2 border-amber pl-3">
                    &ldquo;{nextUpcomingEvent.pullQuote}&rdquo;
                  </blockquote>
                )}
              </div>

              {/* Countdown Component */}
              <div className="flex flex-col space-y-4">
                <Countdown targetDate={nextUpcomingEvent.date} />
                {nextUpcomingEvent.registrationLink && (
                  <Button
                    href={nextUpcomingEvent.registrationLink}
                    variant="primary"
                    size="md"
                    isExternal
                  >
                    Register for Expedition
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Activity List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((act: IActivity) => (
              <article
                key={act.slug}
                className="flex flex-col rounded-2xl bg-charcoal border border-charcoal-border p-6 space-y-4 hover:border-offwhite/30 transition-colors"
              >
                {act.image?.url && (
                  <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-charcoal-border">
                    <Image
                      src={act.image.url}
                      alt={act.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-amber">
                    <span>{new Date(act.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {act.venue && <span className="text-offwhite-dim truncate max-w-[200px]">{act.venue}</span>}
                  </div>
                  <h4 className="font-title text-xl font-bold text-offwhite">
                    {act.title}
                  </h4>
                  <div
                    className="font-body text-xs text-offwhite-muted leading-relaxed line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: act.descriptionHtml }}
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 4: THE COLLECTIVE (Faculty, Core, Alumni)
          ========================================================================= */}
      <section id="members" className="relative py-24 sm:py-32 bg-theme-canvas border-t border-theme-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            chapter="CHAPTER 04 // THE COLLECTIVE"
            title="The Eyes Behind the Shutter"
            subtitle="Our society brings together diverse perspectives across university departments, unified by a love for visual composition."
            align="center"
            className="mb-16"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {members.map((member: IMember) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-charcoal border border-charcoal-border hover:border-amber/40 transition-colors group"
              >
                <div className="relative w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-charcoal-border group-hover:border-amber transition-colors">
                  <Image
                    src={member.image.url}
                    alt={member.name}
                    fill
                    sizes="112px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] tracking-widest text-amber uppercase">
                    {`${member.type} // ${member.batch || 'GCU'}`}
                  </span>
                  <h4 className="font-title text-lg font-bold text-offwhite group-hover:text-amber transition-colors">
                    {member.name}
                  </h4>
                  <p className="font-mono text-xs text-offwhite-dim">
                    {member.role}
                  </p>
                </div>

                {member.quote && (
                  <p className="font-title italic text-xs text-offwhite-muted mt-3 pt-3 border-t border-charcoal-border/60">
                    &ldquo;{member.quote}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 5: CONTACT & DISPATCH
          ========================================================================= */}
      <section id="contact" className="relative py-24 sm:py-32 bg-theme-canvas border-t border-theme-border transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <SectionHeading
                chapter="CHAPTER 05 // DISPATCH ROOM"
                title="Connect with ShutterScape"
                subtitle="Whether you shoot with a vintage analog rangefinder, modern mirrorless body, or smartphone camera—our doors and darkroom are always open."
              />

              <div className="space-y-4 font-mono text-xs text-offwhite-dim">
                <div className="flex items-center gap-3">
                  <span className="text-amber">LOCATION:</span>
                  <span className="text-offwhite">{settings.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber">INQUIRIES:</span>
                  <a href={`mailto:${settings.email}`} className="text-offwhite hover:underline">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  href={settings.whatsappUrl}
                  variant="primary"
                  size="md"
                  isExternal
                >
                  Join WhatsApp Community
                </Button>
                <Button
                  href={settings.instagramUrl}
                  variant="secondary"
                  size="md"
                  isExternal
                >
                  Follow on Instagram
                </Button>
              </div>
            </div>

            {/* Embedded University Map Frame with Viewfinder border */}
            <div className="relative rounded-3xl overflow-hidden border border-charcoal-border shadow-2xl h-[360px] bg-charcoal">
              <iframe
                title="Girijananda Chowdhury University Location"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded bg-black/80 font-mono text-[10px] text-amber border border-amber/30">
                COORDINATES: 26.1332° N, 91.6194° E
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
