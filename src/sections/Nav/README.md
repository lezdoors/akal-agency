# Nav

Fixed top navigation with anchor links to each section. Behaviour:

- Sinks away on scroll-down once you're past the hero; slides back on scroll-up
  (uses `transform`, never `display` toggling between frame paints).
- Gains a hairline + translucent scrim once scrolled.
- Brand left, links right, CTA pill on the right.
- Links collapse on small screens (mobile uses the Contact form as the entry).

Props: `brand`, `links`, `cta` — all from config, nothing hardcoded.
