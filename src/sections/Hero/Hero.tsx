import type { ScrollScrubScene, ScrollScrubTheme } from "./ScrollScrub";
import { ScrollScrub } from "./ScrollScrub";
import "./hero-frame.css";

export interface HeroMedia {
  id: string;
  label: string;
  title: string;
  body: string;
  kicker?: string;
  tags?: string[];
  poster: string;
  mobilePoster?: string;
  clip: string;
  mobileClip?: string;
}

export interface HeroProps {
  /** Scenes to scrub, derived from config — passed as props, never hardcoded. */
  scenes: HeroMedia[];
  theme: ScrollScrubTheme;
}

/**
 * Scroll-driven hero. Reuses the trusted ScrollScrub engine verbatim — this
 * wrapper only adds the MODERN chrome framing the antique film: the mono
 * "set / figure" index bar, the registration mark and hairlines. The collision
 * starts in the first viewport.
 */
export function Hero({ scenes, theme }: HeroProps) {
  return (
    <main id="top" className="hero">
      <div className="hero__frame">
        <span className="hero__edge hero__edge--l" aria-hidden="true" />
        <span className="hero__edge hero__edge--r" aria-hidden="true" />
        {scenes[0] && (
          <div className="hero__index mono tabular">
            <span>SET № 001 — WARM PAPER / BRUTALIST SET</span>
            <span className="hero__reg" aria-hidden="true">
              + FIG. 001
            </span>
          </div>
        )}
      </div>
      <ScrollScrub
        theme={theme}
        connectors={[]}
        scenes={scenes as ScrollScrubScene[]}
      />
    </main>
  );
}
