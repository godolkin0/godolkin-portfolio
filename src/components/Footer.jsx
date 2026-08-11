import { useI18n } from "../i18n.jsx";
import { SITE } from "../config.js";

// Email and LinkedIn live here and nowhere else. LinkedIn is currently null in
// config.js because the only URL available carries the real name in its slug,
// and the site carries the Godolkin brand only.
export function Footer() {
  const { t } = useI18n();
  const s = t.footer;

  return (
    <footer className="border-t border-[var(--color-line)]/60 bg-[var(--color-bg)]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-10">
        {/* The honesty line. It is the most persuasive sentence on the page and
            it is only persuasive because it is true. */}
        <p className="t-secondary max-w-2xl">{s.honesty}</p>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--color-line)]/60 pt-6">
          <p className="t-label text-[var(--color-muted)]">{s.rights}</p>
          <div className="flex items-center gap-6">
            <a
              href={`mailto:${SITE.email}`}
              className="t-label text-[var(--color-muted)] underline decoration-[var(--color-line)] underline-offset-8 transition-colors hover:text-[var(--color-ink)]"
            >
              {s.email}
            </a>
            {SITE.linkedin && (
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="t-label text-[var(--color-muted)] underline decoration-[var(--color-line)] underline-offset-8 transition-colors hover:text-[var(--color-ink)]"
              >
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
