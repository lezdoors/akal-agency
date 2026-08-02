# AKAL — Production Plan (Blueprint v2, presentation layer)

`akal-agency` is the **production presentation layer** of AKAL — a living
acquisition operating system. This file is the living build plan.

> **THE SCREENPLAY GOVERNS THE EXPERIENCE.** `docs/camera-story-spec.md` is the
> Camera Story Specification — the film's screenplay: every scene, camera move,
> transition, interaction, emotional beat, world state, reverse-scroll and
> mobile adaptation. The CameraSystem is the director; the page is one continuous
> film, not a set of sections. Chapters are **scenes**; nothing moves without
> narrative intent. Implement all experience work from that document.

Deeper creative/technical detail lives in **Blueprint v2** in the engineering lab
(`HF-akal-agency/docs/architecture.md` and `docs/phase0-results.md`); this
plan links there instead of duplicating it.

---

## Repositories (source of truth)

| Repo | Role | Notes |
|---|---|---|
| `HF-akal-agency` | Engineering lab & procedural interaction environment | Validates systems in isolation; Next.js + R3F. Phase 0 complete. |
| `akal-agency` (this) | Production presentation layer | Vite + React + Tailwind; deploys via Vercel. Consumes/ports the lab's validated systems. |

Rule: the lab is where systems are isolated and tuned; production is where
approved systems are **composed into the visitor journey**. No second,
unrelated implementation of the globe experience.

## Approved positioning

AKAL is **infrastructure, not a marketing agency.** It qualifies, routes and
delivers opportunity. Lead generation is the first layer of a much larger
platform. Calm, precise, premium, technically sophisticated, restrained. No
agency clichés, no standard SaaS layout, no hype.

- **Headline:** "The infrastructure for customer acquisition."
- **CTA (page-wide, one label):** "Talk to us" — nav, hero, single instrument CTA.
- **Final line:** "We build experiences like this."

## Brand personality

Confident but quiet. Precision over volume. The visitor discovers they found
infrastructure, not a vendor. Nothing loud. The world speaks; the interface
stays out of the way.

## Palette & typography

Cold-luxury ice on instrument-dark, all-dark theme (old cream/ink agency look
is retired):

- Ground `#0A0C10` — Panel `#12151B` — Hairline `#20262F`
- Ink `#EFF2F6` — Muted `#98A2B0`
- Accent `#7FA7C4` (matte steel-ice)

Light rule: **the interface stays matte; the procedural world may emit
controlled light** (bloom, atmospheric scattering, energy) where physically
appropriate. One accent only; never glowing chrome.

Typography: **Geist** (display/body) + **Geist Mono** (labels, numerals, readouts).

## Story arc (chapters over the world)

1. **The World** — hero: "The infrastructure for customer acquisition."
2. **The System** — today: premium lead generation, delivered live.
3. **The Instrument** — qualify, route, deliver: the precision of the system.
4. **The Platform** — "Lead generation is the first layer." What comes next.
5. **The Single Route** — the world resolves to one connection: the visitor.
6. **The Invitation** — "We build experiences like this." → Talk to us.

The globe is the character and the heart: one continuous world, not a stack of
sections. Opportunity is a field of moving points; AKAL is the OS that
qualifies, routes and delivers.

## Today's offering (framed as a system)

Exclusive qualified leads · shared lead programs · real-time delivery ·
industry targeting · geographic targeting · AI-assisted qualification · lead
routing · campaign optimization · CRM integrations · acquisition consulting.

## Future platform direction (quietly suggested, never overpromised)

AI sales agents · voice agents · lead verification · predictive qualification ·
marketing intelligence · autonomous optimization · analytics · workflow
orchestration · lifecycle intelligence · cross-channel attribution · the
acquisition operating system.

## Procedural vs generated assets (hard rule)

- The globe, routes, particles, qualification, camera movement and interaction
  are **procedural, rendered live in the browser.** They respond to the
  visitor, reverse with scroll and reroute dynamically.
- **No pre-rendered hero film.** A film cannot react to the visitor; it never
  replaces the procedural world (including as the desktop hero).
- Higgsfield-generated assets are limited to:
  - AKAL monogram
  - favicon
  - OG / social cover
  - one visual calibration still (internal art-direction reference only)
  - optional static poster — fallback for unsupported/constrained devices,
    **never** the normal desktop hero.
- No stock imagery, no CSS-only filler for brand identity.

## Deployment path

**Vercel** (existing wiring): `vercel.json` → `bun run build` → `dist`. The
repos are the source of truth; previews, history and production releases stay
connected. The temporary platform `deploy_website` path is **not** used or
depended on.

## Accessibility & reduced motion

Honor `prefers-reduced-motion`: static fallback path, sharply reduced particle
scale, no Co-Agent behavior, no bloom. Full semantic content flow — the story
must read without the world. Mobile-quality tier behavior throughout.

## Performance requirements

60 FPS high-tier desktop · 45–60 mid laptop · 30 FPS floor low mobile. No
per-frame GC in core loops, capped device-pixel ratio, instancing for repeated
geometry, worker-isolated pathfinding, no large video assets, first procedural
frame ≈1.5s. Quality tiers: `high | mid | low | reduced` via
`PerformanceTierSystem`.

## Current implementation phase

**Phase 0 complete** (lab): Portal freeze-and-zoom, Chord of Futures,
Co-Agent, WeightLayer all approved (see `HF-akal-agency/docs/phase0-results.md`).
**Now → Phase 1 (build the world)** on this production repo: port validated
systems, stand up the single canvas + TimeSystem + tiering + reduced-motion,
build the globe field. See `docs/integration.md` for the port mapping.

## Open decisions

- In-browser frame-time measurements for the spikes (high/low) not yet recorded.
- Exact copy for the six chapters / instrumentation labels.
- "Talk to us" routing (email, form, or product-qualification entry).
- Sound design scope for Phase 1 skeleton.

## Prohibited directions

- No agency clichés, marketing hype, or generic SaaS layout.
- No excessive glow in the interface (world may emit light; chrome does not).
- No pre-rendered film as the hero experience.
- No stock/CSS-only filler replacing brand identity or the world.
- No two divergent implementations of the globe (lab ⇄ production stay in sync).
- No dependence on the platform `deploy_website` path for production.
