/**
 * QualifyController — the state machine for qualification interaction.
 *
 * The visitor steers a cursor over the field; dwelling on a lead builds the
 * qualification charge; at full charge the lead is LOCKED and forks into the
 * Chord of Futures, resolving to one survivor route. `lock()` lets the film
 * force a qualification at its Instrument beat so the mechanic is always seen.
 */
import { clamp01 } from "@/lib/math";
import { Charge } from "@/systems/weight/WeightLayer";
import { SeedSystem } from "@/systems/seed/SeedSystem";

export type QState = "idle" | "charging" | "locked" | "resolved";

const CHORD_RATE = 0.9;
const RESOLVE_AT = 0.72;
const RESET_HOLD = 1.4;

export class QualifyController {
  state: QState = "idle";
  lockedIndex = -1;
  travel = 0;
  resolved = false;
  survivorIndex = 0;

  private charge = new Charge(1, 0.42);
  private idleTime = 0;
  private resolvedHold = 0;
  private cycle = 0;
  private seed: SeedSystem;
  private readonly cadence: number;

  constructor(rootSeed: number) {
    this.seed = new SeedSystem(rootSeed);
    this.cadence = 5 + this.seed.value("qualify.cadence", 0, 4);
  }

  charge01(): number {
    return this.charge.normalized();
  }

  /** Force a qualification for the film's Instrument beat (visual guarantee). */
  lock(index: number): void {
    if (index < 0) return;
    if (this.state === "idle" || this.state === "charging") this.beginLock(index);
  }

  private beginLock(index: number): void {
    this.state = "locked";
    this.lockedIndex = index;
    this.travel = 0;
    this.resolved = false;
    this.resolvedHold = 0;
    this.survivorIndex = (this.cycle + this.seed.int("qualify.survivor")) % 3;
    this.cycle += 1;
  }

  /** Immediately end any qualification — used when the film leaves the Instrument beat. */
  forceRelease(): void {
    if (this.state !== "idle") this.release();
  }

  private release(): void {
    this.state = "idle";
    this.lockedIndex = -1;
    this.travel = 0;
    this.resolved = false;
    this.charge.reset();
    this.idleTime = 0;
  }

  tick(dt: number, opts: { dwelling: boolean; targetIndex: number; progressDelta: number; autoAdvance: boolean }): void {
    if (dt <= 0) return;
    const { dwelling, targetIndex, progressDelta, autoAdvance } = opts;

    switch (this.state) {
      case "idle": {
        this.idleTime += dt;
        if (dwelling && targetIndex >= 0) {
          this.state = "charging";
          this.charge.value = 0;
          this.idleTime = 0;
        } else if (autoAdvance && this.idleTime > this.cadence) {
          this.idleTime = 0;
          this.beginLock(targetIndex >= 0 ? targetIndex : 0);
        }
        break;
      }
      case "charging": {
        if (dwelling && targetIndex >= 0) {
          this.charge.value = Math.min(this.charge.threshold, this.charge.value + this.charge.rate * dt);
          if (this.charge.value >= this.charge.threshold) this.beginLock(targetIndex);
        } else {
          this.charge.value = Math.max(0, this.charge.value - dt * 0.9);
          if (this.charge.value <= 0) this.state = "idle";
        }
        break;
      }
      case "locked":
      case "resolved": {
        const dir = progressDelta < 0 ? -1 : 1;
        this.travel = clamp01(this.travel + dir * CHORD_RATE * dt);
        if (this.travel >= RESOLVE_AT && !this.resolved) this.resolved = true;
        if (this.travel >= 1) {
          this.travel = 1;
          this.state = "resolved";
          this.resolvedHold += dt;
          if (this.resolvedHold > RESET_HOLD) this.release();
        } else if (this.state === "resolved") {
          this.resolvedHold += dt;
          if (progressDelta < 0) this.travel = clamp01(this.travel - CHORD_RATE * dt);
          if (this.travel <= 0) this.release();
          else if (this.resolvedHold > RESET_HOLD) this.release();
        }
        break;
      }
    }
  }
}
