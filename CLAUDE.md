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

First draft deployed to Netlify. Current page sections: Hero, Services (3 cards), Proof/Results (3 client cards), Footer CTA. Starfield canvas animation with cursor-following purple glow. ElevenLabs AI Profit Wizard voice widget embedded as floating bubble.

## Hosting & Deployment

- **Host:** Netlify (auto-deploys from `main` branch)
- **Repo:** github.com/ClearLightAI/clai-website (public)
- **Domain:** clearlightai.com (DNS managed via Cloudflare)
- **Publish directory:** `dist` (Astro default)
- **Key external URLs:**
  - `audit.clearlightai.com` — AI Profit Wizard (free audit lead magnet, ElevenLabs voice agent)
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
