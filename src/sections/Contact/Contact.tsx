import { useState } from "react";
import { MarkFrame } from "../../components/Marks/Marks";
import "./Contact.css";

export interface ContactProps {
  kicker: string;
  title: string;
  body: string;
}

type Status = "idle" | "error" | "sent";

/**
 * Real contact form. Accessible labelled fields, inline validation, a proper
 * success state. The submit is client-side (mailto compose) so it works with
 * zero backend today — swap `handleSubmit` for a call to your pipeline (the
 * hook point is marked below) when you wire this up.
 */
export function Contact({ kicker, title, body }: ContactProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!name.trim() || !okEmail || !message.trim()) {
      setStatus("error");
      return;
    }
    // --- WIRE-UP HOOK: send to your backend/CRM here instead of mailto. ---
    const subject = encodeURIComponent(`New enquiry from ${name}`);
    const bodyText = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
    window.location.href = `mailto:hello@akal.digital?subject=${subject}&body=${bodyText}`;
    setStatus("sent");
  };

  return (
    <section id="contact" className="akal-contact">
      <div className="akal-contact__grid">
        <div className="akal-contact__lead">
          <p className="akal-contact__kicker">{kicker}</p>
          <h2 className="akal-contact__title">{title}</h2>
          <p className="akal-contact__body">{body}</p>
        </div>

        <MarkFrame className="akal-contact__panel">
          {status === "sent" ? (
            <div className="akal-contact__done" role="status">
              <span className="akal-contact__done-mark">✓</span>
              <h3>Thanks — message away.</h3>
              <p>Your mail client should have opened. We'll get back to you.</p>
            </div>
          ) : (
            <form className="akal-contact__form" onSubmit={submit} noValidate>
              <label className="akal-contact__field">
                <span className="akal-contact__label">Name</span>
                <input
                  className="akal-contact__input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>
              <label className="akal-contact__field">
                <span className="akal-contact__label">Email</span>
                <input
                  className="akal-contact__input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                />
              </label>
              <label className="akal-contact__field">
                <span className="akal-contact__label">Message</span>
                <textarea
                  className="akal-contact__input akal-contact__textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Where you are, and where you want to be."
                />
              </label>
              {status === "error" && (
                <p className="akal-contact__err" role="alert">
                  Please add a name, a valid email, and a message.
                </p>
              )}
              <button className="akal-contact__submit" type="submit">
                Send enquiry
              </button>
            </form>
          )}
        </MarkFrame>
      </div>
    </section>
  );
}
