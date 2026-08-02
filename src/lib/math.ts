/** Shared math primitives. One source of truth for the whole experience. */

export const clamp = (v: number, lo: number, hi: number): number =>
  v < lo ? lo : v > hi ? hi : v;

export const clamp01 = (v: number): number => clamp(v, 0, 1);

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Framerate-independent exponential damping toward a target. Wendt-style. */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number
): number => lerp(current, target, 1 - Math.exp(-lambda * dt));

export function dampVec3(
  out: Float32Array,
  current: Float32Array,
  target: Float32Array,
  lambda: number,
  dt: number
): Float32Array {
  const k = 1 - Math.exp(-lambda * dt);
  out[0] = lerp(current[0], target[0], k);
  out[1] = lerp(current[1], target[1], k);
  out[2] = lerp(current[2], target[2], k);
  return out;
}

/** Generalized logistic interpolation in [0,1]. */
export const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const TAU = Math.PI * 2;
