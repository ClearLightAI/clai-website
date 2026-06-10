# Video CTA Section + Site-wide Gold CTA Migration — Design

**Date:** 2026-06-10
**Status:** Approved design, pending spec review
**Author:** Stephen Torrence (with Claude)

## Goal

Improve the audit-wizard funnel on clearlightai.com by adding a video CTA section
directly below the hero, featuring an embedded message from Russell. Bring in the
ClearLight bento design conventions established in the publish-page and audit-report
skills. As part of this, align the site's primary CTA buttons on the canonical gold
treatment.

This is two pieces of work, sequenced:

1. **New video CTA section** (the "floating pill" variant).
2. **Site-wide gold CTA migration** (separate, reviewable pass).

---

## Part 1 — Video CTA Section ("Floating pill")

### Placement

Inserted in `src/pages/index.astro` between `<Hero />` and `<Services />`. It is a
distinct banded section, not a seamless continuation of the hero.

### Layout & visual language

A ~90%-width **floating rounded block** (NOT full-bleed). It carries the ClearLight
bento language imported from the audit-report / publish-page system:

- **Hero gradient background:** `linear-gradient(165deg, #13123b 0%, #725ba7 58%, #13123b 100%)`
- **Gold-tinted border:** `1px solid rgba(229,182,115,0.22)`
- **Atmosphere:** two blurred gradient orbs (blue + gold) + a faint masked grid behind content
- `border-radius: 32px`, large soft purple drop shadow
- Two-column grid inside: video left (`1.15fr`), copy right (`1fr`)

### Left column — video

- 16:9 **self-hosted MP4**, rendered as a native player with a custom poster + custom
  play-button overlay. **No autoplay.**
- The poster sits in a **gold-glow "well"**: a padded dark frame with a radial gold glow
  bleeding from the top edge.
- **Play button:** 76px gold circle, navy play glyph, with a pulsing halo ring animation
  and a subtle hover scale. Poster zooms slightly on hover.
- A small "1:42" **duration chip** bottom-right (placeholder; real duration TBD).
- Click behaviour: on click, swap the poster/overlay for the actual `<video>` element
  and play. (Implementation detail; see Build Notes.)

### Right column — copy

The social proof is folded into the **headline** (no separate eyebrow line):

> **Take the same process**
> **9-figure entrepreneurs run.** *(gold punchline)*

- Subhead: "Russell walks you through what the AI Readiness Audit uncovers, and why it's
  the first move every serious business should make. Then run yours, free."
- **Gold CTA button** → `https://audit.clearlightai.com` — label "Start Your Free Audit"
  with an animated arrow.
- Micro-line below button: "10 minutes · No cost · $500 of value" (matches hero's proof line).

### Props (for real assets later)

The component takes `poster`, `videoSrc`, and `href` props so the placeholder poster
(`/video/russell-poster.svg`) and empty video src can be replaced with Russell's real
poster image and hosted MP4 URL without touching markup.

### Typography & tokens

- Headline: `font-display` (Garet), `font-weight: 300` (light — never bold, per brand rule)
- Gold: `#e5b673`; body text `rgba(240,239,245,0.78)`
- Reuses the site's existing `--font-display` / `--font-body` CSS vars

### Responsive

Below 860px the grid collapses to a single column, copy centers, play button shrinks.

### Copy voice check (brand)

- No em dashes (uses regular dashes / middots). ✓
- No contrast framing ("It's not X, it's Y"). ✓
- Addresses business owners, not "AI consultants." ✓

---

## Part 2 — Site-wide Gold CTA Migration

**Decision:** Adopt gold as the primary CTA button color everywhere, matching the
canonical bento/brand CTA (`.btn-gold`). This resolves the on-page tension of having a
purple hero button directly above a gold video-section button.

### Buttons to migrate (purple gradient → gold)

These three are **button backgrounds** using `linear-gradient(135deg, #745aa5, #7789d9)`:

| File | Line | Element |
|------|------|---------|
| `src/components/Nav.astro` | 17 | "Free Audit" nav button |
| `src/components/Hero.astro` | 38 | "Start Free Audit" hero primary CTA |
| `src/components/Footer.astro` | 19 | "Start Free Audit" footer CTA |

**Gold treatment** (from the bento `.btn-gold`):
- Background `#e5b673`, text color `#13123b` (navy), hover `#efc98c`
- `box-shadow: 0 10px 30px -8px rgba(229,182,115,0.55)`; lift + arrow-nudge on hover
- Keep each button's existing size/padding/uppercase tracking; only the color treatment
  and text color change (navy text on gold, not white).

### What does NOT change

- **`Hero.astro` line 25** — the purple **gradient text** in the headline
  ("in your business?"). This is a text treatment, not a button. It stays purple.
- The logo gradient, starfield tints, card backgrounds, lavender accents — unchanged.
- The ElevenLabs widget orb colors — unchanged.

### Gold scarcity note

The brand rule reserves gold for emphasis ("if everything is gold, nothing is"). Making
gold the recurring CTA color is an intentional exception: on a dark site the buttons ARE
the emphasis, so this reads correctly. To protect the effect, we keep incidental gold
accents (eyebrow dots, taglines) minimal so the CTA buttons stay the dominant gold moment.

---

## Build Notes

### Components

- `src/components/VideoCtaPill.astro` — the new section (already drafted during brainstorming).
- Placeholder poster: `public/video/russell-poster.svg` (branded 16:9 CL placeholder).

### Video click-to-play

The drafted component currently renders a `<button>` with the poster + overlay. The
production build needs a small inline `<script>` that, on click:
1. Builds a `<video controls src={videoSrc} autoplay playsinline>` (autoplay here = on
   user click, which is allowed and is what the user expects after clicking play),
2. Replaces the poster/overlay with it.

If `videoSrc` is empty (placeholder state), the click is a no-op (or logs). Real MP4 URL
to be hosted on the ClearLight server (likely `pages.clearlightai.com` static or an EC2
static path — TBD with Stephen).

### Throwaway preview

`src/pages/video-cta-preview.astro` and the `VideoCtaBento.astro` (Variant 2) component
were built for the brainstorming comparison. **Both are throwaway** and must be deleted
before shipping (the preview route and the unused bento variant).

### Verification

- Run dev server, screenshot the section in real context below the hero.
- `await img.decode()` on the poster before asserting render; cache-bust in Playwright.
- Confirm all three migrated buttons render gold and link to the audit wizard.
- Publish to Netlify (auto-deploy from `main`) only after Stephen eyeballs locally.

---

## Out of Scope

- Hosting/serving the real MP4 (separate infra task; URL drops into the `videoSrc` prop).
- Recording/producing Russell's actual video.
- Real poster image (uses branded placeholder until provided).
- Any change to the Proof section (currently hidden) or Services.
