/**
 * TimeSystem.
 *
 * The single shared clock. Blueprint v2 §2: time is a native axis.
 * - `progress` is scroll space in [0,1] (scrub forward = fast-forward,
 *   scrub back = rewind).
 * - `world` is the autonomous "living" clock that always advances, so the
 *   world breathes even when the visitor does nothing.
 * - `time` is the authored story clock (driven by progress + timeScale).
 *
 * Rendering systems and the camera read from TimeSystem. Nothing owns its
 * own clock.
 */
import { clamp01 } from "@/lib/math";

export class TimeSystem {
  /** Scroll space [0,1]. */
  progress = 0;
  /** Story clock in seconds. */
  time = 0;
  /** Autonomous living clock in seconds. */
  world = 0;
  /** 0 when paused; 1 normal. */
  timeScale = 1;
  paused = false;

  tick(dt: number): void {
    if (!this.paused) {
      this.world += dt;
      this.time += dt * this.timeScale;
    }
  }

  setProgress(p: number): void {
    this.progress = clamp01(p);
  }

  /** Advance story time by a normalized scroll delta. */
  scrubBy(delta: number): void {
    this.progress = clamp01(this.progress + delta);
  }

  reset(): void {
    this.progress = 0;
    this.time = 0;
    this.world = 0;
  }
}
