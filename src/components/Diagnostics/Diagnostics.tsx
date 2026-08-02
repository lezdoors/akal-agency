import { useEffect, useState } from "react";
import { LiveStats } from "@/lib/liveStats";
import { worldState } from "@/film/state";
import { perf } from "@/session";
import { dbg, glInfo } from "@/diag";

interface Snapshot {
  fps: number;
  frameMs: number;
  calls: number;
  tris: number;
  tier: string;
  dpr: number;
  point: number;
  routes: number;
  blend: string;
  cs: string;
  tone: string;
  exposure: number;
  reduced: boolean;
  boot: number;
  film: number;
  bloom: boolean;
  portalGlow: boolean;
  ghosting: boolean;
  pScale: number;
  cap: number;
}

/**
 * Full diagnostics + audit readout — shown with ?diag=1 or any ?preset=.
 * Reports the renderer, tier, DPR, budget, blending, color space, tone mapping,
 * exposure, feature flags, reduced-motion state and WebGL capabilities so a
 * root-cause audit can be read from a real recording on any machine.
 */
export function Diagnostics() {
  const show = dbg.diag;
  const [s, setS] = useState<Snapshot>(() => snap());

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => setS(snap()), 300);
    return () => clearInterval(id);
  }, [show]);

  if (!show) return null;

  const feats = s;
  return (
    <div className="fixed bottom-3 left-3 z-[100] max-w-[18rem] rounded border border-akal-hairline bg-akal-panel/85 px-3 py-2 mono text-[11px] leading-4 text-akal-muted">
      <div>AKAL audit · {glInfo}</div>
      <div className="opacity-80">renderer three-webgl · scheme {dbg.preset ?? "custom"}</div>
      <div>
        tier <span className="text-akal-ink">{s.tier}</span> · dpr {s.dpr} · cap {s.cap.toFixed(2)}
      </div>
      <div>
        points {s.point.toLocaleString()} · routes {s.routes} · packets {s.routes}
      </div>
      <div>
        blend {s.blend} · cs {s.cs} · tone {s.tone} · exp {s.exposure.toFixed(2)}
      </div>
      <div>
        fps {Math.round(s.fps)} · {s.frameMs.toFixed(1)}ms · draws {s.calls} · tris {s.tris}
      </div>
      <div>
        flags bloom:{feats.bloom ? 1 : 0} portalGlow:{feats.portalGlow ? 1 : 0} ghost:{feats.ghosting ? 1 : 0} pScale:{feats.pScale.toFixed(2)}
      </div>
      <div>
        reduced {s.reduced ? 1 : 0} · film {s.film.toFixed(2)} · boot {s.boot.toFixed(2)}
      </div>
      <div className="opacity-70">shader: compiled (render loop live) · AA {s.tier !== "low" && s.tier !== "reduced" ? "on" : "off"}</div>
    </div>
  );
}

function snap(): Snapshot {
  const feats = perf.features();
  return {
    fps: LiveStats.fps,
    frameMs: LiveStats.frameMs,
    calls: LiveStats.calls,
    tris: LiveStats.triangles,
    tier: perf.resolve(),
    dpr: perf.dpr(),
    point: LiveStats.pointCount,
    routes: LiveStats.routeCount,
    blend: LiveStats.blend,
    cs: LiveStats.colorSpace,
    tone: LiveStats.toneMapping,
    exposure: LiveStats.exposure,
    reduced: LiveStats.reduced,
    boot: worldState.boot,
    film: worldState.film,
    bloom: feats.bloom,
    portalGlow: feats.portalGlow,
    ghosting: feats.ghosting,
    pScale: feats.particleScale,
    cap: LiveStats.cap,
  };
}
