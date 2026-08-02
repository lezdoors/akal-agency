/**
 * The one easing catalogue.
 *
 * Policy (Blueprint v2, §4 / §9): all systems read easing from this single
 * catalogue. No component may invent its own unrelated easing values. If a
 * motion needs a curve it does not exist here, add it here first, then use it.
 */
export type EaseName =
  | "linear"
  | "easeOutQuad"
  | "easeInOutCubic"
  | "easeOutCubic"
  | "easeOutExpo"
  | "spring";
  // "spring" is resolved by the WeightLayer, not a numeric curve.

/** t is normalized [0,1]. Returns eased [0,1]. */
export type EaseFn = (t: number) => number;

const EASES: Record<Exclude<EaseName, "spring">, EaseFn> = {
  linear: (t) => t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};

export function getEase(name: EaseName): EaseFn {
  if (name === "spring") {
    throw new Error(
      "'spring' is not a numeric curve; use WeightLayer for sprung motion."
    );
  }
  return EASES[name];
}
