import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ChordLayer } from "@/scene/ChordLayer";
import type { ChordClock } from "@/scene/ChordLayer";
import { SeedSystem } from "@/systems/seed/SeedSystem";
import { QualifyController } from "@/systems/qualify/QualifyController";
import type { PerfTier } from "@/systems/renderer/RendererInterface";
import { TimeSystem } from "@/systems/time/TimeSystem";
import { Vec3Spring } from "@/systems/weight/WeightLayer";
import { PointerState } from "@/lib/pointerState";
import { spherePoints } from "@/lib/geometry";
import { RGB } from "@/lib/palette";
import { worldState } from "@/film/state";

const RADIUS = 1.9;
const DWELL_DIST = 0.62;
const DWELL_SPEED = 150;

const TARGET_COUNT: Record<PerfTier, number> = { high: 10, mid: 10, low: 5, reduced: 0 };
const ACCENT = new THREE.Color(RGB.accent[0] / 255, RGB.accent[1] / 255, RGB.accent[2] / 255);

interface InteractionLayerProps {
  time: TimeSystem;
  rootSeed: number;
  tier: PerfTier;
  reduced: boolean;
  enableQualification: boolean;
}

/**
 * Qualification interaction (Instrument scene). The camera is owned by the
 * director; this layer only handles the reticle, dwell-charge, lock and Chord.
 * It also guarantees the qualification plays at the Instrument beat so the
 * route/deliver language is always shown, even for a passive visitor.
 */
export function InteractionLayer({
  time,
  rootSeed,
  tier,
  reduced,
  enableQualification,
}: InteractionLayerProps) {
  const { camera } = useThree();
  const nLeads = TARGET_COUNT[tier];
  const interactive = !reduced && nLeads > 0;

  const seed = useMemo(() => new SeedSystem(rootSeed), [rootSeed]);
  const leads = useMemo(() => {
    if (nLeads === 0) return [] as THREE.Vector3[];
    const flat = spherePoints(nLeads, RADIUS, seed.stream("leads"));
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < nLeads; i++) out.push(new THREE.Vector3(flat[i * 3], flat[i * 3 + 1], flat[i * 3 + 2]));
    return out;
  }, [nLeads, seed]);

  const controller = useMemo(() => new QualifyController(rootSeed), [rootSeed]);
  const reticleSpring = useMemo(() => new Vec3Spring([0, 0, RADIUS], "reticle"), []);
  const autoLocked = useRef(false);
  const chordClock = useRef<ChordClock>({ survivor: 0, travel: 0, resolved: false });
  const prevState = useRef<string>("idle");
  const lastProgress = useRef(0);

  const reticleRef = useRef<THREE.Group>(null);
  const chargeRef = useRef<THREE.Mesh>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const lockRef = useRef<THREE.Mesh>(null);
  const leadMeshes = useRef<(THREE.Mesh | null)[]>([]);

  const [anchor, setAnchor] = useState<THREE.Vector3 | null>(null);

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(0, 0, 0), RADIUS), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const surface = useMemo(() => new THREE.Vector3(0, 0, RADIUS), []);
  const origin = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    reticleSpring.snap([0, 0, RADIUS]);
  }, [reticleSpring]);

  useFrame((_s, rawDt) => {
    if (!interactive) return;
    const dt = Math.min(rawDt, 0.05);

    ndc.set(PointerState.nx, PointerState.ny);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectSphere(sphere, hit)) surface.copy(hit);
    else {
      ray.ray.closestPointToPoint(origin, surface);
      if (surface.lengthSq() > 1e-6) surface.setLength(RADIUS);
      else surface.set(0, 0, RADIUS);
    }

    if (!enableQualification) {
      reticleSpring.setTarget([surface.x, surface.y, surface.z]);
      const rp = reticleSpring.step(dt);
      if (reticleRef.current) {
        reticleRef.current.position.set(rp[0], rp[1], rp[2]);
        reticleRef.current.lookAt(camera.position);
      }
      if (chargeRef.current) (chargeRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      if (lockRef.current) (lockRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      if (dotRef.current) (dotRef.current.material as THREE.MeshBasicMaterial).opacity = 0.7;
      return;
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
    const dwelling = PointerState.active && speed < DWELL_SPEED && nearest >= 0 && nearestDist < DWELL_DIST;

    const progressDelta = time.progress - lastProgress.current;
    lastProgress.current = time.progress;
    const dir = progressDelta < -0.0005 ? -1 : 1;

    // Guarantee the qualification is shown at the Instrument beat.
    if (!autoLocked.current && worldState.film >= 0.335 && worldState.film <= 0.47) {
      autoLocked.current = true;
      controller.lock(0);
    }

    const autoCandidate = Math.max(0, Math.floor(time.world * 0.5) % Math.max(1, nLeads));
    controller.tick(dt, {
      dwelling,
      targetIndex: dwelling ? nearest : autoCandidate,
      progressDelta: dir,
      autoAdvance: !reduced && tier !== "low",
    });

    const s = controller.state;
    if (s === "locked" || s === "resolved") {
      if (prevState.current !== s) {
        const lp = leads[controller.lockedIndex] ?? null;
        setAnchor(lp);
        chordClock.current = { survivor: controller.survivorIndex, travel: controller.travel, resolved: controller.resolved };
      }
      chordClock.current.travel = controller.travel;
      chordClock.current.resolved = controller.resolved;
    } else if (prevState.current === "locked" || prevState.current === "resolved") {
      setAnchor(null);
    }
    prevState.current = s;

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

    const charge = controller.charge01();
    const charging = s === "charging";
    if (chargeRef.current) {
      chargeRef.current.scale.setScalar(charging ? Math.max(0.3, charge) : 0.01);
      (chargeRef.current.material as THREE.MeshBasicMaterial).opacity = charging ? 0.1 + 0.5 * charge : 0;
    }
    if (lockRef.current) {
      lockRef.current.scale.setScalar(locked ? 1 : 0.5);
      (lockRef.current.material as THREE.MeshBasicMaterial).opacity = locked ? 0.55 : 0;
    }
    if (dotRef.current) (dotRef.current.material as THREE.MeshBasicMaterial).opacity = locked ? 1 : 0.85;

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
  });

  if (!interactive) return null;

  return (
    <>
      <ChordLayer anchor={anchor} clock={chordClock} />
      {leads.map((lead, i) => (
        <mesh key={i} ref={(el) => { leadMeshes.current[i] = el; }} position={[lead.x, lead.y, lead.z]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      <group ref={reticleRef}>
        <mesh ref={chargeRef}>
          <ringGeometry args={[0.84, 1.0, 48]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={lockRef}>
          <ringGeometry args={[0.9, 1.0, 48]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={dotRef}>
          <circleGeometry args={[0.025, 16]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}
