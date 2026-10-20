# ShutterScape — Photography Club of Girijananda Chowdhury University (GCU)

> *"Every frame tells a story."*

**ShutterScape** is the official web application and living visual archive of the Photography Club of **Girijananda Chowdhury University (GCU)**, Guwahati, Assam.

Engineered with authentic camera mechanics and darkroom metaphors: **aperture iris opens**, **6-scene focus-pull storytelling**, **35mm film strips with sprockets**, **develop-on-scroll chemical prints**, **switchable safelight darkroom loupe tables**, and an executive administrative studio ("The Editing Room").

---

## 🎞️ Technical Architecture & Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19 Server Components, Incremental Static Regeneration `revalidate = 60`)
- **Styling**: Tailwind CSS with custom analog camera tokens:
  - `Amber (#F59E0B)` — Golden hour & viewfinder metering
  - `Safelight (#B3261E)` — 650nm darkroom chemical safety light
  - `Charcoal (#121214)` — Matte camera chassis
  - `Offwhite (#F4F1EA)` — Archival silver gelatin paper
- **Typography**: Next/Font with zero layout shift:
  - *Playfair Display* (Editorial headings & pull quotes)
  - *Inter* (UI readability & labels)
  - *JetBrains Mono* (Camera EXIF telemetry, shutter speed, aperture, ISO)
