import site from "@/config/site";

/**
 * The Invitation — the final CTA. World resolves to one connection: the visitor.
 */
export function Invitation() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[80svh] flex-col justify-center px-6 py-24 md:px-12 max-w-4xl"
    >
      <p className="mono text-akal-muted">{site.invitation.kicker}</p>

      <h2 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-6xl">
        {site.invitation.line}
      </h2>

      <a
        href={site.invitation.ctaHref}
        className="mt-12 inline-flex w-fit items-center gap-2 rounded-full border border-akal-hairline px-8 py-4 font-display text-lg font-medium text-akal-ink transition-colors hover:border-akal-accent/60 hover:bg-akal-panel/40"
      >
        {site.invitation.cta}
        <span aria-hidden="true" className="text-akal-accent">
          →
        </span>
      </a>
    </section>
  );
}
