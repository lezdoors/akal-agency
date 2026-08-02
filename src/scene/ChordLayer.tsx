import { useEffect, useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { quadStrip } from "@/lib/geometry";
import { clamp01, smoothstep } from "@/lib/math";
import { PALETTE } from "@/lib/palette";

const STRIP = 30;
const Z = new THREE.Vector3(0, 0, 1);

interface Arc {
  line: THREE.Line;
  packet: THREE.Mesh;
  control: THREE.Vector3;
  end: THREE.Vector3;
  isSurvivor: boolean;
  resolvedMark: THREE.Mesh | null;
}

function bezierAt(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const mt = 1 - t;
  return new THREE.Vector3(
    mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    mt * mt * p0.z + 2 * mt * t * p1.z + t * t * p2.z
  );
}

/** Mutable per-frame state — read imperatively so lead changes don't churn React. */
export interface ChordClock {
  survivor: number;
  travel: number;
  resolved: boolean;
}

interface ChordLayerProps {
  /** World-space anchor (the locked lead). null hides the chord. */
  anchor: THREE.Vector3 | null;
  clock: MutableRefObject<ChordClock>;
}

/**
 * Chord of Futures — one lead forks into Rejected / Shared / Exclusive ghost
 * routes that play forward in time and resolve to one survivor. Rendered
 * imperatively (the lab's proven mechanic, driven by the shared clock's
 * `travel` so reverse scroll rewinds). Differentiation is colour + motion only:
 * Rejected #6b7280, Shared #4f8a8b, Exclusive ice #a8c3d8.
 */
export function ChordLayer({ anchor, clock }: ChordLayerProps) {
  const groupRef = useRef<THREE.Group>(null);

  const arcs = useMemo<Arc[]>(() => {
    if (!anchor) return [];
    const futures = [
      { accent: new THREE.Color(PALETTE.rejected), end: new THREE.Vector3(1.5, -0.85, 0.55) },
      { accent: new THREE.Color(PALETTE.shared), end: new THREE.Vector3(-0.5, 0.2, 1.7) },
      { accent: new THREE.Color(PALETTE.exclusive), end: new THREE.Vector3(0.75, 0.95, -1.45) },
    ];
    return futures.map((f, i) => {
      const control = f.end.clone().multiplyScalar(1.35);
      const strip = quadStrip(
        [0, 0, 0],
        [control.x, control.y, control.z],
        [f.end.x, f.end.y, f.end.z],
        STRIP
      );
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(strip, 3));
      const line = new THREE.Line(
        g,
        new THREE.LineBasicMaterial({ color: f.accent, transparent: true, opacity: 0.55 })
      );
      const packet = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshBasicMaterial({ color: f.accent, transparent: true, opacity: 0.95 })
      );
      line.frustumCulled = false;
      packet.frustumCulled = false;
      const isSurvivor = i === clock.current.survivor;
      const resolvedMark = isSurvivor
        ? new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 12),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.accent) })
          )
        : null;
      if (resolvedMark) resolvedMark.frustumCulled = false;
      return { line, packet, control, end: f.end, isSurvivor, resolvedMark };
    });
  }, [anchor, clock]);

  // Orient the chord so arcs fan outward from the anchor along its normal.
  useEffect(() => {
    const g = groupRef.current;
    if (g) {
      if (!anchor) {
        g.visible = false;
        return;
      }
      g.visible = true;
      g.position.set(anchor.x, anchor.y, anchor.z);
      if (anchor.lengthSq() > 1e-6) {
        g.quaternion.setFromUnitVectors(Z, anchor.clone().normalize());
      }
    }
  }, [anchor]);

  useFrame(() => {
    const c = clock.current;
    const travel = c.travel;
    const resolved = c.resolved;
    for (const a of arcs) {
      const intensity = a.isSurvivor ? 1 : 1 - smoothstep(0.6, 0.8, travel);
      (a.line.material as THREE.LineBasicMaterial).opacity = 0.55 * intensity;
      (a.packet.material as THREE.MeshBasicMaterial).opacity = 0.95 * intensity;
      const t = clamp01(travel * 1.1 + (a.isSurvivor ? 0 : a.control.x * 0.02 + 0.28));
      a.packet.position.copy(bezierAt(new THREE.Vector3(0, 0, 0), a.control, a.end, t));
      if (a.resolvedMark) a.resolvedMark.visible = resolved;
    }
  });

  return (
    <group ref={groupRef}>
      {arcs.map((a) => (
        <primitive key={a.line.uuid} object={a.line} />
      ))}
      {arcs.map((a) => (
        <primitive key={a.packet.uuid} object={a.packet} />
      ))}
      {arcs.map((a) =>
        a.resolvedMark ? (
          <primitive key={a.resolvedMark.uuid} object={a.resolvedMark} />
        ) : null
      )}
    </group>
  );
}
