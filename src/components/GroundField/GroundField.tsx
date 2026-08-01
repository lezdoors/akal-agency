import { useEffect, useRef } from "react";
import { subscribe, clamp } from "../../lib/scroll";
import "./GroundField.css";

/**
 * Section transition that is NOT a fade: the ground colour interpolates with
 * scroll. A hard diagonal boundary sweeps across the band so the cream ground
 * visibly "pours in" over the dark one, driven one-to-one by the visitor's
 * scroll position. Compositing-only (clip-path + opacity), no layout writes.
 */
export function GroundField() {
  const rootRef = useRef<HTMLElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let top = 0;
    let height = 0;
    const measure = () => {
      const r = rootRef.current?.getBoundingClientRect();
      if (r) {
        top = r.top + window.scrollY;
        height = r.height;
      }
    };
    measure();

    const unsub = subscribe((y, vh) => {
      const travel = Math.max(height - vh, 1);
      const p = clamp((y - (top - vh)) / travel);
      const el = darkRef.current;
      if (!el) return;
      el.style.clipPath = `polygon(0 0, ${p * 112}% 0, ${p * 112 + 30}% 100%, 0 100%)`;
      el.style.opacity = String(1 - p * 0.15);
    });

    window.addEventListener("resize", measure);
    return () => {
      unsub();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="groundfield" className="akal-groundfield" ref={rootRef}>
      <div ref={darkRef} className="akal-groundfield__dark" />
    </section>
  );
}
