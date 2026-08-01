import { MarkFrame } from "../../components/Marks/Marks";
import "./Process.css";

export interface ProcessStep {
  step: string;
  title: string;
  copy: string;
}

export interface ProcessProps {
  steps: ProcessStep[];
}

/** How it works — three phases on the cream ground, print-framed. */
export function Process({ steps }: ProcessProps) {
  return (
    <section id="process" className="akal-process">
      <MarkFrame className="akal-process__frame">
        <h2 className="akal-process__heading">How it works.</h2>
      </MarkFrame>
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
