/**
 * SeedSystem.
 *
 * The "never repeat" rule (Blueprint v2 §9 + the non-negotiable) is built on
 * deterministic per-session seeds. A root seed is chosen once per session;
 * every derived system asks for its own fork, so behavior is reproducible for
 * a given root seed yet unique across sessions.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string to a uint32. Used to namespace seeds. */
export function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Parse a seed string ("deadbeef") into a uint32, with a stable fallback. */
export function seedFromString(input: string): number {
  if (!input) return (Math.random() * 2 ** 32) >>> 0;
  const trimmed = input.trim();
  if (/^[0-9a-fA-F]{1,8}$/.test(trimmed)) {
    return parseInt(trimmed, 16) >>> 0;
  }
  return hashString(trimmed);
}

export class SeedSystem {
  readonly root: number;

  constructor(root: number) {
    this.root = root >>> 0;
  }

  /** Deterministic [0,1) for a named axis, stable for this root. */
  rand(namespace: string): number {
    return mulberry32(hashString(namespace) ^ this.root)();
  }

  /** Deterministic value in [min,max) for a named axis. */
  value(namespace: string, min = 0, max = 1): number {
    return min + (max - min) * this.rand(namespace);
  }

  /** A fresh PRNG for a namespace, e.g. to generate a full field layout. */
  stream(namespace: string): () => number {
    return mulberry32(hashString(namespace) ^ this.root);
  }

  /** Fixed uint32 for a namespace (dedupe / stable co-seed). */
  int(namespace: string): number {
    return (hashString(namespace) ^ this.root) >>> 0;
  }
}
