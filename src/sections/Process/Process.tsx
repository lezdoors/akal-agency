import "./Process.css";

export interface ProcessStep {
  step: string;
  title: string;
  copy: string;
}

export interface ProcessProps {
  steps: ProcessStep[];
}

/** How it works — three phases on the cream ground. Kept from the original. */
export function Process({ steps }: ProcessProps) {
  return (
    <section id="process" className="akal-process">
      <h2 className="akal-process__heading">How it works.</h2>
      <ol className="akal-process__list">
        {steps.map((s) => (
          <li key={s.step} className="akal-process__item">
            <span className="akal-process__num">{s.step}</span>
            <h3 className="akal-process__title">{s.title}</h3>
            <p className="akal-process__copy">{s.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
