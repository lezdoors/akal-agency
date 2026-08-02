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
import { quadStrip } from "@/lib/geometry";
import { smoothstep } from "@/lib/math";
import { RGB, PALETTE } from "@/lib/palette";
import { worldState } from "@/film/state";

export interface GlobeSceneProps {
  time: TimeSystem;
  rootSeed: number;
  features: TierFeatures;
  reduced: boolean;
  /** Adaptive particle-budget cap — 1 = full tier budget, stepped down by Adaptivity. */
  capScale: number;
}

/** High-tier instanced budget; scaled down by the quality tier. */
const BASE_COUNT = 90000;

/**
 * The world. Scene 1 makes it *boot*: on entry the field densifies from a haze
 * into the full globe, breathing on the world clock and drifting with the
 * cursor; one faint arc traces as a promise. Reverse scroll rewinds the boot.
 */
export function GlobeScene({
  time,
  rootSeed,
  features,
  reduced,
  capScale,
}: GlobeSceneProps) {
  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);
  const seedStream = useMemo(() => seed.stream("globe.field"), [seed]);

  const count = useMemo(
    () =>
      Math.max(2000, Math.round(BASE_COUNT * features.particleScale * capScale)),
    [features.particleScale, capScale]
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

  // Scene 1's "first arc" — a faint route over the surface, a promise drawn
  // as the boot completes.
  const arc = useMemo(() => {
    if (reduced) return null;
    const p0 = new THREE.Vector3(1.05, 0.55, 1.3);
    const p2 = new THREE.Vector3(-0.55, 1.5, 0.95);
    const ctrl = p0.clone().add(p2).multiplyScalar(0.5);
    ctrl.set(ctrl.x, ctrl.y + 0.95, ctrl.z);
    const strip = quadStrip(
      [p0.x, p0.y, p0.z],
      [ctrl.x, ctrl.y, ctrl.z],
      [p2.x, p2.y, p2.z],
      28
    );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(strip, 3));
    const line = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(PALETTE.accent),
        transparent: true,
        opacity: 0,
      })
    );
    line.frustumCulled = false;
    return line;
  }, [reduced]);

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const mat = material.current;

    if (reduced) {
      if (mat) mat.uniforms.uTime.value = 0;
      return;
    }

    if (mat) {
      mat.uniforms.uTime.value = time.world;
      const boot = smoothstep(0.05, 0.82, worldState.boot);
      mat.uniforms.uOpacity.value = (0.15 + 0.85 * boot) * 0.7;
      mat.uniforms.uSize.value = 2.2 * (0.45 + 0.55 * smoothstep(0.1, 0.9, worldState.boot));
    }

    // The first arc draws in as the world completes, then stays faint.
    if (arc) {
      (arc.material as THREE.LineBasicMaterial).opacity =
        0.5 * smoothstep(0.8, 0.95, worldState.boot);
    }

    // Pointer parallax — sprung, then halved for calm.
    const target: [number, number, number] = [
      PointerState.ny * 0.05,
      PointerState.nx * 0.08,
      0,
    ];
    drift.setTarget(target);
    const [rx, rz] = drift.step(dt);

    const s = spin.current;
    const p = parallax.current;
    if (s) {
      // Very slow autonomous spin; the world turns itself even when still.
      s.rotation.y = time.world * 0.008;
    }
    if (p) {
      p.rotation.x = rx;
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
        {arc ? <primitive object={arc} /> : null}
      </group>
    </group>
  );
}