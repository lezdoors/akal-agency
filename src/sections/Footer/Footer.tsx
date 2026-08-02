import site from "@/config/site";

export function Footer() {
  return (
    <footer className="relative border-t border-akal-hairline px-6 py-10 md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img
            src={site.media.monogram}
            alt="AKAL monogram"
            className="h-6 w-auto"
          />
          <span className="font-display font-semibold tracking-tight">
            {site.brand}
          </span>
        </div>

        <p className="mono text-akal-muted">{site.footer.note}</p>

        <div className="flex items-center gap-5 mono text-akal-muted">
          {site.footer.links.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-akal-ink">
              {link.label}
            </a>
          ))}
          <span className="tabular">{site.footer.line}</span>
        </div>
      </div>
    </footer>
  );
}
