/**
 * PointerState. A mutable singleton read per-frame by the cursor field,
 * the Co-Agent (for visitor activity), and the weight layer.
 */
export const PointerState = {
  x: 0,
  y: 0,
  nx: 0, // normalized device coords [-1,1]
  ny: 0,
  vx: 0, // velocity (pixels/sec)
  vy: 0,
  lastActivity: 0,
  active: false,
};

let px = 0;
let py = 0;
let pt = 0;

export function updatePointer(x: number, y: number, width: number, height: number): void {
  const now = performance.now();
  const dt = Math.max(1, now - pt || 16);
  PointerState.vx = ((x - px) / dt) * 1000;
  PointerState.vy = ((y - py) / dt) * 1000;
  px = x;
  py = y;
  pt = now;
  PointerState.x = x;
  PointerState.y = y;
  PointerState.nx = (x / Math.max(1, width)) * 2 - 1;
  PointerState.ny = -((y / Math.max(1, height)) * 2 - 1);
  PointerState.lastActivity = now;
  PointerState.active = true;
}

export function resetPointer(): void {
  PointerState.active = false;
}
