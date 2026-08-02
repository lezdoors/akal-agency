import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { GlobeScene } from "@/scene/GlobeScene";
import { Adaptivity } from "@/components/GlobeStage/Adaptivity";
import { updatePointer, resetPointer } from "@/lib/pointerState";
import { PALETTE } from "@/lib/palette";
import { perf, reducedMotion, rootSeed, time } from "@/session";

/** Advances the one shared clock on the render loop. */
function ClockDriver() {
  useFrame((_state, dt) => {
    time.tick(Math.min(dt, 0.05));
  });
  return null;
}

/**
 * The living world — one fixed full-viewport WebGL stage behind the page
 * content. Chapters scroll over it so the globe is the one continuous world.
 */
export function GlobeStage() {
  const tier = perf.resolve();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Adaptive particle-budget cap (1 = full tier budget). Downgraded once if
  // real FPS shows the device can't hold a usable rate (e.g. software WebGL).
  const [cap, setCap] = useState<number>(1);
  const onDowngrade = useCallback((scale: number) => {
    setCap((c) => Math.min(c, scale));
  }, []);

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
        <Adaptivity onDowngrade={onDowngrade} />
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
