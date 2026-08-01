# Contact

The real contact form the page was missing (the old CTA linked to "#").

- Accessible: real `<label>`s, autocomplete hints, `role="alert"` on errors,
  a `role="status"` success state.
- Inline validation (name present, valid email, message present).
- Submit currently composes a `mailto:` so it works with zero backend. The
  **WIRE-UP HOOK** is marked in `handleSubmit` — swap it for a fetch to your
  pipeline/CRM when ready.
- Reduced-motion safe; no external dependencies.

Props: `kicker`, `title`, `body` from config.
