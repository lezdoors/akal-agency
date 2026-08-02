import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { CameraDirector } from "@/film/Director";
import { worldState } from "@/film/state";
import { clamp01 } from "@/lib/math";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { reducedMotion } from "@/session";

interface FilmDirectorProps {
  time: TimeSystem;
}

/**
 * Scene 1 — The World.
 *
 * The visitor enters a world assembling itself: the field densifies from a
 * haze into the full globe (the boot), the camera holds a gentle BREATHE that
 * settles into an extended STILL as the headline completes, and one faint arc
 * traces as a promise. Reverse scroll rewinds the boot, proving the world is
 * procedural. This scene only *shows* the system; it asks nothing of the
 * visitor yet (interaction is gated to a handhold elsewhere).
 *
 * Under reduced motion, the world resolves to its final, static state — the
 * story is preserved as a still, never a skipped beat.
 */
export function FilmDirector({ time }: FilmDirectorProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const director = useMemo(() => new CameraDirector(camera), [camera]);

  const boot = useRef(reducedMotion ? 1 : 0);
  const done = useRef(reducedMotion);
  const lastProgress = useRef(time.progress);

  useEffect(() => {
    director.setShot({
      mode: reducedMotion ? "still" : "breathe",
      base: [0, 0.6, 7.4],
      aim: [0, 0, 0],
      breathe: reducedMotion ? 0 : 0.35,
    });
    worldState.boot = reducedMotion ? 1 : 0;
  }, [director]);

  useFrame((_s, rawDt) => {
    const dt = Math.min(rawDt, 0.05);

    if (reducedMotion) {
      worldState.boot = 1;
      director.update(dt, time);
      return;
    }

    // Scroll direction drives the boot: forward assembles, reverse rewinds.
    const pd = time.progress - lastProgress.current;
    lastProgress.current = time.progress;
    const rewinding = pd < -0.0005;

    if (rewinding || !done.current) {
      boot.current = clamp01(boot.current + dt * (rewinding ? -1.3 : 0.45));
      if (boot.current >= 1) done.current = true;
    }
    worldState.boot = boot.current;

    // BREATHE while booting; settle to STILL as the world completes.
    const settle = 1 - Math.min(1, boot.current * 1.15);
    director.setShot({
      mode: "breathe",
      base: [0, 0.6, 7.4],
      aim: [0, 0, 0],
      breathe: 0.35 * settle,
    });
    director.update(dt, time);
  });

  return null;
}
