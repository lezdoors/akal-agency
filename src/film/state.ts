/**
 * Mutable world state shared imperatively between the director (writer) and
 * the scene systems (readers) — mirroring the PointerState pattern so per-frame
 * changes never cause React churn.
 *
 * All values 0..1 (except survivorIndex) and derived from film progress by
 * FilmDirector; the globe, arcs, interior and ending read them each frame.
 */
export const worldState = {
  /** 0..1 film progress (scroll = time). */
  film: 0,
  /** Scene 1 boot — the world densifies from a haze. */
  boot: 0,
  /** Surface routes (the world's language) appear from the System scene. */
  routes: 0,
  /** Portal — camera dive + interior reveal. */
  portal: 0,
  /** Interior micro-field visibility (inside the globe). */
  interior: 0,
  /** Hidden layer reveal. */
  hidden: 0,
  /** Single-Route collapse — many routes resolve to one. */
  collapse: 0,
  /** Index of the surviving route (the one connection). -1 = none yet. */
  survivorIndex: -1,
};
