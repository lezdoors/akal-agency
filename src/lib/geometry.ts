/** Geometry generators. All values are CPU-generated once and kept. */
import { TAU } from "./math";

export type Rng = () => number;

/** Random uniform points on a sphere. */
export function spherePoints(count: number, radius: number, rng: Rng): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rng() * 2 - 1;
    const phi = rng() * TAU;
    const s = Math.sqrt(1 - u * u);
    out[i * 3] = radius * s * Math.cos(phi);
    out[i * 3 + 1] = radius * s * Math.sin(phi);
    out[i * 3 + 2] = radius * u;
  }
  return out;
}

/** Points on a horizontal ring. */
export function ringPoints(count: number, radius: number, y = 0): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    out[i * 3] = Math.cos(a) * radius;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.sin(a) * radius;
  }
  return out;
}

/** A quadratic bezier sampled into a line strip (control-based). */
export function quadStrip(
  p0: [number, number, number],
  p1: [number, number, number],
  p2: [number, number, number],
  segments: number
): Float32Array {
  const out = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    out[i * 3] = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0];
    out[i * 3 + 1] = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1];
    out[i * 3 + 2] = mt * mt * p0[2] + 2 * mt * t * p1[2] + t * t * p2[2];
  }
  return out;
}
