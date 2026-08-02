import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { GlobeScene } from "@/scene/GlobeScene";
import { Adaptivity } from "@/components/GlobeStage/Adaptivity";
import { updatePointer, resetPointer } from "@/lib/pointerState";
import { PALETTE } from "@/lib/palette";
import { perf, reducedMotion, rootSeed, time } from "@/session";

/**
 * Advances the one shared clock on the render loop.
 * (Only while the canvas is active — hidden tabs stop the loop via Adaptivity.)
 */
function ClockDriver() {
  useFrame((_state, dt) => {
    time.tick(Math.min(dt, 0.05));
  });
  return null;
}

/**
 * The living world — one fixed full-viewport WebGL stage behind the page
 * content. Chapters scroll over it so the globe is the one continuous world.
 *
 * The particle budget starts low (safe even on software WebGL) and Adaptivity
 * grows it toward the tier budget only when sustained FPS proves a real GPU.
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
        camera={{ fov: 45, near: 0.05, far: 120, position: [0, 0, 6] }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <color attach="background" args={[PALETTE.ground]} />
        <ClockDriver />
        <Adaptivity cap={cap} onAdapt={onAdapt} />
        <GlobeScene
          time={time}
          rootSeed={rootSeed}
          features={perf.features()}
          reduced={reducedMotion}
          capScale={cap}
        />
      </Canvas>
    </div>
  );
}
