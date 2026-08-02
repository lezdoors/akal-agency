import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { time } from "@/session";

interface SceneTextProps {
  /** film progress (0..1) at which this text is centered on screen */
  at: number;
  align?: "left" | "center" | "right";
  maxW?: string;
  className?: string;
  children: ReactNode;
}

/**
 * One line of the film's copy. Anchored to a scene beat (progress) and faded
 * in/out as the camera reaches and leaves it — the text is part of the film,
 * not a scrolling page section. No card, no panel; subordinate to the world.
 */
export function SceneText({ at, align = "left", maxW = "30rem", className = "", children }: SceneTextProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = time.progress;
      const d = 0.055;
      const o =
        p > at - d && p < at + d
          ? Math.min(1, (p - (at - d)) / 0.02, (at + d - p) / 0.02)
          : 0;
      if (ref.current) ref.current.style.opacity = String(Math.max(0, o));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [at]);

  return (
    <div
      ref={ref}
      className={`scene-text ${className}`}
      style={{
        position: "absolute",
        top: `${at * 100}%`,
        left: align === "left" ? "7vw" : align === "right" ? "auto" : "50%",
        right: align === "right" ? "7vw" : undefined,
        transform: align === "center" ? "translate(-50%, -50%)" : "translateY(-50%)",
        maxWidth: maxW,
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
}
