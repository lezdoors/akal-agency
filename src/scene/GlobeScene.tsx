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
import { smoothstep, clamp01 } from "@/lib/math";
import { RGB } from "@/lib/palette";
import { LiveStats } from "@/lib/liveStats";
import { worldState } from "@/film/state";
import type { BlendMode } from "@/diag";

export interface GlobeSceneProps {
  time: TimeSystem;
  rootSeed: number;
  features: TierFeatures;
  reduced: boolean;
  capScale: number;
  blend: BlendMode;
  opacityScale: number;
}

const BASE_COUNT = 86000;
const ROUTES = 8;
const V = new THREE.Vector3();

function clampAngle(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.acos(clamp01(a.dot(b)));
}

function arcStrip(rng: () => number, radius: number, segs = 40): THREE.BufferGeometry {
  const a = new THREE.Vector3().setFromSphericalCoords(1, Math.acos(2 * rng() - 1), rng() * Math.PI * 2);
  const b = new THREE.Vector3().setFromSphericalCoords(1, Math.acos(2 * rng() - 1), rng() * Math.PI * 2);
  const pull = clampAngle(a, b);
  const pts = new Float32Array((segs + 1) * 3);
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    V.copy(a).lerp(b, t).normalize().multiplyScalar(radius * (1.01 + Math.sin(t * Math.PI) * 0.02 * (1 + pull * 0.4)));
    pts[i * 3] = V.x;
    pts[i * 3 + 1] = V.y;
    pts[i * 3 + 2] = V.z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  return g;
}

export function GlobeScene({ time, rootSeed, features, reduced, capScale, blend, opacityScale }: GlobeSceneProps) {
  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);
  const seedStream = useMemo(() => seed.stream("globe.field"), [seed]);
  const innerSeedStream = useMemo(() => seed.stream("globe.interior"), [seed]);
  const blendMode = blend === "normal" ? THREE.NormalBlending : THREE.AdditiveBlending;

  const count = useMemo(
    () => Math.max(3000, Math.round(BASE_COUNT * features.particleScale * capScale)),
    [features.particleScale, capScale]
  );
  const innerCount = useMemo(
    () => Math.max(1200, Math.round(BASE_COUNT * 0.45 * features.particleScale * capScale)),
    [features.particleScale, capScale]
  );

  const spin = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const outerMat = useRef<THREE.ShaderMaterial>(null);
  const innerMat = useRef<THREE.ShaderMaterial>(null);

  const color = useMemo(() => new THREE.Color(RGB.accent[0] / 255, RGB.accent[1] / 255, RGB.accent[2] / 255), []);
  const drift = useMemo(() => new Vec3Spring([0, 0, 0], "cursor"), []);

  const routes = useMemo(() => {
    const rng = seed.stream("routes");
    return Array.from({ length: ROUTES }, (_, i) => {
      const line = new THREE.Line(
        arcStrip(rng, 1.9),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      line.frustumCulled = false;
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      );
      packet.frustumCulled = false;
      return { line, packet, i };
    });
  }, [seed, color]);
  const routesRef = useRef(routes);
  routesRef.current = routes;

  const core = useMemo(
    () =>
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false }),
    [color]
  );
  const coreRef = useRef(core);
  coreRef.current = core;

  // Publish live counts for the diagnostics panel.
  LiveStats.pointCount = count + innerCount;
  LiveStats.routeCount = ROUTES;

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const ws = worldState;

    if (reduced) {
      if (outerMat.current) outerMat.current.uniforms.uOpacity.value = 0.55 * opacityScale;
      if (coreRef.current) coreRef.current.opacity = 0.08 * opacityScale;
      if (innerMat.current) innerMat.current.uniforms.uOpacity.value = 0;
      return;
    }

    if (outerMat.current) {
      outerMat.current.uniforms.uTime.value = time.world;
      const boot = smoothstep(0.02, 0.8, ws.boot);
      outerMat.current.uniforms.uOpacity.value = (0.2 + 0.8 * boot) * 0.72 * opacityScale * (1 - ws.interior * 0.55);
      outerMat.current.uniforms.uSize.value = 3.0 * (0.6 + 0.4 * boot);
    }
    if (coreRef.current) {
      coreRef.current.opacity = (0.02 + 0.1 * smoothstep(0.3, 1, ws.boot)) * opacityScale * (1 - ws.interior * 0.8);
    }
    if (innerMat.current) {
      innerMat.current.uniforms.uTime.value = time.world;
      innerMat.current.uniforms.uOpacity.value = 0.5 * ws.interior * opacityScale;
    }

    const survivor = ws.survivorIndex;
    for (const r of routesRef.current) {
      const lm = r.line.material as THREE.LineBasicMaterial;
      const pm = r.packet.material as THREE.MeshBasicMaterial;
      const isSurvivor = r.i === survivor;
      const base = ws.routes * (isSurvivor ? 1 : 1 - smoothstep(0, 0.9, ws.collapse));

      if (isSurvivor && ws.collapse > 0) {
        const tt = smoothstep(0, 1, ws.collapse);
        r.packet.position.lerp(new THREE.Vector3(0, 0, 0), tt);
        pm.opacity = 0.9 * smoothstep(0.2, 1, ws.collapse);
        lm.opacity = 0.26 * (1 - tt);
      } else {
        const arr = r.line.geometry.getAttribute("position").array as unknown as number[];
        const idx = (Math.floor(((time.world * 0.15 + r.i * 0.7) % 1) * 40) * 3) % arr.length;
        r.packet.position.set(arr[idx], arr[idx + 1], arr[idx + 2]);
        pm.opacity = 0.8 * base;
        lm.opacity = 0.2 * base;
      }
    }

    const target: [number, number, number] = [PointerState.ny * 0.05, PointerState.nx * 0.08, 0];
    drift.setTarget(target);
    const [rx, rz] = drift.step(dt);
    if (parallax.current) {
      parallax.current.rotation.x = rx;
      parallax.current.rotation.z = rz;
    }
    if (spin.current) spin.current.rotation.y = time.world * 0.008;
  });

  return (
    <group ref={parallax}>
      <mesh>
        <sphereGeometry args={[1.66, 48, 32]} />
        <primitive object={core} attach="material" />
      </mesh>
      <group ref={spin}>
        <GlobeField count={count} radius={1.9} seedStream={seedStream} color={color} materialRef={outerMat as Ref<THREE.ShaderMaterial>} blending={blendMode} />
        {routes.map((r) => (
          <primitive key={r.i} object={r.line} />
        ))}
        {routes.map((r) => (
          <primitive key={r.i} object={r.packet} />
        ))}
        <GlobeField count={innerCount} radius={1.02} seedStream={innerSeedStream} color={color} materialRef={innerMat as Ref<THREE.ShaderMaterial>} blending={blendMode} opacity={0.6} />
      </group>
    </group>
  );
}
