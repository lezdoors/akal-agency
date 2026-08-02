import { useEffect, useState } from "react";
import { LiveStats } from "@/lib/liveStats";
import { worldState } from "@/film/state";

/**
 * Lightweight render-diagnostics readout — shown when the URL has `?diag=1`.
 * Reports FPS, frame ms, draw calls, triangles and the resolved tier so scene
 * reviews can be measured in a real recording. Dev/review tool, never in the
 * public design itself.
 */
export function Diagnostics() {
  const [show] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("diag") === "1"
  );
  const [stats, setStats] = useState({ ...LiveStats, boot: 0 });

  useEffect(() => {
    if (!show) return;
    const id = setInterval(
      () => setStats({ ...LiveStats, boot: worldState.boot }),
      250
    );
    return () => clearInterval(id);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[100] rounded border border-akal-hairline bg-akal-panel/80 px-3 py-2 mono text-akal-muted">
      <div>
        fps {Math.round(stats.fps)} · {stats.frameMs.toFixed(1)}ms
      </div>
      <div>
        draws {stats.calls} · tris {stats.triangles}
      </div>
      <div>
        tier {stats.tier} · boot {stats.boot.toFixed(2)}
      </div>
    </div>
  );
}
