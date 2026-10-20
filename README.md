# ShutterScape — Photography Club of Girijananda Chowdhury University (GCU)

"Every frame tells a story."

A cinematic, story-driven web application built for the photography society of GCU. Designed using camera and darkroom UI metaphors: smooth aperture reveals, developing photos on scroll, 35mm film tracks, and shutter-blink transitions.

---

## Technical Architecture

- **Framework**: Next.js 15 (App Router, Server Components, ISR)
- **Styling**: Tailwind CSS with custom camera tokens (Amber #F59E0B, Safelight #B3261E, Charcoal #121214)
- **Typography**: Playfair Display, Inter, JetBrains Mono
- **Motion**: GSAP 3 (ScrollTrigger), Lenis Smooth Scroll, Framer Motion
- **Database**: MongoDB Atlas with Mongoose
- **Media Engine**: Cloudinary (signed uploads, `f_auto`, `q_auto`, responsive presets)
- **Auth & Security**: Custom JWT via `jose`, bcrypt password hashing, 15-minute brute-force lockout, HTTP-only cookies, sanitize-html
- **Editor**: Tiptap Rich Text Editor

---

## Getting Started

### 1. Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas URI)
- Cloudinary account

### 2. Installation

```bash
npm install
