import { useMemo, useRef } from "react";
import type { Ref } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { GlobeField } from "@/components/globe/GlobeField";
import { SeedSystem } from "@/systems/seed/SeedSystem";
import type { TierFeatures } from "@/systems/renderer/PerformanceTierSystem";
import type { PerfTier } from "@/systems/renderer/RendererInterface";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { Vec3Spring } from "@/systems/weight/WeightLayer";
import { PointerState } from "@/lib/pointerState";
import { smoothstep, clamp01 } from "@/lib/math";
import { RGB } from "@/lib/palette";
import { LiveStats } from "@/lib/liveStats";
import { worldState } from "@/film/state";

export interface GlobeSceneProps {
  time: TimeSystem;
  rootSeed: number;
  features: TierFeatures;
  reduced: boolean;
  capScale: number;
  opacityScale: number;
  tier: PerfTier;
}

const BASE_COUNT = 86000;
const ROUTES = 8;
const V = new THREE.Vector3();

interface Look {
  dark: number;
  bodyOpacity: number;
  bodySize: number;
  structuralSize: number;
  structuralOpacity: number;
  halo: number;
  routeOpacity: number;
  packetGlow: number;
}

/**
 * Quality tiers are tuned independently as ART DIRECTION, not just counts.
 * All tiers keep a dark body, readable points, visible routes, depth,
 * hierarchy and a clean silhouette; high/mid add detail and atmosphere.
 */
const LOOK: Record<PerfTier, Look> = {
  high: { dark: 0.5, bodyOpacity: 0.5, bodySize: 2.5, structuralSize: 4.8, structuralOpacity: 0.95, halo: 0.1, routeOpacity: 0.5, packetGlow: 1.0 },
  mid: { dark: 0.5, bodyOpacity: 0.45, bodySize: 2.3, structuralSize: 4.3, structuralOpacity: 0.9, halo: 0.08, routeOpacity: 0.44, packetGlow: 0.9 },
  low: { dark: 0.48, bodyOpacity: 0.42, bodySize: 2.1, structuralSize: 3.9, structuralOpacity: 0.85, halo: 0.055, routeOpacity: 0.38, packetGlow: 0.8 },
  reduced: { dark: 0.5, bodyOpacity: 0.45, bodySize: 2.3, structuralSize: 0, structuralOpacity: 0, halo: 0.05, routeOpacity: 0.34, packetGlow: 0.7 },
};

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

