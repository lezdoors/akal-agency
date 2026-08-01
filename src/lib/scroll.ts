/**
 * Single rAF-coalesced scroll emitter.
 *
 * All scroll-thirsty code subscribes here instead of attaching its own
 * window scroll listeners. One passive scroll listener -> one rAF loop that
 * fans out to every subscriber. This keeps the cost at one layout read per
 * frame regardless of how many sections are animating.
 *
 * Subscribers receive `(scrollY, viewportH)`.
 */

type ScrollListener = (y: number, viewportH: number) => void;

let y = 0;
let vh = typeof window !== "undefined" ? window.innerHeight : 800;
let raf = 0;
let running = false;
const listeners = new Set<ScrollListener>();

function frame() {
  y = window.scrollY || window.pageYOffset || 0;
  vh = window.innerHeight;
  for (const fn of listeners) fn(y, vh);
  raf = requestAnimationFrame(frame);
}

export function subscribe(fn: ScrollListener): () => void {
  listeners.add(fn);
  if (!running) {
    running = true;
    raf = requestAnimationFrame(frame);
  }
  return () => {
    listeners.delete(fn);
    if (running && listeners.size === 0) {
      cancelAnimationFrame(raf);
      running = false;
    }
  };
}

export function getScrollY() {
  return y;
}
export function getViewportH() {
  return vh;
}

// Passive scroll + resize instrumentation (no listeners unless in use).
let instrumented = false;
export function ensureInstrumented() {
  if (instrumented || typeof window === "undefined") return;
  instrumented = true;
  window.addEventListener(
    "scroll",
    () => {
      // The rAF loop already reads the freshest values; nothing to do here
      // beyond coalescing — simply force one immediate frame so subscribers
      // update without waiting for the next natural frame.
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );
  window.addEventListener("resize", () => {
    vh = window.innerHeight;
  });
}

/** Progress (0..1) of an element's rect through `distance` viewport-heights
 *  of travel, centered on the viewport. */
export function progressOf(
  elTop: number,
  elHeight: number,
  scrollY: number,
  viewportH: number,
  distanceVh = 1
) {
  const travel = viewportH * distanceVh;
  const start = elTop - viewportH + (viewportH - elHeight) / 2;
  return clamp((scrollY - start) / travel);
}

export function clamp(v: number, min = 0, max = 1) {
  return v < min ? min : v > max ? max : v;
}

export function smoothstep(v: number) {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
}
