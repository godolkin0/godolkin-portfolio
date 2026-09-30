import { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";
import { CONSENT_EVENT, denyConsent, grantConsent, readConsent } from "../lib/metaPixel.js";

// Shown only while the visitor has not answered (or reopened from the footer).
// Accept and Reject are the same size and weight: the Garante treats a
// harder-to-find "reject" as invalid consent. No animation on the text, per the
// site's legibility invariant: it renders opaque from its first frame.
export function CookieBanner() {
  const { t } = useI18n();
  const s = t.cookies;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (granted) => {
    if (granted) grantConsent();
    else denyConsent();
    setOpen(false);
  };

  const button =
    "t-label flex-1 rounded-full px-5 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)]/40";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={s.title}
      className="fixed inset-x-4 bottom-4 z-[60] rounded-2xl border border-[var(--color-line)] bg-white p-5 shadow-[0_8px_30px_rgb(16_24_32_/_0.16)] sm:right-auto sm:bottom-8 sm:left-8 sm:max-w-md sm:p-6"
    >
      <p className="t-label text-[var(--color-ink)]">{s.title}</p>
      <p className="t-secondary mt-3 text-[var(--color-muted)]">
        {s.body}{" "}
        <a href="/privacy.html" className="text-[var(--color-ink)] underline underline-offset-4">
          {s.policy}
        </a>
      </p>
      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => choose(false)}
          className={`${button} border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-wash)]`}
        >
          {s.reject}
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className={`${button} border border-[var(--color-dark)] bg-[var(--color-dark)] text-white hover:bg-[var(--color-ink)]`}
        >
          {s.accept}
        </button>
      </div>
    </div>
  );
}