- **Motion & Cinematic Physics**:
  - [GSAP 3](https://greensock.com/gsap/) with `ScrollTrigger` (Desktop 6-scene pinned scrubbing timeline)
  - [Lenis](https://github.com/studio-freight/lenis) (Smooth momentum scrolling synced with GSAP ticker)
  - Native CSS Multi-Column Masonry with `IntersectionObserver` develop-on-scroll filters
  - `prefers-reduced-motion` compliance across all engines
- **Database & Storage**:
  - [MongoDB Atlas](https://www.mongodb.com/atlas) with Mongoose ODM
  - [Cloudinary](https://cloudinary.com/) (Direct signed image uploads with `f_auto`, `q_auto`, responsive breakpoints, and darkroom blur placeholders)
- **Security & Authentication**:
  - JWT using `jose` with `HS256` in strict `HttpOnly`, `SameSite=Lax`, `Secure` cookies
  - `bcrypt` (12 rounds) salted hashing
  - In-memory failed attempt counter with 15-minute brute-force lockout
  - Origin verification helper on mutation routes
  - Strict Content Security Policy (CSP), anti-clickjacking (`X-Frame-Options: DENY`), and XSS sanitization via `sanitize-html`
- **Content Management**:
  - Tiptap Rich-Text Editor for field reports and exhibition descriptions
  - Full CRUD for Activities, Gallery Exposures, Members, Story Scenes, and Site Settings

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **MongoDB**: A free MongoDB Atlas cluster URI (or local MongoDB daemon)
- **Cloudinary**: A free Cloudinary account for photo hosting

### 2. Clone & Install

```bash
git clone https://github.com/chinmoykk3/shutterscape.git
cd shutterscape
npm install
```

### 3. Environment Variables Configuration

Create a file named `.env.local` in the project root:

```env
# -----------------------------------------------------------------------------
# CORE APPLICATION ENVIRONMENT
# -----------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development

# -----------------------------------------------------------------------------
# MONGODB DATABASE
# -----------------------------------------------------------------------------
# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/shutterscape?retryWrites=true&w=majority

# -----------------------------------------------------------------------------
# AUTHENTICATION & SECURITY
# -----------------------------------------------------------------------------
# Generate a strong 64-character random string (e.g. openssl rand -base64 48)
JWT_SECRET=super_secret_shutterscape_jwt_key_change_in_production_min_32_chars
COOKIE_DOMAIN=localhost

# -----------------------------------------------------------------------------
# CLOUDINARY MEDIA ENGINE
# -----------------------------------------------------------------------------
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# -----------------------------------------------------------------------------
# INITIAL SEED ADMIN (Optional fallback for automated scripts)
# -----------------------------------------------------------------------------
INITIAL_ADMIN_EMAIL=admin@shutterscape.gcuniversity.ac.in
INITIAL_ADMIN_PASSWORD=ShutterScape@2026!
```

### 4. Seed Initial Data

Populate the database with initial GCU club settings, story scenes, activities, gallery photos, and founding team members:

```bash
npm run seed
```

### 5. Create an Admin Account

Generate an administrative account via the interactive secure CLI (hashes password with bcrypt cost factor 12):

```bash
npm run create-admin
```

Follow the command-line prompts to enter:
1. Admin Email (e.g., `admin@shutterscape.gcuniversity.ac.in`)
2. Admin Password (minimum 8 characters)
3. Admin Display Name (e.g., `Head of Curation`)

### 6. Run the Development Server

```bash
npm run dev
```

Visit:
- **Public Portal**: `http://localhost:3000`
- **Activities Roll**: `http://localhost:3000/activities`
- **Darkroom Light Table**: `http://localhost:3000/gallery`
- **Behind The Lens**: `http://localhost:3000/about`
- **Admin Studio Login**: `http://localhost:3000/admin/login`

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub: `git push origin main`.
2. Open the [Vercel Dashboard](https://vercel.com) and click **"New Project"**.
3. Import the `shutterscape` repository.
4. Framework Preset will automatically detect **Next.js**.
5. Add the following **Environment Variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SITE_URL`: `https://your-production-domain.com` (or your `.vercel.app` URL)
   - `MONGODB_URI`: Your production MongoDB Atlas connection string (make sure Atlas Network Access allows `0.0.0.0/0` or Vercel IPs)
   - `JWT_SECRET`: A high-entropy 64-character random string
   - `COOKIE_DOMAIN`: Leave empty or set to your production apex domain
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Cloudinary API secret
6. Click **Deploy**. Vercel will build and deploy the app with static generation and ISR edge caching.

---

## 📋 Comprehensive QA Checklist

Before going live or submitting milestones, verify each test case:

### 1. Viewport & Responsive Design
- [ ] **Mobile (360px – 480px)**:
  - Header hamburger drawer opens/closes smoothly, locks body scroll, traps Escape.
  - Horizontal film reel on homepage scrolls smoothly via swipe with zero horizontal document blowout.
  - Camera readout HUD is tucked away on small screens to avoid obstructing the film counter.
  - Darkroom masonry flows cleanly into a single vertical column.
  - About page 35mm negative cards stack cleanly with visible frame numbers.
- [ ] **Tablet (768px)**:
  - Darkroom grid renders in balanced 2 columns (`sm:columns-2`).
  - Activities grid renders in 2 columns.
- [ ] **Desktop (1024px – 1440px+)**:
  - Homepage runs the pinned GSAP ScrollTrigger timeline:
    - Scene 1: Iris open mask expands to reveal hero.
    - Scene 2: Focus pull animates from blurred to sharp with green AF lock.
    - Scene 3: Viewfinder reticle brackets expand.
    - Scene 4: Continuous horizontal film strip scrubs with Frame counter.
    - Scene 5: Unexposed frame with live countdown develops.
    - Scene 6: Xenon strobe flash pulse triggers the epilogue CTA.
  - Darkroom renders in 3 to 4 balanced masonry columns.

### 2. Accessibility & Reduced Motion
- [ ] Turn on `prefers-reduced-motion: reduce` in Windows / macOS Settings:
  - Homepage automatically hides the pinned GSAP canvas and renders the clean, static, accessible card flow.
  - Shutter-blink page transition curtain is completely disabled.
  - Initial visit shutter click loader is bypassed.
  - Darkroom undeveloped images render crisp immediately with zero blur or filter flicker.
- [ ] Tab navigation: "Skip to main story" link appears on first tab and jumps straight to `#main-story-content`.
- [ ] Lightbox modal traps keyboard focus, closes on `Escape`, navigates via `ArrowLeft` / `ArrowRight`.

### 3. Authentication & Security
- [ ] Accessing `/admin/dashboard` while unauthenticated redirects to `/admin/login`.
- [ ] 5 consecutive invalid passwords locks the account for 15 minutes (`429 Too Many Requests`).
- [ ] Successful login sets an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
- [ ] Clicking "Sign Out" calls `/api/admin/logout` and immediately clears the cookie.
- [ ] Cross-site POST requests without valid origin are rejected with `403 Forbidden`.

### 4. Admin CRUD Operations ("The Editing Room")
- [ ] **Activities**: Create new activity with Tiptap formatting, upload banner image, publish/draft toggle, slug uniqueness check, edit, and delete.
- [ ] **Gallery**: Add exposure, assign room category (Monochrome, Street, Landscape, etc.), camera EXIF values, featured toggle, and delete.
- [ ] **Members**: Add student/faculty member, assign role, order priority, and negative archive status.
- [ ] **Scenes**: Edit homepage story scenes headlines and text.
- [ ] **Settings**: Update WhatsApp invite URL, Instagram handle, and contact email.
- [ ] **Audit Logs**: Verify that every create/update/delete action logs user email, action name, and timestamp.

### 5. Revalidation & Search Engine Optimization
- [ ] Public routes reflect updates after 60 seconds (ISR `revalidate = 60`).
- [ ] `http://localhost:3000/sitemap.xml` dynamically lists `/`, `/about`, `/activities`, `/gallery`, and all dynamic `/activities/[slug]` paths.
- [ ] `http://localhost:3000/robots.txt` disallows `/admin/` and points to the sitemap.
- [ ] Page source contains valid Open Graph, Twitter cards, and `Organization` JSON-LD schema.
- [ ] Single activity page contains valid `Event` JSON-LD schema.
- [ ] 404 route (`/non-existent-page`) renders the "Lost Frame / Overexposed Negative" darkroom screen.
- [ ] Error boundary (`app/error.tsx`) renders the "Shutter Jammed / Optical Fault" screen with retry button.

---

## 🛠️ Things You Must Replace Manually Before Launch

The project is pre-configured with realistic demo data, Unsplash placeholders, and club member structures. Replace the following items with your official GCU assets before production launch:

1. **Club Logos & Favicons**:
   - Place official high-res PNG/SVG club logos in `/public/logo.png` and update `/app/favicon.ico`.
   - Update Open Graph banner image in `/public/og-image.jpg`.
2. **Real Photography Assets**:
   - In Cloudinary, create a folder for `shutterscape`.
   - Replace demo Unsplash URLs in the Admin Gallery (`/admin/gallery`) with original high-resolution photographs taken by GCU students.
3. **Faculty Mentors & Team Details**:
   - In `/app/about/page.tsx` and the Members collection in the Admin panel (`/admin/members`):
     - Update real faculty advisor names, designations, and department affiliations.
     - Upload authentic photos of executive members and alumni in "The Negatives".
4. **Google Maps Embed / Campus Venue**:
   - In `/components/layout/Footer.tsx` and `/app/about/page.tsx`, verify the physical address:
     `Girijananda Chowdhury University, Azara, Guwahati, Assam 781017`.
   - If embedding a Google Map iframe, replace the demo coordinate embed URL with the official GCU campus pin.
5. **Production WhatsApp & Social Links**:
   - In the Admin Settings panel (`/admin/settings`), set the official:
     - WhatsApp Community/Guild Invite Link
     - Instagram Profile Handle (`https://instagram.com/your_handle`)
     - Club contact email
6. **Production Domain & MongoDB**:
   - Point your official domain (e.g., `shutterscape.gcuniversity.ac.in`) to Vercel DNS.
   - Update `NEXT_PUBLIC_SITE_URL` in Vercel environment variables.
   - Ensure your production MongoDB Atlas cluster has a strong password, IP whitelist, and regular automated snapshots.

---

## 🤝 Maintenance & Credits

- **Club**: ShutterScape — Photography Club of Girijananda Chowdhury University (GCU)
- **Web Platform Engineered & Maintained by**: [Codénix (GCU Coding Club)](https://codingclub.gcuniversity.ac.in)
- **License**: MIT
