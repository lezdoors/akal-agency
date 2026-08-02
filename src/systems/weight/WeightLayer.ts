/**
 * WeightLayer.
 *
 * Blueprint v2 §4: one shared physical-motion policy governs every system.
 * No component invents its own easing values. Everything reads from
 * WORLD_TUNE and the Spring / Charge primitives below, so the whole world
 * feels governed by a single physical reality.
 */
import { clamp, dampVec3, lerp } from "@/lib/math";

export type WorldKind =
  | "cursor"
  | "reticle"
  | "charge"
  | "packet"
  | "routeSettle"
  | "lockSnap"
  | "camera"
  | "portal"
  | "layerPeel";

export interface SpringTune {
  stiffness: number;
  damping: number;
  mass: number;
}

/** The single physical policy. Tuned once; tune here, everywhere changes. */
export const WORLD_TUNE: Record<WorldKind, SpringTune> = {
  cursor: { stiffness: 200, damping: 22, mass: 1 },
  reticle: { stiffness: 280, damping: 26, mass: 1 },
  charge: { stiffness: 40, damping: 12, mass: 1 },
  packet: { stiffness: 130, damping: 15, mass: 1 },
  routeSettle: { stiffness: 55, damping: 16, mass: 1 },
  lockSnap: { stiffness: 460, damping: 30, mass: 1 }, // crisp snap, slight overshoot
  camera: { stiffness: 13, damping: 4, mass: 1 }, // slow, heavy drift
  portal: { stiffness: 26, damping: 8, mass: 1 },
  layerPeel: { stiffness: 34, damping: 10, mass: 1 },
};

export function getTune(kind: WorldKind): SpringTune {
  return WORLD_TUNE[kind];
}

/**
 * A scalar damped spring. Uses semi-implicit Euler integration.
 * Reads the shared tune for its kind; no local constants.
 */
export class Spring {
  value: number;
  velocity = 0;
  target: number;
  private readonly tune: SpringTune;

  constructor(initial: number, kind: WorldKind) {
    this.value = initial;
    this.target = initial;
    this.tune = WORLD_TUNE[kind];
  }

  setTarget(t: number): void {
    this.target = t;
  }

  snap(v: number): void {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  step(dt: number): number {
    const { stiffness: k, damping: d, mass: m } = this.tune;
    const a = (k * (this.target - this.value) - d * this.velocity) / m;
    this.velocity += a * dt;
    this.value += this.velocity * dt;
    return this.value;
  }
}

/** A 3-component sprung vector driven by one shared tune kind. */
export class Vec3Spring {
  x: Spring;
  y: Spring;
  z: Spring;
  constructor(initial: [number, number, number], kind: WorldKind) {
    this.x = new Spring(initial[0], kind);
    this.y = new Spring(initial[1], kind);
    this.z = new Spring(initial[2], kind);
  }
  setTarget(t: [number, number, number]): void {
    this.x.setTarget(t[0]);
    this.y.setTarget(t[1]);
    this.z.setTarget(t[2]);
  }
  snap(v: [number, number, number]): void {
    this.x.snap(v[0]);
    this.y.snap(v[1]);
    this.z.snap(v[2]);
  }
  step(dt: number): [number, number, number] {
    return [this.x.step(dt), this.y.step(dt), this.z.step(dt)];
  }
}

/** Framerate-independent damped vector toward a target, from a tune kind. */
export function dampToTune(
  out: Float32Array,
  current: Float32Array,
  target: Float32Array,
  kind: WorldKind,
  dt: number
): Float32Array {
  const lambda = WORLD_TUNE[kind].stiffness * 0.01;
  return dampVec3(out, current, target, lambda, dt);
}

/**
 * Qualification charge: integrates a rate toward a threshold. Crossing the
 * threshold is a one-frame flag (the "lock" moment). Used by the cursor
 * dwell mechanic, the Co-Agent, and the portal entry.
 */
export class Charge {
  value = 0;
  rate = 1;
  threshold = 1;
  cleared = false;
  justCleared = false;

  constructor(threshold = 1, rate = 1) {
    this.threshold = threshold;
    this.rate = rate;
  }

  normalized(): number {
    return clamp(this.value / this.threshold, 0, 1);
  }

  update(dt: number): void {
    this.justCleared = false;
    if (this.cleared) return;
    this.value = Math.min(this.threshold, this.value + this.rate * dt);
    if (this.value >= this.threshold) {
      this.cleared = true;
      this.justCleared = true;
    }
  }

  reset(): void {
    this.value = 0;
    this.cleared = false;
    this.justCleared = false;
  }
}

/** Blend helper for eased getters. */
export { lerp };
