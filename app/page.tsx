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

export const revalidate = 60; // ISR cache every 60s

async function getHomeData() {
  try {
    await connectDB();
    const nowTimestamp = Date.now();

    const [settings, storyScenes, galleryItems, activities, members] = await Promise.all([
      getPublicSettings(),
      StoryScene.find({ status: 'active' }).sort({ order: 1 }).lean<IStoryScene[]>(),
      GalleryItem.find({ status: 'published' }).sort({ featured: -1, createdAt: -1 }).limit(8).lean<IGalleryItem[]>(),
      Activity.find({ status: 'published' }).sort({ date: 1 }).limit(3).lean<IActivity[]>(),
      Member.find({ status: 'active' }).sort({ order: 1 }).lean<IMember[]>(),
    ]);

    const parsedActivities = JSON.parse(JSON.stringify(activities));
    const nextUpcomingEvent = parsedActivities.find(
      (a: IActivity) => new Date(a.date).getTime() > nowTimestamp
    ) || null;

    return {
      settings,
      storyScenes: JSON.parse(JSON.stringify(storyScenes)),
      galleryItems: JSON.parse(JSON.stringify(galleryItems)),
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
      activities: [],
      nextUpcomingEvent: null,
      members: [],
    };
  }
}

export default async function HomePage() {
  const { settings, storyScenes, galleryItems, activities, nextUpcomingEvent, members } = await getHomeData();

  return (
    <div className="relative flex flex-col w-full overflow-hidden">
      {/* =========================================================================
          HERO FRAME: Viewfinder HUD, Aperture Reveal, Analog Telemetry
          ========================================================================= */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Ambient Light Leak Gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[500px] rounded-full light-leak-amber blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full light-leak-safelight blur-[150px] pointer-events-none" />

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
          <div className="space-y-4 max-w-4xl">
            <h1 className="font-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-offwhite tracking-tight leading-[1.08]">
              {settings.heroTitle}
            </h1>
            <p className="font-mono text-sm sm:text-base md:text-lg text-amber tracking-[0.2em] uppercase font-medium">
              {`// ${settings.heroSubtitle}`}
            </p>
          </div>

          {/* Editorial Hook */}
          <p className="font-body text-base sm:text-lg text-offwhite-muted max-w-2xl leading-relaxed">
            The official visual arts and photography society of Girijananda Chowdhury University.
            Archiving campus history through 35mm film aesthetics, silver halide chemistry, and modern digital observation.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button href="#gallery-rooms" variant="primary" size="lg">
              Explore Exhibitions
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

          {/* Live Society Statistics Bar */}
          <div className="pt-10 w-full max-w-3xl grid grid-cols-3 gap-3 sm:gap-6 border-t border-charcoal-border/70">
            <div className="flex flex-col items-center p-3 rounded-xl bg-charcoal/50 border border-charcoal-border/60">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-amber">
                {settings.stats.members}+
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-offwhite-dim tracking-widest uppercase mt-0.5">
                Active Members
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-charcoal/50 border border-charcoal-border/60">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-offwhite">
                {settings.stats.events}
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-offwhite-dim tracking-widest uppercase mt-0.5">
                Exhibitions & Walks
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-charcoal/50 border border-charcoal-border/60">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-offwhite">
                {settings.stats.photos}+
              </span>
              <span className="font-mono text-[10px] sm:text-xs text-offwhite-dim tracking-widest uppercase mt-0.5">
                Negatives Developed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 1: THE STORY SCENES (Sequential Visual Narrative)
          ========================================================================= */}
      <section id="story-scenes" className="relative py-24 sm:py-32 bg-[#09090b] border-t border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            chapter="CHAPTER 01 // VISUAL NARRATIVE"
            title="Stories in Latent Light"
            subtitle="The 3-Act Exposure Process: From the split-second click of the mirror to the slow chemical birth inside the darkroom bath—each photograph is a testament to frozen time."
            align="center"
            className="mb-16"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {storyScenes.map((scene: IStoryScene, idx: number) => (
              <div
                key={scene.key || idx}
                className="relative flex flex-col rounded-2xl bg-charcoal border border-charcoal-border overflow-hidden p-6 space-y-4 hover:border-amber/50 transition-all duration-300 group"
              >
                {/* Scene Image Frame */}
                {scene.image?.url && (
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-charcoal-border">
                    <Image
                      src={scene.image.url}
                      alt={scene.headline}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-amber border border-amber/30">
                      ACT 0{scene.order || idx + 1}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-title text-xl font-bold text-offwhite group-hover:text-amber transition-colors">
                    {scene.headline}
                  </h3>
                  <p className="font-body text-sm text-offwhite-muted leading-relaxed">
                    {scene.bodyText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 2: GALLERY & EXHIBITION ROOMS
          ========================================================================= */}
      <section id="gallery-rooms" className="relative py-24 sm:py-32 bg-black border-t border-charcoal-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <SectionHeading
              chapter="CHAPTER 02 // EXHIBITION ROOMS"
              title="Frames from GCU Society"
              subtitle="Browse the permanent collection capturing architectural geometry, riverfront mist, street shadows, and academic life."
            />
            <div className="flex items-center gap-3">
              <Button href="/#contact" variant="outline" size="sm">
                Submit Negative
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
                  <span className="font-mono text-[10px] uppercase text-amber tracking-widest">
                    {item.room}
                  </span>
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
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 3: ACTIVITIES & LIVE PHOTOWALKS (with Intervalometer Countdown)
          ========================================================================= */}
      <section id="activities" className="relative py-24 sm:py-32 bg-[#09090b] border-t border-charcoal-border">
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
      <section id="members" className="relative py-24 sm:py-32 bg-black border-t border-charcoal-border">
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
      <section id="contact" className="relative py-24 sm:py-32 bg-[#09090b] border-t border-charcoal-border">
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
