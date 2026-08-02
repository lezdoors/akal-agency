/**
 * CameraDirector — the director, not the renderer.
 *
 * The film is shot on a single continuous camera path: a KeyedTimeline of
 * camera poses keyed to film progress (0..1). The director seeks along that
 * path as the visitor scrolls (scroll = time), so the camera physically
 * carries the visitor through the world — wide establishing, orbit to the
 * flank, close on the instrument, a dive that passes through the globe into
 * the interior, a rise, a resolve to center, and out to the invite.
 *
 * Nothing else moves the camera. Interactions request shots; the director
 * remains the single voice.
 */
import * as THREE from "three";
import { clamp01, lerp } from "@/lib/math";

export interface ShotKey {
  /** film progress this pose sits at (0..1) */
  at: number;
  pos: [number, number, number];
  aim: [number, number, number];
  fov: number;
}

export class CameraDirector {
  private cam: THREE.PerspectiveCamera;
  private timeline: ShotKey[] = [];
  private look = new THREE.Vector3();

  constructor(cam: THREE.PerspectiveCamera) {
    this.cam = cam;
  }

  setTimeline(keys: ShotKey[]): this {
    this.timeline = [...keys].sort((a, b) => a.at - b.at);
    return this;
  }

  private poseAt(p: number): { pos: THREE.Vector3; aim: THREE.Vector3; fov: number } {
    const t = this.timeline;
    if (t.length === 0) return { pos: new THREE.Vector3(0, 0, 7), aim: new THREE.Vector3(), fov: 45 };
    if (p <= t[0].at) {
      return { pos: new THREE.Vector3(...t[0].pos), aim: new THREE.Vector3(...t[0].aim), fov: t[0].fov };
    }
    for (let i = 0; i < t.length - 1; i++) {
      const a = t[i];
      const b = t[i + 1];
      if (p >= a.at && p <= b.at) {
        const span = b.at - a.at || 1e-6;
        // ease (hold at endpoints gives gentle motion). `s` is already the
        // eased 0..1 parameter — interpolate with a true lerp so every shot
        // actually ARRIVES at its keyed pose. (damp(a,b,s,1) only ever
        // reached 63% of each segment, which left the closing shot parked
        // inside the globe with a route packet in front of the lens.)
        const s = 1 - Math.pow(1 - clamp01((p - a.at) / span), 3);
        const pos = new THREE.Vector3(
          lerp(a.pos[0], b.pos[0], s),
          lerp(a.pos[1], b.pos[1], s),
          lerp(a.pos[2], b.pos[2], s)
        );
        const aim = new THREE.Vector3(
          lerp(a.aim[0], b.aim[0], s),
          lerp(a.aim[1], b.aim[1], s),
          lerp(a.aim[2], b.aim[2], s)
        );
        const fov = a.fov + (b.fov - a.fov) * s;
        return { pos, aim, fov };
      }
    }
    const last = t[t.length - 1];
    return { pos: new THREE.Vector3(...last.pos), aim: new THREE.Vector3(...last.aim), fov: last.fov };
  }

  /** Seek the camera to film progress. */
  seek(p: number): void {
    p = clamp01(p);
    const { pos, aim, fov } = this.poseAt(p);
    this.cam.position.set(pos.x, pos.y, pos.z);
    this.look.set(aim.x, aim.y, aim.z);
    this.cam.lookAt(this.look);
    if (Math.abs(this.cam.fov - fov) > 0.01) {
      this.cam.fov = fov;
      this.cam.updateProjectionMatrix();
    }
  }
}
