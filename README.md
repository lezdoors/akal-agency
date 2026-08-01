# AKAL — marketing agency site

A single-page marketing site for AKAL, a design / creative / video agency.
The whole argument is a hard **OLD vs MODERN collision**: 19th-century ink-wash
plates and aged-paper grounds sit next to brutalist display grotesk, mono
micro-labels, tabular numerals and scroll-driven motion — with print-production
language (plate numbers, registration marks, crop marks, ink specs) as the
bridge between the two eras.

## Stack

- **React 18 + Vite + Tailwind** — plain components, no router, no file-based
  routing, no server bindings. Imports cleanly into any React 18 project.
- Self-hosted type: Cabinet Grotesk (Fontshare) + Inter Tight. No external
  font hosts, no CDN scripts.
- Each effect/section is a self-contained folder: `Component.tsx` +
  `Component.css` + `README.md`. All copy and media paths arrive as **props**
  from `src/config/site.ts` — nothing hardcoded.
- Motion is transform/opacity only, driven by a single rAF-coalesced passive
  scroll listener; `prefers-reduced-motion` renders final states instantly.

## Run / build

```bash
bun install
bun run dev      # local dev server
bun run build    # static build → dist/
```

## Structure

- `src/sections/Hero` — the scroll-scrub hero (locked). Reuses the trusted
  ScrollScrub engine verbatim; only a DOM chrome frame was added.
- `src/sections/PlateIndex` — the flag **Plate Index**: four antique ink-wash
  plates framed by brutalist type + print-production language.
- `src/sections/Reel` (Craft) — cursor-as-transport film scrubbing.
- `src/sections/Manifesto`, `Process`, `Audience`, `Contact`, `Footer`.
- `src/components/GroundField` / `ShapeCarry` / `ClosingStroke` — the non-fade
  section transitions (ground interpolation, the carried ink arc, the closing
  stroke).
- `public/media/` — real wired media (hero ink-wash scenes, craft reel).
