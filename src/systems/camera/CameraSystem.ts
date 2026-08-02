/**
 * CameraSystem — formalizes the camera as a first-class sprung system.
 *
 * The camera owns no independent clock (it reads the shared frame delta) and
 * is damped through the shared `camera` WeightLayer tune, so locking onto a
 * lead feels like a heavy, physical lean-in rather than a cut.
 */
import * as THREE from "three";
import { Vec3Spring } from "@/systems/weight/WeightLayer";

export class CameraSystem {
  private spring: Vec3Spring;
  private look: THREE.Vector3;
  readonly base: [number, number, number];

  constructor(base: [number, number, number] = [0, 0, 6.2]) {
    this.base = base;
    this.spring = new Vec3Spring(base, "camera");
    this.spring.snap(base);
    this.look = new THREE.Vector3(0, 0, 0);
  }

  /** Instantly place the camera (initial framing / teleport, no springing). */
  snapTo(pos: [number, number, number]): void {
    this.spring.snap(pos);
  }

  /** Damped target the camera drifts toward. */
  target(pos: [number, number, number]): void {
    this.spring.setTarget(pos);
  }

  lookAt(pos: THREE.Vector3): void {
    this.look.copy(pos);
  }

  reset(): void {
    this.spring.setTarget(this.base);
    this.look.set(0, 0, 0);
  }

  /** Advance one frame; returns the camera position stepped by the spring. */
  step(dt: number): [number, number, number] {
    return this.spring.step(dt);
  }

  getLook(): THREE.Vector3 {
    return this.look;
  }
}
