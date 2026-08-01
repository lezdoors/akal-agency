import { useEffect, useState } from "react";
import type { NavLink } from "../../config/site";
import "./Nav.css";

export interface NavProps {
  brand: string;
  links: NavLink[];
  cta?: { label: string; href: string };
}

/**
 * Fixed top navigation — the conversion path, so it NEVER hides on scroll.
 * Brand left, anchor links right, the CTA ("Request a growth plan") always in
 * view. It only adds a dark scrim once scrolled off the hero. Motion is
 * background/transform only; no layout thrash, no hide-on-scroll-down.
 *
 * Ground-aware tint: at the very top (over the paper hero) the bar is
 * transparent with ink type and an ink CTA pill; once scrolled it takes the
 * dark scrim and the CTA turns lime (lime only ever appears on a dark ground).
 */
export function Nav({ brand, links, cta }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setScrolled((window.scrollY || 0) > 40);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      id="site-nav"
      className={`akal-nav${scrolled ? " akal-nav--scrolled" : ""}`}
    >
      <a className="akal-nav__brand" href="#top">
        {brand}
      </a>
      <nav className="akal-nav__links" aria-label="Primary">
        {links.map((l) => (
          <a key={l.href} className="akal-nav__link" href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      {cta && (
        <a className="akal-nav__cta" href={cta.href}>
          {cta.label}
        </a>
      )}
    </header>
  );
}
