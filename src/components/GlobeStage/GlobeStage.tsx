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
import { dbg, lockBudget } from "@/diag";
import { TimeSystem } from "@/systems/time/TimeSystem";

function ClockDriver({ time, cap }: { time: TimeSystem; cap: number }) {
  const gl = useThree((s) => s.gl);
  const meter = useRef(new FpsMeter(0.4));
  const last = useRef(0);
  useFrame((_s, dt) => {
    time.tick(Math.min(dt, 0.05));
    const t = performance.now();
    if (last.current) meter.current.sample((t - last.current) / 1000);
    last.current = t;
    const info = (gl as unknown as { info: { render?: { calls?: number; triangles?: number } } }).info;
    LiveStats.fps = meter.current.fps;
    LiveStats.frameMs = meter.current.frameMs;
    LiveStats.calls = info?.render?.calls ?? 0;
    LiveStats.triangles = info?.render?.triangles ?? 0;
    LiveStats.tier = perf.resolve();
    LiveStats.cap = cap;
  });
  return null;
}

export function GlobeStage() {
  const tier = perf.resolve();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cap, setCap] = useState<number>(dbg.cap ?? 0.2);
  const onAdapt = useCallback((next: number) => {
    if (!lockBudget) setCap(next);
  }, []);
  const [glOK] = useState<boolean>(() => {
    try {
      const c = document.createElement("canvas");
      return !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  });

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
    <div ref={wrapRef} className={`globe-stage${glOK ? "" : " no-webgl"}`} aria-hidden="true">
      {glOK && (
        <Canvas
          dpr={perf.dpr()}
          gl={{ antialias: tier !== "low" && tier !== "reduced", powerPreference: "high-performance" }}
          camera={{ fov: 40, near: 0.05, far: 60, position: [0, 1.15, 9.6] }}
          onCreated={({ gl }) => {
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            LiveStats.colorSpace = "srgb";
            LiveStats.toneMapping = "aces";
            LiveStats.blend = dbg.blend;
            LiveStats.exposure = dbg.opacity;
            LiveStats.reduced = reducedMotion;
          }}
        >
          <color attach="background" args={[PALETTE.ground]} />
          <ClockDriver time={time} cap={cap} />
          <Adaptivity cap={cap} onAdapt={onAdapt} />
          <FilmDirector time={time} />
          <GlobeScene
            time={time}
            rootSeed={rootSeed}
            features={perf.features()}
            reduced={reducedMotion}
            capScale={cap}
            blend={dbg.blend}
            opacityScale={dbg.opacity}
          />
          <InteractionLayer
            time={time}
            rootSeed={rootSeed}
            tier={tier}
            reduced={reducedMotion}
            enableQualification
          />
        </Canvas>
      )}
      <Diagnostics />
    </div>
  );
}
