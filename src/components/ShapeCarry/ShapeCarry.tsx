import { useEffect, useRef } from "react";
import { subscribe, clamp } from "../../lib/scroll";
import "./ShapeCarry.css";

function mrgb(a: number[], b: number[], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

const PAPER = [237, 234, 227];
const DARK = [12, 17, 16];
const INK = [26, 28, 30];
const LIME = [183, 227, 74];

/**
 * The thread across a paper→dark boundary: the SAME drawn ink arc from the
 * hero carries out of the paper and seats itself in the dark — turning lime as
 * it lands (lime only ever appears on a dark ground). A shape carrying across
 * a section edge and becoming the next section's element, transform + inline
 * colour only, driven by the shared rAF-coalesced scroll loop.
 */
export function ShapeCarry() {
  const rootRef = useRef<HTMLElement>(null);
  const arcRef = useRef<SVGPathElement>(null);

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
      const root = rootRef.current;
      const arc = arcRef.current;
      if (!root || !arc) return;

      const [gr, gg, gb] = mrgb(PAPER, DARK, p);
      root.style.background = `rgb(${gr}, ${gg}, ${gb})`;

      // Stroke goes ink (paper side) -> lime (dark side), switching mid-band.
      const sw = clamp((p - 0.38) / 0.3); // 0 at .38 -> 1 at .68
      const [ar, ag, ab] = mrgb(INK, LIME, sw);
      arc.style.stroke = `rgb(${ar}, ${ag}, ${ab})`;

      const tx = 6 + p * 46; // 6vw -> 52vw
      const ty = 8 + p * 30; // 8vh -> 38vh
      const sc = 0.55 + p * 1.2;
      const rot = p * 120;
      arc.style.transform = `translate(${tx}vw, ${ty}vh) rotate(${rot}deg) scale(${sc})`;
      arc.style.opacity = String(0.5 + p * 0.4);
    });

    window.addEventListener("resize", measure);
    return () => {
      unsub();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="shapecarry" className="akal-shapecarry" ref={rootRef}>
      <svg className="akal-shapecarry__arc" viewBox="0 0 200 84" aria-hidden="true">
        <path
          ref={arcRef}
          d="M10 74 C 70 12, 130 12, 190 74"
          fill="none"
          strokeWidth="2"
        />
      </svg>
    </section>
  );
}
