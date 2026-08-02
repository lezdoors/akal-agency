import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

interface AdaptivityProps {
  /** Current particle-budget cap (fraction of tier budget). */
  cap: number;
  /** Called with the next cap whenever FPS dictates a change. */
  onAdapt: (next: number) => void;
  min?: number;
  max?: number;
}

/**
 * Self-regulating render policy inside the Canvas:
 * - Starts at a low, safe budget and **grows** only when sustained 60fps proves
 *   a capable GPU — so slow / software WebGL never pegs the main thread.
 * - Shrinks if the device can't hold a usable rate.
 * - Pauses the render loop entirely while the tab is hidden.
 *
 * This is the lab's intended "lazily-sampled FPS drives the tier" mechanism.
 */
export function Adaptivity({
  cap,
  onAdapt,
  min = 0.15,
  max = 1,
}: AdaptivityProps) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const frames = useRef(0);
  const start = useRef(0);

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setFrameloop]);

  useFrame(() => {
    const t = performance.now();
    if (frames.current === 0) start.current = t;
    frames.current += 1;
    const elapsed = t - start.current;
    if (elapsed < 800) return;

    const fps = (frames.current / elapsed) * 1000;
    frames.current = 0;
    start.current = t;

    // Grow fast only on a strong rate; shrink aggressively when weak.
    const next =
      fps >= 55
        ? Math.min(max, cap * 3)
        : fps < 25
        ? Math.max(min, cap * 0.5)
        : cap;
    if (Math.abs(next - cap) > 0.001) onAdapt(next);
  });

  return null;
}
