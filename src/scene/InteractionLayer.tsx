import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ChordLayer } from "@/scene/ChordLayer";
import type { ChordClock } from "@/scene/ChordLayer";
import { SeedSystem } from "@/systems/seed/SeedSystem";
import { QualifyController } from "@/systems/qualify/QualifyController";
import { CameraSystem } from "@/systems/camera/CameraSystem";
import type { PerfTier } from "@/systems/renderer/RendererInterface";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { Vec3Spring } from "@/systems/weight/WeightLayer";
import { PointerState } from "@/lib/pointerState";
import { spherePoints } from "@/lib/geometry";
import { RGB } from "@/lib/palette";

const RADIUS = 1.9;
const DWELL_DIST = 0.62;
const DWELL_SPEED = 150; // px/s below which a stationary cursor counts as dwelling

const TARGET_COUNT: Record<PerfTier, number> = {
  high: 10,
  mid: 10,
  low: 5,
  reduced: 0,
};

const ACCENT = new THREE.Color(RGB.accent[0] / 255, RGB.accent[1] / 255, RGB.accent[2] / 255);

interface InteractionLayerProps {
  time: TimeSystem;
  rootSeed: number;
  tier: PerfTier;
  reduced: boolean;
}

/**
 * Phase 2 interaction over the globe:
 *  - CursorField: a sprung reticle tracks the pointer on the sphere surface.
 *  - Dwell-charge: holding it still over a lead fills the qualification ring.
 *  - Lock: at full charge the reticle springs onto the lead.
 *  - Chord of Futures + sprung reroute: the lead forks, resolves to a survivor.
 *  - CameraSystem: the camera leans in on the lock like heavy physical mass.
 * Everything mutates refs inside useFrame; React only re-renders on a lock.
 */
