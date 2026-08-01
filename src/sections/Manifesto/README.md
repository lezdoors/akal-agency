# Manifesto

Kinetic type — the single manifesto beat on the page (exactly once; twice would
make it a tic).

The section is a 280vh scroll runway with a sticky stage. As the visitor
scrolls, each word "slams" in on its own step: a fast rise with a small
overshoot settling into the assembled statement. Reads run in the shared
rAF-coalesced scroll loop and write `transform`/`opacity` straight to the DOM —
no React re-render per frame.

- The sticky inner stage uses `overflow: clip` so it never kills sibling
  stickiness.
- Reduced motion: renders the full statement instantly (section collapses to
  natural height).
- Words come from config (`manifesto.words`) — swappable copy, no hardcoded
  text in the component.
