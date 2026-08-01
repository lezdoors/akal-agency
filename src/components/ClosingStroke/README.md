# ClosingStroke

A fixed hairline frame drawn around the viewport that progresses with global
scroll and only CLOSES at the very end of the page. Four segments (top, left,
right, bottom) draw in sequence proportional to overall scroll progress; the
bottom side completes precisely when the visitor reaches the footer.

- Uses `transform: scaleX/scaleY` and `opacity` only — no layout reads per
  frame beyond the pre-computed buckets.
- Draws via the shared rAF-coalesced scroll loop (one subscription).
- Hidden on reduced motion and small viewports.
