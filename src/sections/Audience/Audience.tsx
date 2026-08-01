import "./Audience.css";

export interface AudienceColumn {
  title: string;
  copy: string;
}

export interface AudienceProps {
  kicker: string;
  title: string;
  columns: AudienceColumn[];
}

/**
 * WHO IT'S FOR — a paper-ground, type-only two-column section. The
 * highest-converting beat on most agency sites and it costs nothing: no film,
 * no imagery, just the two people it's for named plainly.
 */
export function Audience({ kicker, title, columns }: AudienceProps) {
  return (
    <section id="who" className="akal-audience">
      <p className="akal-audience__kicker">{kicker}</p>
      <h2 className="akal-audience__title">{title}</h2>
      <div className="akal-audience__cols">
        {columns.map((c) => (
          <div key={c.title} className="akal-audience__col">
            <h3 className="akal-audience__coltitle">{c.title}</h3>
            <p className="akal-audience__colcopy">{c.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
