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

## Typography & Spacing (design principles)

These came out of a readability/conversion audit + deep research (NN/g, WCAG 2.2, Baymard, Material Design 3, Apple HIG) in June 2026. Apply them to every new section so the site stays consistent and legible. This is a marketing/landing page — readability is conversion, so do not shrink text to "fit the look."

**Type scale (fluid, mobile → desktop):**

| Role | Size | Notes |
|------|------|-------|
| Hero H1 | `clamp(2.7rem, 6.48vw, 4.86rem)` | Garet light |
| Section H2 | `clamp(2.2rem, 4.6vw, 3.4rem)` | Garet light, centred |
| Sub-line under H2 | `clamp(1.0625rem, 0.98rem + 0.28vw, 1.1875rem)` (17→19px) | |
| Card / item title | `1.25rem` (20px) | bold is OK here (instruction overrides the "headings never bold" rule for sub-titles/stats) |
| **Body / support** | `clamp(1rem, 0.92rem + 0.28vw, 1.125rem)` (**16→18px**) | line-height **1.6** |
| Accent / attribution | `1rem` (16px) | never below 16px for reading text |
| Eyebrow / meta label | `0.65–0.75rem` uppercase tracked | the *only* allowed sub-16px text |

**Hard rules:**
- **Body text floor is 16px** (mobile) and ~18px on desktop. 14–15px reading text is a regression — do not reintroduce it. Only uppercase tracked labels/eyebrows may go smaller.
- **Muted text uses `rgba(240, 239, 245, 0.78)` minimum** (`0.86` for slightly stronger). Opacity ≤0.6 on the near-black background fails WCAG AA contrast and hurts conversion — never use it for body copy.
- Line-height ≥1.5 for body (we use 1.6). Cap body paragraph blocks at ~60ch (`max-width`) to stay in the 50–75 character measure.
- Line length / measure: 50–75 characters; never exceed ~80.

**Spacing & scroll rhythm:**
- Every section uses **one padding token**: `padding-top`/`padding-bottom: clamp(48px, 5.5vw, 84px)`. Keep it identical across sections so transitions feel even and there are no dead gaps. Do NOT use tall `min-height` "fold tease" voids — they read as empty space.

**Tailwind v4 token caveat (learned the hard way):**
- Tailwind v4 **reserves the `--text-*` and `--leading-*` namespaces** (font-size / line-height), so declaring them in `@theme` or a plain `:root` does NOT emit a usable `:root` custom property — `getComputedStyle` returns empty.
- It also **tree-shakes `@theme` custom properties that aren't referenced inside `global.css` itself** (e.g. `--color-gold` survives only because `::selection` uses it). A token used only in a component's scoped `<style>` gets dropped.
- Therefore: **inline the type-scale `clamp()` values and the muted `rgba()` literals directly in each component's scoped `<style>`** (do not rely on shared custom properties for them). Verify with `getComputedStyle` after changes.
- Never put `*/` inside a CSS comment (e.g. writing `--text-*/--leading-*`) — it closes the comment early and a later apostrophe ("won't") triggers an "Unclosed string" build error.

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
