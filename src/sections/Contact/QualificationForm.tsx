import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

/** Where qualified routes are delivered until a serverless mailbox is wired. */
const CONTACT_EMAIL = "hello@akal.agency";

const FIELDS = [
  { key: "name", label: "Name", required: true, type: "text" },
  { key: "company", label: "Company", required: true, type: "text" },
  { key: "email", label: "Work email", required: true, type: "email" },
  { key: "industry", label: "Industry", required: false, type: "text" },
  { key: "geography", label: "Target geography", required: false, type: "text" },
] as const;

/**
 * The qualification entry — the visitor's own Single Route. A proper form
 * (not a bare mailto link): collects the fields AKAL needs to qualify. Since
 * the site has no backend yet, submission assembles a structured mailto as the
 * working transport (serverless delivery is the known limitation).
 */
export function QualificationForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [volume, setVolume] = useState("");
  const [challenge, setChallenge] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = [
      `Name: ${values.name || ""}`,
      `Company: ${values.company || ""}`,
      `Email: ${values.email || ""}`,
      `Industry: ${values.industry || ""}`,
      `Target geography: ${values.geography || ""}`,
      `Monthly lead volume: ${volume || ""}`,
      `Acquisition challenge: ${challenge || ""}`,
      `Phone: ${phone || ""}`,
    ].join("\n");
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("AKAL qualification")}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const inputCls =
    "w-full rounded-md border border-akal-hairline bg-akal-panel/70 px-3 py-2 text-sm text-akal-ink placeholder:text-akal-muted/60 outline-none focus:border-akal-accent/60";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1.5">
            <span className="mono text-akal-muted">{f.label}</span>
            <input
              className={inputCls}
              type={f.type}
              required={f.required}
              value={values[f.key] ?? ""}
              onChange={set(f.key)}
            />
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="mono text-akal-muted">Approximate monthly lead volume</span>
        <select className={inputCls} value={volume} onChange={(e) => setVolume(e.target.value)}>
          <option value="">Select…</option>
          <option>Under 100</option>
          <option>100–1,000</option>
          <option>1,000–10,000</option>
          <option>10,000+</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="mono text-akal-muted">Current acquisition challenge</span>
        <textarea
          className={inputCls}
          rows={3}
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="mono text-akal-muted">Phone (optional)</span>
        <input className={inputCls} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <button
        type="submit"
        className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-akal-hairline bg-akal-panel/40 px-6 py-3 font-display text-sm font-medium text-akal-ink transition-colors hover:border-akal-accent/60"
      >
        Send the route
      </button>
      {sent && <p className="mono text-akal-accent">Opening your mail client — route submitted.</p>}
    </form>
  );
}
