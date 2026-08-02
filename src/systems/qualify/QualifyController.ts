/**
 * QualifyController — the state machine for the Phase 2 interaction.
 *
 * One visitor steers a cursor over the field; dwelling on a lead builds the
 * qualification charge; at full charge the lead is LOCKED and forks into the
 * Chord of Futures; it resolves to one survivor route. Scroll direction drives
 * the chord's travel (forward plays it, reverse scroll rewinds it cleanly).
 *
 * States: idle → charging → locked → resolved → (release).
 * The world stays alive between visits via a seeded idle cadence.
 */
import { clamp01 } from "@/lib/math";
import { Charge } from "@/systems/weight/WeightLayer";
import { SeedSystem } from "@/systems/seed/SeedSystem";

export type QState = "idle" | "charging" | "locked" | "resolved";

/** Chord duration when playing a lock. */
const CHORD_RATE = 0.9; // travel units per second
const RESOLVE_AT = 0.72;
const RESET_HOLD = 1.4; // seconds the resolved survivor stays before release

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
    // Seeded idle cadence (5–9s), stable for this session.
    this.cadence = 5 + this.seed.value("qualify.cadence", 0, 4);
  }

  /** 0..1 charge fill, for the feedback ring. */
  charge01(): number {
    return this.charge.normalized();
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

  private release(): void {
    this.state = "idle";
    this.lockedIndex = -1;
    this.travel = 0;
    this.resolved = false;
    this.charge.reset();
    this.idleTime = 0; // breathe before the next idle cadence
  }

  /** Called every frame. `dwelling` + `targetIndex` come from the cursor field. */
  tick(
    dt: number,
    opts: {
      dwelling: boolean;
      targetIndex: number;
      /** + when scrolling down, − when scrolling up. */
      progressDelta: number;
      /** Light idle auto-qualification cadence (tier-gated upstream). */
      autoAdvance: boolean;
    }
  ): void {
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
          this.charge.value = Math.min(
            this.charge.threshold,
            this.charge.value + this.charge.rate * dt
          );
          if (this.charge.value >= this.charge.threshold) {
            this.beginLock(targetIndex);
          }
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
