import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "../../hooks/useInView";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import type { LandscapeMedia } from "../../config/site";
import "./Reel.css";

export interface ReelProps {
  kicker: string;
  title: string;
  hint: string;
  media: LandscapeMedia;
}

/**
 * Craft — the creative-production film.
 *
 * Full-bleed film where the CURSOR is the transport: horizontal mouse movement
 * scrubs it frame by frame, forward and backward. No autoplay on fine pointers
 * — handing the viewer control is the flex. Below 1024px (or coarse pointers)
 * it simply plays.
 *
 * NOT a client portfolio — it's a capability demonstration, so the section is
 * honestly named "Craft". The clip is lazy-mounted when the section is ~1
 * viewport away. Reduced motion renders the exact first frame (poster) as a
 * still.
 */
export function Reel({ kicker, title, hint, media }: ReelProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "150% 0px 150% 0px",
    threshold: 0,
  });

  const filmRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const rect = useRef<{ left: number; width: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const coarse = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches,
    []
  );
  const narrow = useMemo(
    () =>
      typeof window !== "undefined" && window.innerWidth < 1024,
    []
  );
  // Desktop = fine pointer AND wide enough to feel like a passive transport.
  const isDesktop = !coarse && !narrow;
  const autoplay = !isDesktop || reduced;

  const scrubToX = (clientX: number) => {
    const v = videoRef.current;
    const r = rect.current;
    if (!v || !r || !Number.isFinite(v.duration) || !r.width) return;
    const x = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    v.currentTime = x * v.duration;
    if (railRef.current) {
      railRef.current.style.transform = `scaleX(${x})`;
    }
    if (!touched) setTouched(true);
  };

  // Lazy-load the clip once it's ~one viewport away.
  const shouldMount = inView && !reduced;

  // Autoplay path (mobile / coarse / reduced → actually reduced shows poster).
  useEffect(() => {
    if (!shouldMount || !autoplay || reduced) return;
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
  }, [shouldMount, autoplay, reduced]);

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDesktop || reduced) return;
    rect.current = filmRef.current?.getBoundingClientRect() ?? rect.current;
    scrubToX(e.clientX);
  };

  return (
    <section id="craft" className="akal-reel" ref={ref}>
      <div className="akal-reel__head">
        <p className="akal-reel__kicker">{kicker}</p>
        <h2 className="akal-reel__title">{title}</h2>
        <p className="akal-reel__hint">{hint}</p>
      </div>

      <div
        ref={filmRef}
        className="akal-reel__film"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
      >
        {shouldMount ? (
          <video
            ref={videoRef}
            className="akal-reel__video"
            src={coarse ? media.mobileClip : media.clip}
            poster={coarse ? media.mobilePoster : media.poster}
            muted
            loop
            playsInline
            preload="auto"
            data-autoplay={autoplay && !reduced ? "true" : "false"}
          />
        ) : (
          <img
            className="akal-reel__video akal-reel__still"
            src={coarse ? media.mobilePoster : media.poster}
            alt=""
            draggable={false}
          />
        )}

        <div className="akal-reel__scrim" />
        <div
          ref={railRef}
          className={`akal-reel__rail${touched ? " akal-reel__rail--warm" : ""}`}
        >
          <span />
        </div>

        {isDesktop && !reduced && (
          <p className={`akal-reel__hint-fly${touched ? " is-seen" : ""}`}>
            ⟵ drag to travel the frame ⟶
          </p>
        )}
      </div>
    </section>
  );
}
