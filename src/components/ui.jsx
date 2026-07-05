// Small shared pieces used by all three demos.
import { useI18n } from "../i18n";

export function Spinner() {
  return (
    <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-line border-t-accent align-middle" />
  );
}

export function Badge({ tone = "dim", children }) {
  const tones = {
    dim: "border-line text-dim",
    accent: "border-accent/40 bg-accent/10 text-accent",
    cyan: "border-accent-2/40 bg-accent-2/10 text-accent-2",
    warn: "border-warn/40 bg-warn/10 text-warn",
    danger: "border-danger/40 bg-danger/10 text-danger",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

// One pipeline stage row: number, title, spinner while running, children when done.
export function Stage({ index, title, status, children }) {
  const { t } = useI18n();
  return (
    <div className={`border-l-2 pb-1 pl-4 transition-colors duration-300 ${status === "pending" ? "border-line/50" : "border-accent/50"}`}>
      <div className="flex items-center gap-2 font-mono text-xs tracking-wide">
        <span className={status === "pending" ? "text-faint" : "text-accent"}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`font-semibold uppercase ${status === "pending" ? "text-faint" : "text-fg"}`}>{title}</span>
        {status === "running" && <Spinner />}
        {status === "done" && <span className="text-accent">✓</span>}
      </div>
      {status === "done" && <div className="mt-2 animate-fade-up">{children}</div>}
      {status === "running" && <div className="mt-2 font-mono text-xs text-faint">{t.common.processing}</div>}
    </div>
  );
}

// Terminal-style frame around each demo.
export function DemoShell({ title, badge, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel shadow-[0_16px_48px_-24px_rgba(0,0,0,0.8)] transition-colors duration-300 hover:border-line/80">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel-2 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-danger/70" />
          <span className="size-2.5 rounded-full bg-warn/70" />
          <span className="size-2.5 rounded-full bg-accent/70" />
        </div>
        <span className="font-mono text-xs text-dim">{title}</span>
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
      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-mono text-sm font-semibold text-ink shadow-md shadow-accent/20 transition duration-200 hover:-translate-y-0.5 hover:bg-accent/85 hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
