import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CameraDirector, ShotKey } from "@/film/Director";
import { worldState } from "@/film/state";
import { smoothstep } from "@/lib/math";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { reducedMotion } from "@/session";

/** One continuous camera path through the whole film (scroll = time). */
const FILM_SHOTS: ShotKey[] = [
  { at: 0.0, pos: [0, 1.15, 9.6], aim: [0, 0, 0], fov: 40 },
  { at: 0.12, pos: [0, 0.6, 8.0], aim: [0, 0, 0], fov: 45 },
  { at: 0.2, pos: [2.4, 0.5, 7.0], aim: [0, 0, 0], fov: 46 },
  { at: 0.3, pos: [1.8, 0.3, 5.4], aim: [0.2, 0, 0], fov: 50 },
  { at: 0.36, pos: [1.0, 0.1, 4.4], aim: [0.45, 0.05, -0.2], fov: 54 },
  { at: 0.44, pos: [0.35, 0.0, 2.6], aim: [0.55, 0.05, -0.5], fov: 64 },
  { at: 0.52, pos: [0.0, 0.0, -4.6], aim: [0, 0, 0], fov: 86 },
  { at: 0.64, pos: [0, 0.9, -5.4], aim: [0, 0.2, 0], fov: 62 },
  { at: 0.76, pos: [1.5, 0.4, -4.6], aim: [0.6, 0.1, 0], fov: 55 },
  { at: 0.86, pos: [0, 0.0, -5.0], aim: [0, 0, 0], fov: 62 },
  { at: 1.0, pos: [0, 0.15, 3.0], aim: [0, 0, 0], fov: 54 },
];

interface FilmDirectorProps {
  time: TimeSystem;
}

/**
 * Drives the entire film from scroll progress. The camera follows the one
 * continuous path (carrying the visitor); each scene's world state derives
 * from the same progress so the globe boots, routes appear, the Portal dives
 * through, the interior reveals, the hidden layer peels, and everything
 * collapses to the Single Route.
 *
 * Under reduced motion the camera still cuts between the film's still
 * compositions on scroll, but the world stays static (no routes, portal,
 * interior, or collapse) — the story is preserved as frames, not motion.
 */
export function FilmDirector({ time }: FilmDirectorProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const director = useMemo(() => new CameraDirector(camera).setTimeline(FILM_SHOTS), [camera]);

  useFrame((_s, rawDt) => {
    const dt = Math.min(rawDt, 0.05);

    if (reducedMotion) {
      director.seek(time.progress);
      worldState.boot = 1;
      worldState.routes = 0;
      worldState.portal = 0;
      worldState.interior = 0;
      worldState.hidden = 0;
      worldState.collapse = 0;
      worldState.survivorIndex = -1;
      worldState.film = time.progress;
      time.tick(dt);
      return;
    }

    const p = time.progress;
    director.seek(p);
    time.tick(dt);
    worldState.film = p;

    worldState.boot = smoothstep(0.0, 0.13, p);
    worldState.routes = smoothstep(0.16, 0.3, p);
    worldState.portal = smoothstep(0.46, 0.58, p);
    worldState.interior = smoothstep(0.5, 0.62, p);
    worldState.hidden = smoothstep(0.73, 0.82, p);
    worldState.collapse = smoothstep(0.84, 0.92, p);
    if (worldState.collapse > 0 && worldState.survivorIndex < 0) {
      worldState.survivorIndex = 0;
    }
  });

  return null;
}
