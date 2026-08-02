/**
 * CameraDirector — the director, not the renderer.
 *
 * This is the film's brain: it owns the camera and decides, each frame, what
 * the visitor sees and why. It does not move arbitrarily; it executes a
 * `Shot` drawn from the Camera Story Specification's language (§2). Anything
 * that wants to move the camera (an interaction, a scene, the world) must do
 * so through the director — it is the single voice for the camera.
 *
 * Shot language (Stage 1): STILL and BREATHE. Later scenes add PUSH / PULL /
 * CARRY / LIFT / SETTLE / PUNCH to the same interface.
 */
import * as THREE from "three";
import { Vec3Spring } from "@/systems/weight/WeightLayer";
import { TimeSystem } from "@/systems/time/TimeSystem";

export type ShotMode = "still" | "breathe";

export interface Shot {
  mode: ShotMode;
  /** Base camera position (world units). */
  base: [number, number, number];
  /** Where the camera looks. */
  aim: [number, number, number];
  /** BREATHE amplitude (units of gentle push-pull). */
  breathe: number;
}

export class CameraDirector {
  private cam: THREE.PerspectiveCamera;
  private pos = new Vec3Spring([0, 0, 7], "camera");
  private look = new THREE.Vector3(0, 0, 0);
  private shot: Shot = { mode: "still", base: [0, 0, 7], aim: [0, 0, 0], breathe: 0 };

  constructor(cam: THREE.PerspectiveCamera) {
    this.cam = cam;
    this.pos.snap([0, 0, 7]);
  }

  setShot(shot: Shot): void {
    this.shot = shot;
    this.pos.setTarget(shot.base);
  }

  /** Advance one frame: compute the shot's intended pose, damp to it, aim. */
  update(dt: number, time: TimeSystem): void {
    const b = this.shot.base;
    let x = b[0];
    let y = b[1];
    let z = b[2];
    if (this.shot.mode === "breathe") {
      z += Math.sin(time.world * 0.35) * this.shot.breathe;
      y += Math.sin(time.world * 0.6 + 1.3) * this.shot.breathe * 0.4;
    }
    this.pos.setTarget([x, y, z]);
    const [px, py, pz] = this.pos.step(dt);
    this.cam.position.set(px, py, pz);
    this.look.set(this.shot.aim[0], this.shot.aim[1], this.shot.aim[2]);
    this.cam.lookAt(this.look);
  }
}
