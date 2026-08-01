import { useEffect, useRef } from "react";
import { subscribe, clamp } from "../../lib/scroll";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./ClosingStroke.css";

interface LineHandle {
  el: HTMLDivElement | null;
  start: number; // progress bucket start 0..1
}

/**
 * A stroke that draws across the whole page and only closes at the very end.
 * Four hairline segments (top, left, right, bottom) draw progressively with
 * overall scroll progress; the loop completes exactly when the visitor reaches
 * the footer. Transform/opacity only.
 */
export function ClosingStroke() {
  const reduced = useReducedMotion();
  const top = useRef<LineHandle>({ el: null, start: 0 });
  const left = useRef<LineHandle>({ el: null, start: 0.25 });
  const right = useRef<LineHandle>({ el: null, start: 0.5 });
  const bottom = useRef<LineHandle>({ el: null, start: 0.75 });

  useEffect(() => {
    if (reduced) return;
    const lines = [top, left, right, bottom];
    const unsub = subscribe((y) => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(y / max) : 1;
      for (const l of lines) {
        const el = l.current.el;
        if (!el) continue;
        const k = clamp((p - l.current.start) / 0.25);
        if (el.dataset.p === String(Math.round(k * 100))) continue;
        el.dataset.p = String(Math.round(k * 100));
        el.style.transform = `scale${el.dataset.axis === "x" ? "X" : "Y"}(${k})`;
        el.style.opacity = String(k > 0 && k < 1 ? 0.35 : k >= 1 ? 0.9 : 0);
      }
    });
    return unsub;
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="akal-stroke" aria-hidden="true">
      <div
        className="akal-stroke__seg akal-stroke__seg--top"
        data-axis="x"
        ref={(el) => {
          top.current.el = el;
        }}
      />
      <div
        className="akal-stroke__seg akal-stroke__seg--left"
        data-axis="y"
        ref={(el) => {
          left.current.el = el;
        }}
      />
      <div
        className="akal-stroke__seg akal-stroke__seg--right"
        data-axis="y"
        ref={(el) => {
          right.current.el = el;
        }}
      />
      <div
        className="akal-stroke__seg akal-stroke__seg--bottom"
        data-axis="x"
        ref={(el) => {
          bottom.current.el = el;
        }}
      />
    </div>
  );
}
