import "./Footer.css";

export interface FooterProps {
  brand: string;
  tagline: string;
  line: string;
  links: { label: string; href: string }[];
}

/** Site footer — also the point where the ClosingStroke finally completes. */
export function Footer({ brand, tagline, line, links }: FooterProps) {
  return (
    <footer className="akal-footer">
      <div className="akal-footer__brand-row">
        <span className="akal-footer__brand">{brand}</span>
        <p className="akal-footer__tagline">{tagline}</p>
      </div>
      <div className="akal-footer__row">
        <nav className="akal-footer__links" aria-label="Footer">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="akal-footer__line">{line}</p>
      </div>
    </footer>
  );
}
