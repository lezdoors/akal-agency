import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GlobeScene } from "@/scene/GlobeScene";
import { InteractionLayer } from "@/scene/InteractionLayer";
import { Adaptivity } from "@/components/GlobeStage/Adaptivity";
import { Diagnostics } from "@/components/Diagnostics/Diagnostics";
import { FilmDirector } from "@/film/FilmDirector";
import { updatePointer, resetPointer } from "@/lib/pointerState";
import { FpsMeter } from "@/lib/fps";
import { LiveStats } from "@/lib/liveStats";
import { PALETTE } from "@/lib/palette";
import { perf, reducedMotion, rootSeed, time } from "@/session";
import { TimeSystem } from "@/systems/time/TimeSystem";

/**
 * Advances the one shared clock + writes live render diagnostics each frame.
 * (Only while the canvas is active — hidden tabs stop the loop via Adaptivity.)
 */
function ClockDriver({ time }: { time: TimeSystem }) {
  const gl = useThree((s) => s.gl);
  const meter = useRef(new FpsMeter(0.4));
  const last = useRef(0);

  useFrame((_s, dt) => {
    time.tick(Math.min(dt, 0.05));
    const t = performance.now();
    if (last.current) meter.current.sample((t - last.current) / 1000);
    last.current = t;
    const info = (gl as unknown as {
      info: { render?: { calls?: number; triangles?: number } };
    }).info;
    LiveStats.fps = meter.current.fps;
    LiveStats.frameMs = meter.current.frameMs;
    LiveStats.calls = info?.render?.calls ?? 0;
    LiveStats.triangles = info?.render?.triangles ?? 0;
    LiveStats.tier = perf.resolve();
  });

  return null;
}

/**
 * The world, directed. One fixed full-viewport WebGL stage behind the page.
 * The CameraDirector owns the camera; the interaction is gated to a handhold
 * in Scene 1 so nothing competes with the opening.
 */
export function GlobeStage() {
  const tier = perf.resolve();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Start at a safe budget; grow only on proven performance (see Adaptivity).
  const [cap, setCap] = useState<number>(0.2);
  const onAdapt = useCallback((next: number) => setCap(next), []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      updatePointer(e.clientX - r.left, e.clientY - r.top, r.width, r.height);
    };
    const onLeave = () => resetPointer();
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="globe-stage" aria-hidden="true">
      <Canvas
        dpr={perf.dpr()}
        gl={{
          antialias: tier !== "low" && tier !== "reduced",
          powerPreference: "high-performance",
        }}
        camera={{ fov: 45, near: 0.05, far: 120, position: [0, 0, 7.4] }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <color attach="background" args={[PALETTE.ground]} />
        <ClockDriver time={time} />
        <Adaptivity cap={cap} onAdapt={onAdapt} />
        {/* The director — owns the camera and drives Scene 1. */}
        <FilmDirector time={time} />
        <GlobeScene
          time={time}
          rootSeed={rootSeed}
          features={perf.features()}
          reduced={reducedMotion}
          capScale={cap}
        />
        <InteractionLayer
          time={time}
          rootSeed={rootSeed}
          tier={tier}
          reduced={reducedMotion}
          enableQualification={false}
        />
      </Canvas>
      <Diagnostics />
    </div>
  );
}
