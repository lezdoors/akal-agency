# AKAL — Lab → Production integration strategy

How the validated procedural systems in `HF-akal-agency` move into this
production repo. **One source of truth, one implementation** — production
consumes/adapts/ports what the lab proves; it never reimplements the globe.

## Stack reconciliation

| Concern | Lab (`HF-akal-agency`) | Production (`akal-agency`) | Action |
|---|---|---|---|
| Framework | Next.js 15 (App Router) | Vite + React 18 | keep Vite; drop Next-only bits |
| Scene | React Three Fiber + three.js | none yet | add `three` + `@react-three/fiber` + `gsap` + `lenis` to match |
| Styling | Tailwind/globals | Tailwind (already present) | migrate tokens to new palette |

## Port mapping — framework-agnostic modules (port near-verbatim)

These depend only on TypeScript/THREE, not on Next or R3F. Copy into production
`src/`, fix relative imports only:

| Lab path | Production home | Notes |
|---|---|---|
| `src/systems/time/TimeSystem.ts` | `src/systems/time/` | the shared clock — time is derived, never imperative |
| `src/systems/weight/WeightLayer.ts` | `src/systems/weight/` | single physical/motion policy; no invented easing |
| `src/systems/seed/SeedSystem.ts` | `src/systems/seed/` | deterministic per-session variety |
| `src/systems/coagent/CoAgent.ts` | `src/systems/coagent/` | autonomous layer; stands down on visitor engage |
| `src/systems/layers/LayerDirector.ts` | `src/systems/layers/` | hidden layer registers |
| `src/systems/sound/SoundSystem.ts` | `src/systems/sound/` | micro-audio shell |
| `src/systems/renderer/RendererInterface.ts` | `src/systems/renderer/` | renderer contract; nothing outside touches a concrete renderer |
| `src/systems/renderer/PerformanceTierSystem.ts` | `src/systems/renderer/` | high/mid/low/reduced + DPR + feature flags |
| `src/systems/renderer/WebGLAdapter.ts` | `src/systems/renderer/` | guaranteed WebGL2 path |
| `src/systems/renderer/WebGPUAdapter.ts` | `src/systems/renderer/` | guarded progressive enhancement, off by default |
| `src/systems/network/RouteSolverClient.ts` | `src/systems/network/` | worker client |
| `src/workers/routeSolver.worker.ts` | `src/workers/` | worker-isolated pathfinding |
| `src/shaders/field.ts`, `arc.ts` | `src/shaders/` | GLSL/JS bundle |
| `src/lib/*` | `src/lib/` | math, geometry, palette, easing, pointerState, fps, routeSolver (skip lab-only `labStore`/`liveStats`) |

## Port mapping — scene components (adapt, then own)

These use R3F and must be adapted to the production canvas. They carry the
world look and must remain a single implementation, tuned here and mirrored
back to the lab only when a change is validated:

| Lab path | Production home |
|---|---|
| `src/components/particles/FieldPoints.tsx` | `src/components/particles/FieldPoints.tsx` |
| `src/components/globe/GlobeField.tsx` | `src/components/globe/GlobeField.tsx` |
| `src/components/canvas/LabCanvas.tsx` | `src/components/canvas/ProductionCanvas.tsx` (adapted) |

## Phase 2 systems (lab + production grow together)

- **CameraSystem** — sprung camera depth (partially present in the lab's
  portal springs); formalize as its own module in both repos.
- **CursorField** — cursor/dwell interaction (currently `lib/pointerState`);
  build as a module next.

These are next-phase: do not invent a divergent copy in production.

## Guardrails

- `SeedSystem` is the one non-negotiable: nothing repeats perfectly; every
  visible behavior is session-seeded, deterministic yet varied.
- All motion passes through `WeightLayer` (code-review rule).
- All render/sim read `TimeSystem`; nobody owns its own clock.
- Tier + reduced-motion gate DPR, particle scale, arcs, Co-Agent cadence, bloom.
- `tsc --noEmit` and a production `vite build` must pass before any merge.

## Phase 1 entry checklist (on this repo)

1. Add `three`, `@react-three/fiber`, `gsap`, `lenis` to `package.json`.
2. Port the framework-agnostic modules above (this table).
3. Adapt `ProductionCanvas` + `GlobeField`; mount one fixed canvas.
4. Wire `TimeSystem` + `PerformanceTierSystem` + reduced-motion gating.
5. Apply the new palette/tokens (Geist + `#0A0C10` family).
6. Build the boot-order reveal + kernel register.
7. Re-verify with browser frame-time diagnostics against Phase 0 budgets.
