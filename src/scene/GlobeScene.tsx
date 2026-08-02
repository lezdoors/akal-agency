import { useMemo, useRef } from "react";
import type { Ref } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GlobeField } from "@/components/globe/GlobeField";
import { SeedSystem } from "@/systems/seed/SeedSystem";
import type { TierFeatures } from "@/systems/renderer/PerformanceTierSystem";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { Vec3Spring } from "@/systems/weight/WeightLayer";
import { PointerState } from "@/lib/pointerState";
import { RGB } from "@/lib/palette";

export interface GlobeSceneProps {
  time: TimeSystem;
  rootSeed: number;
  features: TierFeatures;
  reduced: boolean;
}

/** High-tier instanced budget; scaled down by the quality tier. */
const BASE_COUNT = 90000;

/**
 * The living globe: one tier-scaled opportunity point field that breathes with
 * the world clock, drifts with the cursor (sprung via WeightLayer), and turns
 * as the visitor scrolls. Reduced-motion renders a static field.
 */
export function GlobeScene({ time, rootSeed, features, reduced }: GlobeSceneProps) {
  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);

  // Deterministic field layout from the session root.
  const seedStream = useMemo(() => seed.stream("globe.field"), [seed]);

  // Tier-scaled budget.
  const count = useMemo(
    () => Math.max(2000, Math.round(BASE_COUNT * features.particleScale)),
    [features.particleScale]
  );

  const spin = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  // Sprung pointer drift, governed by the shared cursor tune.
  const drift = useMemo(() => new Vec3Spring([0, 0, 0], "cursor"), []);

  const color = useMemo(
    () =>
      new THREE.Color(
        RGB.accent[0] / 255,
        RGB.accent[1] / 255,
        RGB.accent[2] / 255
      ),
    []
  );

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mat = material.current;

    if (reduced) {
      if (mat) mat.uniforms.uTime.value = 0;
      return;
    }

    if (mat) mat.uniforms.uTime.value = time.world;

    // Pointer parallax — sprung, then halved for calm.
    const folk: [number, number, number] = [
      PointerState.ny * 0.1,
      PointerState.nx * 0.16,
      0,
    ];
    drift.setTarget(folk);
    const [rx, rz] = drift.step(dt);

    const s = spin.current;
    const p = parallax.current;
    if (s) {
      // Slow autonomous spin, with scroll adding travel (world turns as you read).
      s.rotation.y = time.world * 0.02 + time.progress * Math.PI * 1.6;
    }
    if (p) {
      p.rotation.x = rx + Math.sin(time.world * 0.06) * 0.015;
      p.rotation.z = rz;
    }
  });

  return (
    <group ref={parallax}>
      <group ref={spin}>
        <GlobeField
          count={count}
          radius={1.9}
          seedStream={seedStream}
          color={color}
          materialRef={material as Ref<THREE.ShaderMaterial>}
        />
      </group>
    </group>
  );
}
