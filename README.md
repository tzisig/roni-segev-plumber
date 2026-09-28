# Plumber website template (demo: Roni Segev, Haifa and the Krayot)

Static Astro site, Hebrew RTL, built so the same code can be offered to another plumber
(or another home-services trade) by editing one file.

## New client in 4 steps

1. **Edit `src/config/site.config.ts`** - identity, owner, phone/WhatsApp, 24/7 flag and hours,
   arrival times, theme colors, services (one page each), service areas (one page each, with
   content written for that city), price list, reviews, before/after gallery, FAQ, emergency triage,
   form destinations and legal details. Nothing client-specific is typed into pages or components.
2. **Replace images** in `src/assets/img/` (same file names, or update the imports at the top of the config).
   See `CREDITS.md` for the current demo stock photos.
3. **Set `site.url`** and **`site.isDemo: false`** (demo mode adds noindex to every page and a demo note in the footer).
4. **Regenerate icons** after a color change: `npm run icons`, then `npm run build`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server at http://localhost:4321 |
| `npm run build` | Build to `dist/` |
| `npm run preview` | Serve the built site |
| `npm run audit` | Check the build: broken links, orphans, titles, descriptions, H1, canonical, JSON-LD, alt, em dashes |
| `npm run icons` | Rebuild favicon and app icons from the theme colors |
| `npm run checklist` | Write the progress file for the Website Build Checklist |

## What is on the site

- Sticky emergency strip (desktop and mobile) and a sticky call/WhatsApp bar on mobile.
- "What happened?" triage: pick the problem, get first steps and a prefilled WhatsApp message.
- Live status card in the hero (Israel time, night shift label).
- Draggable before/after comparisons (keyboard accessible range input).
- Schematic route map of the service area with arrival times, plus a text list with the same data.
- Schema: `Plumber` (LocalBusiness) with areas, hours, rating and offer catalog; `Service`, `FAQPage`, `BreadcrumbList`, `Person`.

## Contact form

`form.destinations` in the config. Every lead goes to every destination in parallel; use two
(email via Web3Forms + a webhook to a Google Sheet) so no lead is lost. Empty list = demo mode.
Analytics (GA4) loads only after cookie consent; set `analytics.ga4`.

## Hosting

Built for Cloudflare Pages (any static host works). `public/_headers` holds security and cache headers.
