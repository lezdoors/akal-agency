/**
 * Mutable holder for live render diagnostics. Written by the canvas driver
 * every frame, read by the diagnostics overlay on a throttle. Dev-only.
 */
export const LiveStats = {
  fps: 60,
  frameMs: 16.7,
  calls: 0,
  triangles: 0,
  geometries: 0,
  jsMemMb: 0,
  tier: "high",
};
