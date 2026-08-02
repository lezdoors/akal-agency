/**
 * Mutable holder for live render diagnostics. Written by the canvas/game loop
 * every frame, read by the diagnostics overlay on a throttle. Review-only.
 */
export const LiveStats = {
  fps: 60,
  frameMs: 16.7,
  calls: 0,
  triangles: 0,
  geometries: 0,
  jsMemMb: 0,
  tier: "high",
  // audit fields (written at mount / per frame)
  blend: "additive",
  colorSpace: "srgb",
  toneMapping: "aces",
  exposure: 1,
  reduced: false,
  pointCount: 0,
  routeCount: 0,
  cap: 1,
};
