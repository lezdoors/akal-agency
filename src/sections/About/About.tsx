import { MarkFrame, RegCross } from "../../components/Marks/Marks";
import "./About.css";

export interface AboutProps {
  kicker: string;
  title: string[];
  body: string;
  plate: { img: string; fig: string; spec: string };
}

/**
 * ABOUT — who the studio is. A brutalist statement of intent on the paper
 * ground, sat beside a freshly inked plate of the studio bench (the OLD side).
 * Honest copy only: no invented proof, no client names, no metrics.
 */
export function About({ kicker, title, body, plate }: AboutProps) {
  return (
    <section id="about" className="about">
      <MarkFrame className="about__frame">
        <p className="about__kicker mono tabular">{kicker}</p>
      </MarkFrame>

      <div className="about__grid">
        <div className="about__lead">
          <h2 className="about__title">
            {title.map((l, i) => (
              <span className="about__line" key={i}>
                {l}
              </span>
            ))}
          </h2>
          <p className="about__body">{body}</p>
        </div>

        <figure className="about__plate">
          <img
            className="about__img"
            src={plate.img}
            alt=""
            loading="lazy"
            draggable={false}
          />
          <RegCross className="about__reg" />
          <span className="about__plate-no mono tabular">{plate.fig}</span>
          <figcaption className="about__spec mono tabular">
            {plate.spec}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
