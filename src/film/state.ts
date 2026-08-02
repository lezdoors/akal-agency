/**
 * Mutable world state shared imperatively between the director (writer) and
 * the scene systems (readers) — mirroring the PointerState pattern so per-frame
 * changes never cause React churn.
 *
 * `boot` (0..1): Scene 1's "the world assembles itself" — the field densifies
 * from a haze into the full globe. Driven by CameraDirector, read by GlobeScene.
 */
export const worldState = {
  boot: 0,
};
