import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { time } from "@/session";

interface SceneTextProps {
  /** film progress (0..1) at which this text is centered on screen */
  at: number;
  align?: "left" | "center" | "right";
  /**
   * Vertical anchoring inside the track. "center" places the block's middle
   * at `at`; "top" hangs it below that point (first scene — keeps the
   * headline clear of the fixed nav); "bottom" pins it a fixed distance above
   * the end of the track (final scene — keeps the form clear of the footer on
   * every viewport height).
   */
  anchor?: "center" | "top" | "bottom";
  maxW?: string;
  className?: string;
  children: ReactNode;
}

/**
 * One line of the film's copy. Anchored to a scene beat (progress) and faded
 * in/out as the camera reaches and leaves it — the text is part of the film,
 * not a scrolling page section. No card, no panel; subordinate to the world.
 */
export function SceneText({ at, align = "left", anchor = "center", maxW = "30rem", className = "", children }: SceneTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = time.progress;
      const d = 0.055;
      // A beat whose window reaches the end of the film never fades back out —
      // the visitor parks at max scroll and the closing copy (and form) must
      // hold at full opacity there.
      const holdAtEnd = at + d >= 1;
      const fadeIn = Math.min(1, (p - (at - d)) / 0.02);
      const fadeOut = holdAtEnd ? 1 : Math.min(1, (at + d - p) / 0.02);
      const o = p > at - d && (holdAtEnd || p < at + d) ? Math.min(fadeIn, fadeOut) : 0;
      if (ref.current) ref.current.style.opacity = String(Math.max(0, Math.min(1, o)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [at]);

  const vertical: CSSProperties =
    anchor === "bottom" ? { top: "auto", bottom: "7rem" } : { top: `${at * 100}%` };
  const translate =
    align === "center"
      ? anchor === "center"
        ? "translate(-50%, -50%)"
        : "translateX(-50%)"
      : anchor === "center"
        ? "translateY(-50%)"
        : "none";

  return (
    <div
      ref={ref}
      className={`scene-text ${className}`}
      style={{
        position: "absolute",
        ...vertical,
        left: align === "left" ? "7vw" : align === "right" ? "auto" : "50%",
        right: align === "right" ? "7vw" : undefined,
        transform: translate,
        maxWidth: maxW,
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
}
