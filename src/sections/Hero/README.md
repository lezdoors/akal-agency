# Hero

Scroll-scrub film hero. The page pins a full-viewport stage while the visitor
scrolls; the film is set to the exact frame matching scroll progress, and the
copy chapter is sticky alongside it.

The engine is `ScrollScrub.tsx` (ported verbatim from the original build —
this is the component that was once lost to a commit that swapped it for an
inline `<video>`; do not replace it).

- Fetches each clip as a blob on demand, lazy-loaded only when ~1.5 viewports
  away, and paints the poster until the first frame is decoded.
- `prefers-reduced-motion` renders the poster still instead of scrubbing.
- Responsive: uses `mobileClip`/`mobilePoster` on coarse pointers / small
  viewports.
