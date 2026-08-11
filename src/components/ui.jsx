import { SITE } from "../config.js";
import { useI18n } from "../i18n.jsx";

// The one orange mark on the page, and the whole reason the accent exists.
// Everything else is black, white or grey; that restraint is what stops a
// light page from looking like a template.
export function ArrowMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={`inline-block h-[0.7em] w-[0.7em] shrink-0 ${className}`}
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12L12 4" />
      <path d="M5.5 4H12v6.5" />
    </svg>
  );
}

// Fully-rounded black pill, white uppercase label, wide tracking, orange arrow.
export function PillButton({ as = "a", className = "", children, ...props }) {
  const Tag = as;
  return (
    <Tag
      className={`t-label inline-flex items-center gap-2.5 rounded-full bg-[var(--color-dark)] px-7 py-4 text-white transition-transform duration-200 hover:-translate-y-0.5 ${className}`}
      {...props}
    >
      {children}
      <ArrowMark />
    </Tag>
  );
}

// Thin outline, fully rounded, tiny uppercase label, transparent fill.
export function Pill({ className = "", children }) {
  return (
    <span
      className={`t-label inline-flex items-center rounded-full border border-[var(--color-line)] px-3 py-1.5 text-[var(--color-muted)] ${className}`}
    >
      {children}
    </span>
  );
}

// The persistent CTA. Fixed, and clickable through every pinned section: that
// is what makes pinning safe, because the visitor can leave the sequence at any
// moment instead of having to scroll out of it to reach the one thing the page
// is for.
export function BookCallButton() {
  const { t } = useI18n();
  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-8 sm:bottom-8">
      <PillButton href="#book" className="shadow-[0_8px_30px_rgb(16_24_32_/_0.16)]">
        {t.nav.bookACall}
      </PillButton>
    </div>
  );
}

export function LanguageToggle({ className = "" }) {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "it" : "en")}
      aria-label={t.nav.language}
      className={`t-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] ${className}`}
    >
      <span className={lang === "en" ? "text-[var(--color-ink)]" : undefined}>EN</span>
      <span aria-hidden="true" className="px-1.5 opacity-40">
        /
      </span>
      <span className={lang === "it" ? "text-[var(--color-ink)]" : undefined}>IT</span>
    </button>
  );
}

export function SiteHeader() {
  const { t } = useI18n();
  const links = [
    { href: "#how-i-work", label: t.nav.howIWork },
    { href: "#live-systems", label: t.nav.liveSystems },
    { href: "#about", label: t.nav.about },
  ];

  // On phones the graph drops to its simplified form and stops being a way to
  // get around, so the conventional nav is the only navigation there is. It
  // moves to its own row rather than disappearing: hiding it left a 360px
  // visitor with a wordmark, a language toggle and no way to reach anything.
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="flex items-center justify-between px-5 pt-5 sm:px-10 sm:py-7">
        <a href="#top" className="t-label font-medium tracking-[0.3em] text-[var(--color-ink)]">
          GODOLKIN
        </a>
        <nav className="flex items-center gap-5 sm:gap-9">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="t-body hidden text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] sm:inline"
            >
              {link.label}
            </a>
          ))}
          <LanguageToggle />
        </nav>
      </div>

      <nav className="flex items-center gap-4 px-5 pt-3 pb-1 sm:hidden" aria-label="Sections">
        {links.map((link) => (
          <a key={link.href} href={link.href} className="t-label text-[var(--color-muted)]">
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

export { SITE };
