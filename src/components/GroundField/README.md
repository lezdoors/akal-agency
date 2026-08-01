# GroundField

A section transition that is NOT a fade. Between the dark Reel and the cream
Capabilities section, the ground colour interpolates with scroll: a hard
diagonal boundary sweeps across a 130vh band so the cream pours in over the
dark, one-to-one with the visitor's scroll position.

- Compositing-only (`clip-path` + `opacity`) — no `width/height/top/left`.
- Driven by the shared rAF-coalesced scroll loop.
- Reduced motion snaps to the destination ground.
