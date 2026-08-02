/**
 * Shared per-visit session state for the procedural world.
 *
 * One TimeSystem, one SeedSystem root, one performance tier — created once at
 * module load and shared by the scroll driver and the globe canvas so the
 * whole page runs on one clock and one physical policy.
 */
import { SeedSystem, seedFromString } from "@/systems/seed/SeedSystem";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { PerformanceTierSystem } from "@/systems/renderer/PerformanceTierSystem";

function prefersReduced(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Resolved once per page load. Honest: no downgrade after first paint. */
export const reducedMotion: boolean = prefersReduced();

export const perf = new PerformanceTierSystem({
  reducedMotion,
});

/** World clock — shared by scroll and render. */
export const time = new TimeSystem();

/**
 * Per-session root seed. seedFromString("") yields a fresh random uint32, so
 * every visit is a new (but internally reproducible) world.
 */
export const rootSeed: number = seedFromString("");
export const seedSystem = new SeedSystem(rootSeed);