# Reel (Work)

The video-production flex: a full-bleed film where the cursor is the transport.

- **Desktop (fine pointer, ≥1024px):** moving the mouse over the film scrubs
  `currentTime` linearly from left→right. Forward AND backward, frame by frame.
  No autoplay — the viewer owns the playhead. The lime rail under the film maps
  the playhead; the hint pill fades once the visitor touches the film.
- **Below 1024px / coarse pointer:** the clip just plays (muted, looping).
- **Lazy:** the `<video>` only mounts when the section is ~1 viewport away
  (IntersectionObserver, generous rootMargin). Nothing above the fold depends
  on this film — the still poster shows first.
- **Reduced motion:** renders the exact first-frame poster as a still.
- Animated with `transform`/`opacity` only; the film itself is a native
  `<video>` (no per-frame JS reads on the hot path while scrubbing).

Props: `kicker`, `title`, `hint`, `media` (poster/clip + mobile variants), all
from config.
