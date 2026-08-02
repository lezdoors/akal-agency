/**
 * PerformanceTierSystem.
 *
 * Resolves a quality tier from the device, reduced-motion preference, an
 * optional dev override, and (lazily) sampled FPS. The tier drives feature
 * flags and pixel ratio so every system shares one adaptive policy.
 */
import type { PerfTier } from "./RendererInterface";

export interface TierFeatures {
  bloom: boolean;
  ghosting: boolean;
  portalGlow: boolean;
  /** Quality 0..1 scale applied to particle budgets. */
  particleScale: number;
  /** Arc density multiplier. */
  arcDensity: number;
  /** Autonomous Co-Agent cadence multiplier. */
  coAgentCadence: number;
}

const FEATURES: Record<PerfTier, TierFeatures> = {
  high: {
    bloom: true,
    ghosting: true,
    portalGlow: true,
    particleScale: 1,
    arcDensity: 1,
    coAgentCadence: 1,
  },
  mid: {
    bloom: false,
    ghosting: true,
    portalGlow: true,
    particleScale: 0.6,
    arcDensity: 0.6,
    coAgentCadence: 0.7,
  },
  low: {
    bloom: false,
    ghosting: false,
    portalGlow: false,
    particleScale: 0.35,
    arcDensity: 0.35,
    coAgentCadence: 0.4,
  },
  reduced: {
    bloom: false,
    ghosting: false,
    portalGlow: false,
    particleScale: 0.15,
    arcDensity: 0.15,
    coAgentCadence: 0,
  },
};

const DPR_BY_TIER: Record<PerfTier, number> = {
  high: 2,
  mid: 1.5,
  low: 1,
  reduced: 1,
};

export class PerformanceTierSystem {
  private override: PerfTier | null = null;
  reducedMotion: boolean;
  private readonly hires: boolean;
  private readonly cores: number;
  private readonly mobile: boolean;

  constructor(opts?: {
    override?: PerfTier | null;
    reducedMotion?: boolean;
  }) {
    this.override = opts?.override ?? null;
    this.reducedMotion = opts?.reducedMotion ?? false;
    if (typeof window === "undefined") {
      this.hires = true;
      this.cores = 8;
      this.mobile = false;
      return;
    }
    this.hires = (window.devicePixelRatio || 1) >= 2;
    this.cores = navigator.hardwareConcurrency || 4;
    this.mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  setOverride(tier: PerfTier | null): void {
    this.override = tier;
  }

  setReducedMotion(v: boolean): void {
    this.reducedMotion = v;
  }

  resolve(): PerfTier {
    if (this.override) return this.override;
    if (this.reducedMotion) return "reduced";
    if (this.mobile) return "low";
    const score =
      (this.hires ? 2 : 0) + (this.cores >= 8 ? 2 : this.cores >= 4 ? 1 : 0);
    if (score >= 3) return "high";
    if (score >= 1) return "mid";
    return "low";
  }

  features(): TierFeatures {
    return FEATURES[this.resolve()];
  }

  dpr(): number {
    return DPR_BY_TIER[this.resolve()];
  }
}
