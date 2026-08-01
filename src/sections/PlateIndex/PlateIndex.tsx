import { useInView } from "../../hooks/useInView";
import "./PlateIndex.css";

export interface PlateFigure {
  plate: string;
  fig: string;
  title: string;
  copy: string;
  img: string;
  ink: string;
  paper: string;
  size: string;
}

export interface PlateIndexProps {
  kicker: string;
  title: string;
  colophon: string;
  figures: PlateFigure[];
}

const CROP_POS = ["tl", "tr", "bl", "br"] as const;

/** Print crop marks around a plate — the bridge that belongs to both eras. */
function CropMarks() {
  return (
    <span className="plate-crops" aria-hidden="true">
      {CROP_POS.map((p) => (
        <i key={p} className={`plate-crops__tick plate-crops__tick--${p}`} />
      ))}
    </span>
  );
}

/** Registration cross — printer-folio language stamped on the antique plate. */
function RegCross({ className }: { className?: string }) {
  return (
    <svg className={`plate-reg ${className ?? ""}`} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

function Figure({ f, i }: { f: PlateFigure; i: number }) {
  const { ref, inView } = useInView<HTMLLIElement>({
    rootMargin: "120% 0px 120% 0px",
    threshold: 0,
  });

  return (
    <li
      ref={ref}
      className={`plate-fig plate-fig--${i % 2 ? "b" : "a"}${
        inView ? " plate-fig--open" : ""
      }`}
    >
      <figure className="plate-fig__stage">
        <div className="plate-fig__plate">
          <img
            className="plate-fig__img"
            src={f.img}
            alt=""
            loading="lazy"
            draggable={false}
          />
          <CropMarks />
          <RegCross className="plate-fig__reg" />
          <span className="plate-fig__plate-no mono tabular">{f.plate} · {f.fig}</span>
          {/* lime as a FILL with ink type on top — the one allowed lime-on-light use */}
          <span className="plate-fig__tag mono">{f.title}</span>
        </div>
        <figcaption className="plate-fig__spec mono tabular">
          <span className="plate-fig__spec-head">
            <b>{f.title}</b>
            <em>{f.size}</em>
          </span>
          <span className="plate-fig__spec-line">Ink &nbsp;&nbsp;/ {f.ink}</span>
          <span className="plate-fig__spec-line">Paper / {f.paper}</span>
          <span className="plate-fig__spec-line">Reg &nbsp;&nbsp;/ {f.fig}</span>
        </figcaption>
      </figure>

      <div className="plate-fig__word">
        <h3 className="plate-fig__title">{f.title}</h3>
        <p className="plate-fig__copy">{f.copy}</p>
      </div>
    </li>
  );
}

/**
 * THE PLATE INDEX — the hard OLD/MODERN collision made literal.
 * The antique ink-wash plates stay exactly as antique as they are; everything
 * around them (brutalist display grotesk, mono micro-labels, tabular numerals,
 * hairline rules, registration + crop marks, ink specs) is aggressively
 * contemporary. Print-production language is the bridge that belongs to both
 * eras and therefore to neither. Reveals are transform/opacity only.
 */
export function PlateIndex({ kicker, title, colophon, figures }: PlateIndexProps) {
  return (
    <section id="plates" className="plates">
      <span className="plates__fringe" aria-hidden="true" />
      <header className="plates__head">
        <div className="plates__head-meta mono tabular">
          <span>// {kicker}</span>
          <span>001—004</span>
        </div>
        <h2 className="plates__title">
          {title.split("\n").map((line, i) => (
            <span className="plates__line" key={i}>
              {line}
            </span>
          ))}
        </h2>
        <p className="plates__colophon mono">{colophon}</p>
      </header>

      <ul className="plate-figs">
        {figures.map((f, i) => (
          <Figure key={f.plate} f={f} i={i} />
        ))}
      </ul>

      <footer className="plates__foot mono tabular">
        <span>AKAL / MMXXVI</span>
        <span>REG. {figures.length} FIGURES</span>
      </footer>
    </section>
  );
}
