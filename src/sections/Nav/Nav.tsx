import site from "@/config/site";

/**
 * Top bar — one matte panel over the world. Thin hairline, mono micro-labels,
 * single CTA ("Talk to us") carried everywhere.
 */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 px-6 md:px-10 h-[var(--nav-h)] bg-akal-ground/50 backdrop-blur-md border-b border-akal-hairline/60">
      <a href="#top" className="flex items-center gap-3">
        <img
          src={site.media.monogram}
          alt="AKAL monogram"
          className="h-7 w-auto"
        />
        <span className="font-display font-semibold tracking-tight">
          {site.brand}
        </span>
      </a>

      <nav className="hidden md:flex items-center gap-7 mono text-akal-muted">
        {site.nav.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-akal-ink"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href={site.hero.ctaHref}
        className="mono inline-flex items-center gap-2 rounded-full border border-akal-hairline px-4 py-2 text-akal-accent transition-colors hover:border-akal-accent/60 hover:text-akal-ink"
      >
        {site.hero.cta}
      </a>
    </header>
  );
}
