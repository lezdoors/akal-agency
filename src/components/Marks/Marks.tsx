import type { ReactNode } from "react";
import "./Marks.css";

/**
 * The print-system motif that runs through every section — crop marks and a
 * registration cross. These belong to both eras and therefore to neither, so
 * they are the thread tying the antique plates to the brutalist type.
 */
export function MarkFrame({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`marks${className ? ` ${className}` : ""}`}>
      {children}
      <span className="marks__crop marks__crop--tl" aria-hidden="true" />
      <span className="marks__crop marks__crop--tr" aria-hidden="true" />
      <span className="marks__crop marks__crop--bl" aria-hidden="true" />
      <span className="marks__crop marks__crop--br" aria-hidden="true" />
    </div>
  );
}

export function RegCross({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`marks__reg${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" fill="none" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
