/**
 * Temporary diagnostics + comparison mode for the root-cause audit.
 *
 * URL knobs:
 *   ?diag=1                 show the full diagnostics panel
 *   ?preset=high            intended high-tier art direction (tier high, full budget, additive)
 *   ?preset=low             low-tier state (small budget)
 *   ?preset=safe            blended (normal) points at reduced opacity — isolates additive-overexposure
 *   ?preset=safari          conservative (normal blend, fewer points, lower opacity)
 *   ?preset=nopost          (placeholder: no post-processing exists; higher budget, lower opacity)
 *   ?actier=high|mid|low|reduced   force a quality tier
 *   ?cap=N                  pin the particle-budget cap (0..1)
 *   ?blend=normal           switch the point field from additive to normal blending
 *   ?opacity=N              scale the point-field opacity (0..1)
 */
import type { PerfTier } from "@/systems/renderer/RendererInterface";
import { perf } from "@/session";

export type BlendMode = "additive" | "normal";

export interface DiagOpts {
  tier: PerfTier | null;
  cap: number | null;
  blend: BlendMode;
  opacity: number;
  diag: boolean;
  preset: string | null;
}

function parse(): DiagOpts {
  const p =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

  let tier: PerfTier | null = null;
  let cap: number | null = null;
  let blend: BlendMode = "additive";
  let opacity = 1;
  let diag = p.get("diag") === "1";
  const preset = p.get("preset");

  if (preset) {
    diag = true;
    if (preset === "high") { tier = "high"; cap = 1; blend = "additive"; opacity = 1; }
    else if (preset === "low") { tier = "low"; cap = 0.2; blend = "additive"; opacity = 1; }
    else if (preset === "safe") { tier = "high"; cap = 1; blend = "normal"; opacity = 0.5; }
    else if (preset === "safari") { tier = "high"; cap = 0.5; blend = "normal"; opacity = 0.6; }
    else if (preset === "nopost") { tier = "high"; cap = 0.6; blend = "additive"; opacity = 0.7; }
  } else {
    const at = p.get("actier");
    if (at === "high" || at === "mid" || at === "low" || at === "reduced") tier = at;
    if (p.get("cap")) cap = parseFloat(p.get("cap") || "");
    if (!Number.isFinite(cap as number)) cap = null;
    if (p.get("blend") === "normal") blend = "normal";
    if (p.get("opacity")) opacity = parseFloat(p.get("opacity") || "");
  }
  if (tier) perf.setOverride(tier);
  return { tier, cap, blend, opacity, diag, preset };
}

export const dbg: DiagOpts = parse();

/** True when a preset is pinning the budget (disables the adaptive grow/shrink). */
export const lockBudget = dbg.cap !== null;

/** WebGL renderer/device string + key capability flags, captured once. */
export const glInfo = (() => {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") ||
      c.getContext("webgl")) as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl) return "no webgl";
    const name = gl.getParameter ? String(gl.getParameter(gl.getParameter(37445) === 7939 ? 37446 : 7937)) : "webgl";
    const isWebGL2 = typeof (gl as WebGL2RenderingContext).R32F !== "undefined";
    return `webgl2:${isWebGL2} · ${name}`;
  } catch {
    return "unknown";
  }
})();