export function GlobeScene({ time, rootSeed, features, reduced, capScale, opacityScale, tier }: GlobeSceneProps) {
  const look = LOOK[tier];
  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);
  const seedStream = useMemo(() => seed.stream("globe.field"), [seed]);
  const structuralStream = useMemo(() => seed.stream("globe.structural"), [seed]);
  const innerSeedStream = useMemo(() => seed.stream("globe.interior"), [seed]);

  const bodyCount = useMemo(
    () => Math.max(3000, Math.round(BASE_COUNT * features.particleScale * capScale)),
    [features.particleScale, capScale]
  );
  const structuralCount = useMemo(
    () => (look.structuralSize > 0 ? Math.max(0, Math.round(bodyCount * 0.05)) : 0),
    [bodyCount, look.structuralSize]
  );
  const innerCount = useMemo(
    () => Math.max(1200, Math.round(BASE_COUNT * 0.45 * features.particleScale * capScale)),
    [features.particleScale, capScale]
  );

  const spin = useRef<THREE.Group>(null);
  const parallax = useRef<THREE.Group>(null);
  const ambientMat = useRef<THREE.ShaderMaterial>(null);
  const structuralMat = useRef<THREE.ShaderMaterial>(null);
  const innerMat = useRef<THREE.ShaderMaterial>(null);

  const color = useMemo(() => new THREE.Color(RGB.accent[0] / 255, RGB.accent[1] / 255, RGB.accent[2] / 255), []);
  const darkColor = useMemo(() => new THREE.Color(0.035, 0.055, 0.085), []);
  const drift = useMemo(() => new Vec3Spring([0, 0, 0], "cursor"), []);

  const routes = useMemo(() => {
    const rng = seed.stream("routes");
    return Array.from({ length: ROUTES }, (_, i) => {
      const line = new THREE.Line(
        arcStrip(rng, 1.9),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthTest: false,
          depthWrite: false,
        })
      );
      line.renderOrder = 20;
      line.frustumCulled = false;
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 10),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthTest: false })
      );
      packet.renderOrder = 21;
      packet.frustumCulled = false;
      return { line, packet, i };
    });
  }, [seed, color]);
  const routesRef = useRef(routes);
  routesRef.current = routes;

  const dark = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: darkColor,
        transparent: true,
        opacity: 0,
        side: THREE.FrontSide,
        depthWrite: false,
      }),
    [darkColor]
  );
  const halo = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [color]
  );

  LiveStats.pointCount = bodyCount + structuralCount + innerCount;
  LiveStats.routeCount = ROUTES;

  useFrame((_state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const ws = worldState;

    if (reduced) {
      if (ambientMat.current) ambientMat.current.uniforms.uOpacity.value = look.bodyOpacity * opacityScale;
      if (structuralMat.current) structuralMat.current.uniforms.uOpacity.value = look.structuralOpacity;
      if (innerMat.current) innerMat.current.uniforms.uOpacity.value = 0;
      dark.opacity = look.dark;
      halo.opacity = look.halo;
      return;
    }

    const boot = smoothstep(0.02, 0.8, ws.boot);
    const reveal = 1 - ws.interior * 0.9;

    if (ambientMat.current) {
      ambientMat.current.uniforms.uTime.value = time.world;
      ambientMat.current.uniforms.uOpacity.value = boot * look.bodyOpacity * opacityScale * (1 - ws.interior * 0.4);
      ambientMat.current.uniforms.uSize.value = look.bodySize;
    }
    if (structuralMat.current) {
      structuralMat.current.uniforms.uTime.value = time.world;
      structuralMat.current.uniforms.uOpacity.value = boot * look.structuralOpacity;
    }
    if (innerMat.current) {
      innerMat.current.uniforms.uTime.value = time.world;
      innerMat.current.uniforms.uOpacity.value = 0.5 * ws.interior * opacityScale;
    }
    dark.opacity = look.dark * reveal;
    halo.opacity = look.halo * boot;

    const survivor = ws.survivorIndex;
    for (const r of routesRef.current) {
      const lm = r.line.material as THREE.LineBasicMaterial;
      const pm = r.packet.material as THREE.MeshBasicMaterial;
      const isSurvivor = r.i === survivor;
      const isActive = r.i === 0;
      const base = ws.routes * (isSurvivor ? 1 : 1 - smoothstep(0, 0.9, ws.collapse));
      const emphasis = isSurvivor ? 1 : isActive ? 0.7 : 1;

      if (isSurvivor && ws.collapse > 0) {
        const tt = smoothstep(0, 1, ws.collapse);
        r.packet.position.lerp(new THREE.Vector3(0, 0, 0), tt);
        pm.opacity = look.packetGlow * 0.9 * smoothstep(0.2, 1, ws.collapse);
        lm.opacity = 0.4 * look.routeOpacity * (1 - tt);
      } else {
        const arr = r.line.geometry.getAttribute("position").array as unknown as number[];
        const idx = (Math.floor(((time.world * 0.15 + r.i * 0.7) % 1) * 40) * 3) % arr.length;
        r.packet.position.set(arr[idx], arr[idx + 1], arr[idx + 2]);
        pm.opacity = look.packetGlow * 0.95 * base;
        lm.opacity = look.routeOpacity * 0.5 * emphasis * base;
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
        <sphereGeometry args={[1.68, 48, 32]} />
        <primitive object={dark} attach="material" />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.02, 48, 32]} />
        <primitive object={halo} attach="material" />
      </mesh>
      <group ref={spin}>
        <GlobeField count={bodyCount} radius={1.9} seedStream={seedStream} color={color} materialRef={ambientMat as Ref<THREE.ShaderMaterial>} blending={THREE.NormalBlending} size={look.bodySize} opacity={0.45} />
        {structuralCount > 0 && (
          <GlobeField count={structuralCount} radius={1.9} seedStream={structuralStream} color={color} materialRef={structuralMat as Ref<THREE.ShaderMaterial>} blending={THREE.NormalBlending} size={look.structuralSize} opacity={look.structuralOpacity} />
        )}
        {routes.map((r) => (
          <primitive key={r.i} object={r.line} />
        ))}
        {routes.map((r) => (
          <primitive key={r.i} object={r.packet} />
        ))}
        <GlobeField count={innerCount} radius={1.02} seedStream={innerSeedStream} color={color} materialRef={innerMat as Ref<THREE.ShaderMaterial>} blending={THREE.NormalBlending} size={2.2} opacity={0.4} />
      </group>
    </group>
  );
}
