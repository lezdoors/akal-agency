import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Self-regulating behavior inside the Canvas:
 * - Pauses the render loop entirely when the tab is hidden (no wasted GPU work).
 * - Samples real FPS; if the device can't hold a usable rate (e.g. software
 *   WebGL / no GPU), it steps the particle budget down once. The lab's design
 *   intended lazily-sampled FPS to drive the tier — this is that hook.
 */
export function Adaptivity({ onDowngrade }: { onDowngrade: (scale: number) => void }) {
  const setFrameloop = useThree((s) => s.setFrameloop);
  const frames = useRef(0);
  const start = useRef(0);
  const downgraded = useRef(false);

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setFrameloop]);

  useFrame(() => {
    if (downgraded.current) return;
    const t = performance.now();
    if (frames.current === 0) start.current = t;
    frames.current += 1;
    const dt = t - start.current;
    if (dt < 2000) return;
    const fps = (frames.current / dt) * 1000;
    if (fps < 16) onDowngrade(0.15);
    else if (fps < 30) onDowngrade(0.4);
    downgraded.current = true;
  });

  return null;
}
