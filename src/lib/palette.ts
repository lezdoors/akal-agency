/** Locked brand palette (Bluepint v2). Expose both hex strings and RGB tuples. */

export const PALETTE = {
  ground: "#0a0c10",
  panel: "#12151b",
  hairline: "#20262f",
  ink: "#eff2f6",
  muted: "#98a2b0",
  accent: "#7fa7c4",
  // outcome lanes for the Chord of Futures
  rejected: "#6b7280",
  shared: "#4f8a8b",
  exclusive: "#a8c3d8",
} as const;

const cache = new Map<string, [number, number, number]>();

export function hexToRgb(hex: string): [number, number, number] {
  const hit = cache.get(hex);
  if (hit) return hit;
  const n = parseInt(hex.replace("#", ""), 16);
  const rgb: [number, number, number] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  cache.set(hex, rgb);
  return rgb;
}

export const RGB = Object.fromEntries(
  Object.entries(PALETTE).map(([k, v]) => [k, hexToRgb(v)])
) as Record<keyof typeof PALETTE, [number, number, number]>;
