// Shared pieces for the three interactive demos. Ported from the dark build and
// restyled for the light palette: the structure and the staged-reveal behaviour
// are unchanged, only the surface is new.
import { useI18n } from "../i18n.jsx";

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-3 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)] align-middle"
    />
  );
}

// Tone maps to meaning, not decoration. Orange is reserved for the one thing in
// a result that the visitor is supposed to look at first.
export function Badge({ tone = "dim", children }) {
  const tones = {
    dim: "border-[var(--color-line)] text-[var(--color-muted)]",
    ink: "border-[var(--color-ink)]/30 text-[var(--color-ink)]",
    accent: "border-[var(--color-accent)]/45 bg-[var(--color-accent)]/8 text-[var(--color-accent)]",
  };
  return (
    <span
      className={`t-mono inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

// One pipeline stage row: number, title, spinner while running, content when done.
export function Stage({ index, title, status, children }) {
  const { t } = useI18n();
  const idle = status === "pending";
  return (
    <div
      className={`border-l pb-1 pl-4 transition-colors duration-300 ${
        idle ? "border-[var(--color-line)]/60" : "border-[var(--color-ink)]/25"
      }`}
    >
      {/* A pending stage is quieter, never fainter than legible: --line is a
          hairline colour at 1.46:1 and was never a text colour. The idle state
          is carried by the muted grey and by the border instead. */}
      <div className="t-mono flex items-center gap-2">
        <span className="text-[var(--color-muted)]">{String(index + 1).padStart(2, "0")}</span>
        <span className={`t-label ${idle ? "text-[var(--color-muted)]" : "text-[var(--color-ink)]"}`}>
          {title}
        </span>
        {status === "running" && <Spinner />}
      </div>
      {status === "done" && <div className="mt-2">{children}</div>}
      {status === "running" && (
        <div className="t-mono mt-2 text-[var(--color-muted)]">{t.common.processing}</div>
      )}
    </div>
  );
}

// The frame around each demo. A quiet panel, not a terminal: the dark build's
// window chrome and traffic lights would fight the light page for attention and
// make a working system look like a screenshot of one.
export function DemoShell({ title, badge, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-line)]/70 bg-white/60 backdrop-blur-[2px]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)]/70 px-4 py-3 sm:px-5">
        <span className="t-mono text-[var(--color-muted)]">{title}</span>
        {badge && <span className="ml-auto">{badge}</span>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function RunButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="t-label inline-flex items-center gap-2 rounded-full bg-[var(--color-dark)] px-5 py-3 text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}

// A small chip used to load an example into a demo.
export function ChipButton({ onClick, active = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`t-mono rounded-full border px-3 py-1.5 text-left text-[12px] transition-colors duration-200 ${
        active
          ? "border-[var(--color-ink)]/40 bg-[var(--color-ink)]/5 text-[var(--color-ink)]"
          : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-ink)]/30 hover:text-[var(--color-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

export function Panel({ className = "", children }) {
  return (
    <div className={`rounded-xl border border-[var(--color-line)]/70 bg-white/70 p-3 ${className}`}>{children}</div>
  );
}
