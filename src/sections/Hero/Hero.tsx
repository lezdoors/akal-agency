import site from "@/config/site";

/**
 * The World — hero. Headline sits over the living globe; the stage is fixed
 * behind so the world is already turning as the visitor arrives.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-center px-6 md:px-12 max-w-4xl"
    >
      <p className="mono mb-8 text-akal-accent">
        {site.brand} — the acquisition operating system
      </p>

      <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.03em] md:text-7xl">
        {site.headline}
      </h1>

      <p className="mt-8 max-w-xl text-lg text-akal-muted">{site.hero.sub}</p>

      <a
        href={site.hero.ctaHref}
        className="mt-12 inline-flex w-fit items-center gap-2 rounded-full border border-akal-hairline px-6 py-3 font-display font-medium text-akal-ink transition-colors hover:border-akal-accent/60 hover:bg-akal-panel/40"
      >
        {site.hero.cta}
        <span aria-hidden="true" className="text-akal-accent">
          →
        </span>
      </a>
    </section>
  );
}
