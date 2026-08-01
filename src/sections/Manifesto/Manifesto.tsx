import { useEffect, useRef } from "react";
import { subscribe, clamp } from "../../lib/scroll";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./Manifesto.css";

export interface ManifestoProps {
  intro: string;
  words: string[];
}

/** Overshoot "slam" easing — a fast rise that snaps just past and settles. */
function slam(t: number) {
  const x = clamp(t);
  // soft overshoot around 0.62
  const s =
    x < 0.62
      ? (x / 0.62) * (x / 0.62) * 1.15
      : 1 - (1 - ((x - 0.62) / 0.38)) * 0.22;
  return clamp(s, 0, 1.18);
}

/**
 * Kinetic-type manifesto. Exactly once on the page.
 *
 * A tall scroll region pins the assembled statement while each word slams in
 * on its own scroll step (fast rise + a touch of overshoot). Reads happen in
 * the shared rAF loop and write transforms directly to the DOM — no React
 * re-renders per frame.
 */
export function Manifesto({ intro, words }: ManifestoProps) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLHeadingElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;

    let top = 0;
    let height = 0;
    const measure = () => {
      const r = root.getBoundingClientRect();
      top = r.top + window.scrollY;
      height = r.height;
    };
    measure();

    const unsub = subscribe((y, vh) => {
      const travel = Math.max(height - vh, 1);
      const p = clamp((y - (top - vh)) / travel);
      const n = words.length;
      for (let i = 0; i < n; i++) {
        const el = wordRefs.current[i];
        if (!el) continue;
        const band = 1 / n;
        const t = (p - i * band) / band; // 0..1 for this word's band
        if (t <= 0) {
          el.style.opacity = "0";
          el.style.transform = "translateY(0.6em)";
          continue;
        }
        const k = slam(t);
        el.style.opacity = String(clamp(k * 1.8));
        el.style.transform = `translateY(${(1 - k) * 0.5}em)`;
      }
    });

    window.addEventListener("resize", measure);
    return () => {
      unsub();
      window.removeEventListener("resize", measure);
    };
  }, [reduced, words]);

  return (
    <section id="manifesto" className="akal-manifesto">
      <div className="akal-manifesto__stage">
        <p className="akal-manifesto__intro">{intro}</p>
        <h2
          ref={rootRef}
          className="akal-manifesto__statement"
          aria-label={words.join(" ")}
        >
          {words.map((w, i) => (
            <span
              key={i}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="akal-manifesto__word"
              data-reveal-state={reduced ? "done" : undefined}
            >
              {w}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}