export function InteractionLayer({
  time,
  rootSeed,
  tier,
  reduced,
}: InteractionLayerProps) {
  const { camera } = useThree();

  const nLeads = TARGET_COUNT[tier];
  const interactive = !reduced && nLeads > 0;

  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);
  const leads = useMemo(() => {
    if (nLeads === 0) return [] as THREE.Vector3[];
    const flat = spherePoints(nLeads, RADIUS, seed.stream("leads"));
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < nLeads; i++) {
      out.push(new THREE.Vector3(flat[i * 3], flat[i * 3 + 1], flat[i * 3 + 2]));
    }
    return out;
  }, [nLeads, seed]);

  const controller = useMemo(() => new QualifyController(rootSeed), [rootSeed]);
  const cameraRig = useMemo(() => new CameraSystem([0, 0, 6.2]), []);
  const reticleSpring = useMemo(() => new Vec3Spring([0, 0, RADIUS], "reticle"), []);

  const reticleRef = useRef<THREE.Group>(null);
  const chargeRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const leadMeshes = useRef<(THREE.Mesh | null)[]>([]);

  const [anchor, setAnchor] = useState<THREE.Vector3 | null>(null);
  const chordClock = useRef<ChordClock>({ survivor: 0, travel: 0, resolved: false });
  const prevState = useRef<string>("idle");
  const lastProgress = useRef(0);

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), RADIUS), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const surface = useMemo(() => new THREE.Vector3(0, 0, RADIUS), []);
  const origin = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    reticleSpring.snap([0, 0, RADIUS]);
    cameraRig.snapTo([0, 0, 6.2]);
  }, [reticleSpring, cameraRig]);

  useFrame((_s, rawDt) => {
    if (!interactive) return;
    const dt = Math.min(rawDt, 0.05);

    // World-space point on the sphere under the pointer.
    ndc.set(PointerState.nx, PointerState.ny);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectSphere(sphere, hit)) surface.copy(hit);
    else {
      ray.ray.closestPointToPoint(origin, surface);
      if (surface.lengthSq() > 1e-6) surface.setLength(RADIUS);
      else surface.set(0, 0, RADIUS);
    }

    // Nearest lead + pointer stillness → dwelling.
    let nearest = -1;
    let nearestDist = Infinity;
    for (let i = 0; i < leads.length; i++) {
      const d = surface.distanceTo(leads[i]);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }
    const speed = Math.hypot(PointerState.vx, PointerState.vy);
    const dwelling =
      PointerState.active && speed < DWELL_SPEED && nearest >= 0 && nearestDist < DWELL_DIST;

    // Scroll direction → chord travel (reverse scroll rewinds).
    const progressDelta = time.progress - lastProgress.current;
    lastProgress.current = time.progress;
    const dir = progressDelta < -0.0005 ? -1 : 1;

    const autoCandidate = Math.max(0, Math.floor(time.world * 0.5) % Math.max(1, nLeads));
    controller.tick(dt, {
      dwelling,
      targetIndex: dwelling ? nearest : autoCandidate,
      progressDelta: dir,
      autoAdvance: !reduced && tier !== "low",
    });

    const s = controller.state;
    // Anchor the chord on lock; release it back to idle.
    if (s === "locked" || s === "resolved") {
      if (prevState.current !== s) {
        const lp = leads[controller.lockedIndex] ?? null;
        setAnchor(lp);
        chordClock.current = {
          survivor: controller.survivorIndex,
          travel: controller.travel,
          resolved: controller.resolved,
        };
      }
      chordClock.current.travel = controller.travel;
      chordClock.current.resolved = controller.resolved;
    } else if (prevState.current === "locked" || prevState.current === "resolved") {
      setAnchor(null);
      cameraRig.reset();
    }
    prevState.current = s;

    // Reticle follows pointer (or springs onto the locked lead).
    const locked = s === "locked" || s === "resolved";
    const rt: [number, number, number] = locked
      ? (() => {
          const lp = leads[controller.lockedIndex] ?? surface;
          return [lp.x, lp.y, lp.z];
        })()
      : [surface.x, surface.y, surface.z];
    reticleSpring.setTarget(rt);
    const rp = reticleSpring.step(dt);
    if (reticleRef.current) {
      reticleRef.current.position.set(rp[0], rp[1], rp[2]);
      reticleRef.current.lookAt(camera.position);
    }

    // Qualification ring.
    const charge = controller.charge01();
    if (chargeRef.current) {
      const mat = chargeRef.current.material as THREE.MeshBasicMaterial;
      const c = locked ? 0 : Math.max(0.05, charge);
      chargeRef.current.scale.setScalar(c);
      mat.opacity = locked ? Math.max(0, 1 - controller.travel) : 0.2 + 0.55 * c;
    }
    if (dotRef.current) {
      (dotRef.current.material as THREE.MeshBasicMaterial).opacity = locked ? 1 : 0.7;
    }

    // Lead highlight.
    for (let i = 0; i < leadMeshes.current.length; i++) {
      const m = leadMeshes.current[i];
      if (!m) continue;
      const isLead = controller.lockedIndex === i;
      (m.material as THREE.MeshBasicMaterial).opacity = isLead ? 1 : 0.6;
      const ts = isLead ? 1.7 : 1;
      m.scale.x += (ts - m.scale.x) * Math.min(1, dt * 8);
      m.scale.y = m.scale.x;
      m.scale.z = m.scale.x;
    }

    // Sprung camera lean.
    let ct: [number, number, number] = [0, 0, 6.2];
    if (locked) {
      const lp = leads[controller.lockedIndex] ?? null;
      if (lp) ct = [lp.x * 0.22, lp.y * 0.22, 6.2 - lp.z * 0.16];
      cameraRig.lookAt(origin);
    } else {
      cameraRig.reset();
    }
    cameraRig.target(ct);
    const cp = cameraRig.step(dt);
    camera.position.set(cp[0], cp[1], cp[2]);
    camera.lookAt(cameraRig.getLook());
  });

  if (!interactive) {
    return null;
  }

  return (
    <>
      <ChordLayer anchor={anchor} clock={chordClock} />

      {leads.map((lead, i) => (
        <mesh
          key={i}
          ref={(el) => {
            leadMeshes.current[i] = el;
          }}
          position={[lead.x, lead.y, lead.z]}
        >
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.6} />
        </mesh>
      ))}

      <group ref={reticleRef}>
        <mesh>
          <ringGeometry args={[0.78, 1.0, 40]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={chargeRef}>
          <ringGeometry args={[0.0, 0.8, 40]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={dotRef}>
          <circleGeometry args={[0.05, 20]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
