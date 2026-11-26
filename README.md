# LookLab

See your best haircut before you get it.

**Live:** https://looklab-ashen.vercel.app

## What it is

A five-step grooming consult:

1. **Consult** — upload a selfie or take one in the browser. The photo is checked on-device with face-api.js (face found, roughly front-facing, in focus). It never leaves the phone until you generate a preview.
2. **Brief** — hair texture, styling effort, hair length today, last haircut, and one or two vibes (real people blend styles).
3. **Picks** — three cuts chosen from your answers, each with an illustration and a "picked because" line.
4. **Mirror** — the top pick generates automatically as an AI-edited concept; tap the other looks to preview them, and drag the before/after slider to compare.
5. **Card** — a printable, shareable Barber Card with exact clipper guard numbers, so any barber can execute the cut.

## Stack

- `index.html` — the whole front end, no build step
- `api/tryon.js` — Vercel serverless function: AI try-on via the OpenAI image API
- `netlify/functions/tryon.mjs` + `netlify.toml` — Netlify equivalent of the same endpoint
- `vercel.json` — rewrites `/.netlify/functions/tryon` to `/api/tryon`, so the same front end works on both hosts
- face-api.js + face models loaded from the jsdelivr CDN at runtime

## Setup

Deploy with `vercel deploy` (or connect the repo in the Vercel dashboard). For AI previews, set `OPENAI_API_KEY` in the project environment variables; `OPENAI_IMAGE_MODEL` is optional and defaults to `gpt-image-1`. Without the key, everything works except the AI preview generation.

Privacy: photos are validated on-device and are only sent to the try-on endpoint when a preview is generated. They are not stored.

Pushes to `main` auto-deploy via Vercel.

## v2 polish

- Mirror: "barber studying you" scene while the preview generates (scan line, landmark dots, orbiting scissors, rotating messages, barber-pole progress, clipper buzz) and a sweep-and-clippings reveal with a ding. Minimum 4.5s so the reveal feels earned.
- Picks: 2.3s shortlisting shuffle, dealt cards, "Barber’s choice" stamp, morning-effort scale and barber-visit cadence.
- Quirks: scroll-snipping hero scissors, peeling sticker, tap-the-ticker grooming tips, texture icons, effort slider, vibe quips, press-down tiles, upload quips.
- Card: ticket look (perforations, serial, approved stamp), full-screen barber view, nearby-barber link; card image text spacing fixed.
- Sound starts muted; friendly error copy when the preview fails (no env var names shown to users).
