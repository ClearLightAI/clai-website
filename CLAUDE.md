# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ClearLight AI company website — a marketing/landing page for clearlightai.com. Designed in Google Stitch, refined and deployed via Netlify.

**Primary goal:** Convert business owners (entrepreneurs, SMB owners, coaches) into free audit completions at audit.clearlightai.com or discovery call bookings.

**Hero service:** The AI Readiness Audit — a paid, structured business audit that produces a phased AI implementation roadmap.

## Tech Stack

- **Framework:** Astro 6 (static output)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (NOT @astrojs/tailwind)
- **Adapter:** `@astrojs/netlify` v7
- **Build:** `npm run build` → outputs to `dist/`
- **Dev:** `npm run dev` → localhost:3333

## Project Status

Live on Netlify. The homepage (June 2026 redesign) brings the video above the fold and applies ClearLight **bento** theming throughout:

- **`HeroVideo`** — centered title up top (`What's the ROI on AI in your business?`), then a two-column row: a self-hosted video in a glass bento tile (left) + the "Take the same process / 9-figure entrepreneurs run." CTA copy + gold button (right). Click-to-play (no autoplay); the player swaps in a real `<video>` on click. Video is served from `public/video/` (see Video assets below).
- **`ServicesBento`** — 3 glass tiles (hover-lift, accent strips, numbered labels); flagship audit card gets a gold border + pill. Tablet (≤860px) = 2-col with flagship spanning full width; ≤560px = single column.
- **`FooterBento`** — final CTA as a gradient bento tile.
- Starfield canvas (cursor-following purple glow) + ElevenLabs Audit Wizard floating widget (pinned to v2 branch via `branch-id` — dashboard routing % does NOT apply to embeds).
- The old `Hero`, `Services`, `Footer`, `VideoCtaPill` components were removed when this shipped. `Proof.astro` remains but is still hidden (`<!-- <Proof /> -->`) pending updated featured businesses.

**`/book`** — booking landing page: Russell's headshot + brief header + his Calendly inline widget (`calendly.com/russellprice/clearlightai`) embedded in a glass bento tile, consultants-toolkit style. Not yet linked from the site nav/footer.

### CTA buttons are GOLD site-wide
All primary CTA buttons (nav, hero, footer) use the canonical gold treatment (`#e5b673` bg, navy `#13123b` text) — migrated from the old purple gradient to match the bento/brand system. The hero headline's purple *gradient text* ("in your business?") stays purple — that's a text treatment, not a button.

### Video assets
- Served web video: `public/video/2026_june_landing.mp4` (H.264/AAC, faststart, ~14MB). **Transcode source `.mov` masters with ffmpeg** — the raw HEVC/PCM `.mov` (in gitignored `videos/`) won't play in browsers and is >100MB (GitHub rejects). Preset: `-c:v libx264 -crf 23 -preset medium -movflags +faststart -c:a aac -b:a 128k`.
- Poster/thumbnail: `public/video/russell-poster.jpg` (a frame pulled from the video, 1280×720). It's a separate still — re-trimming the video does NOT require regenerating the poster.
- `videos/` (raw masters) is gitignored; only the transcoded `public/video/*.mp4` is committed.

## Hosting & Deployment

- **Host:** Netlify (auto-deploys from `main` branch)
- **Repo:** github.com/ClearLightAI/clai-website (public)
- **Domain:** clearlightai.com (DNS managed via Cloudflare)
- **Publish directory:** `dist` (Astro default)
- **Internal routes:** `/` (homepage), `/book` (Calendly booking page)
- **Key external URLs:**
  - `audit.clearlightai.com` — Cloudflare 301 → ElevenLabs talk-to page (must include `branch_id` param for correct branch)
  - `calendly.com/russellprice/clearlightai` — Russell's booking calendar (embedded on `/book`; same link the audit-report CTAs use)
  - `chat.clearlightai.com` — ChatWidget backend (not linked from website)
  - `n8n.clearlightai.com` — n8n workflows (not linked from website)

## Brand

| Element | Value |
|---------|-------|
| Body background | `#0e0d24 → #050510` (near-black gradient) |
| Logo text gradient | `#745aa5 → #7789d9` (used for highlights, buttons) |
| Gold (pop accent) | `#e5b673` (tagline, eyebrow dot — NOT primary accent) |
| Lavender | `#9b8ec4` (starfield edge tint, cursor glow) |
| Card bg | `#141538` |
| Headings font | Garet (light/thin weight — never bold) |
| Body font | Nunito Sans Expanded |
| Tone | Direct, credible, honest. Not hype-driven. Not corporate. |

**Important:** Gradient text uses inline `style` attributes, not CSS classes — Tailwind v4 purges custom `background-clip: text` classes. Headings must use `font-light`, never `font-bold`.

## Copy Source Files

All approved copy lives in `clai-copy.ai/`:

| File | Contents |
|------|----------|
| `00-index.md` | Design brief, key numbers, asset checklist |
| `01-company-overview.md` | Brand identity, founders, mission, target clients, colours |
| `02-services.md` | All services — audit as hero, plus Company Brain, Lead Scoring, Voice Agent, etc. |
| `03-case-studies.md` | Six real client engagements with findings and data |
| `04-social-proof-and-cta.md` | Proof points, testimonial structure, objection handling, CTAs, page structure |

## Page Structure (from brief)

1. Hero — headline, subheadline, primary CTA (free audit)
2. Pain section — who this is for, what problems we solve
3. How it works — audit process in 3-4 steps
4. Proof points / stats (Human Garage and Spartans data)
5. Services overview (audit as hero, others secondary)
6. Case studies (2-3 featured)
7. Testimonials / social proof
8. About the founders
9. FAQs (objection handling)
10. Final CTA (book a call)
11. Footer with logo wall and links

## Key Context

- This is a static marketing site, not a web app. Keep it lean.
- Russell Price is the business-facing founder (ghostwriting/editing background). Stephen Torrence is CTO (engineering/infrastructure).
- Real client data and case studies are used — these are verified, not fabricated.
- Some assets are still TBD: founder headshots, client logos, booking link for discovery calls.
- Testimonial quotes are being collected — design should accommodate them when ready.
- The copy references specific numbers (52% conversion, 26x difference, $0.01/lead, 25+ hours/week) — these must be preserved exactly as written.
