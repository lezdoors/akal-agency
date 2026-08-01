# AKAL — Agency Landing Page

A scroll-driven landing page for AKAL, a marketing agency offering four
capabilities built and run as one system: websites & landing pages, creative
& video, paid media, and ongoing optimisation.

The hero is a **scroll-scrub film**: as you scroll, the cinematic hero video
scrubs forward, driven by the `ScrollScrub` component
(`app/src/components/scroll-scrub/`). Scene content and theme are defined in
`app/src/scroll-scrub-scenes.ts`.

## Stack

- React 19 + TanStack Start (SSR, single Vite build)
- Tailwind CSS
- Vercel deployment (`vercel.json`)

## Local development

From `app/`:

```bash
bun install
bun run dev        # start the dev server
bun run build      # type-check + production build
```

## Structure

- `app/src/routes/index.tsx` — homepage (hero + services + process + CTA)
- `app/src/components/scroll-scrub/` — the scroll-driven film engine
- `app/src/scroll-scrub-scenes.ts` — hero scene data + theme
- `app/public/assets/world/` — hero film clips and posters

## Deploy

Pushed to Vercel as a TanStack Start app (see `vercel.json`). The scroll
motion is preserved in this source — do not replace the hero with a plain
inline `<video>`.
