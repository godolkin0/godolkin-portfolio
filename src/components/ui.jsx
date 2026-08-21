import { useEffect, useState } from "react";
import { SITE } from "../config.js";
import { useI18n } from "../i18n.jsx";
import { track } from "../lib/analytics.js";

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
  const [overBooking, setOverBooking] = useState(false);

  // Stand down once the booking section is on screen. A floating button sits on
  // top of whatever is under it, and down there that was the contact form: it
  // covered a text input on phones and an interest checkbox on desktop, so the
  // shortcut to the form was blocking the form. It is also simply redundant
  // there, since the thing it points at is already in view.
  //
  // Default is VISIBLE and it only ever hides on a positive sighting, so if the
  // observer never runs the CTA is still there. The pinned sections are far
  // above #book, so it stays present and clickable through every pin.
  useEffect(() => {
    const target = document.getElementById("book");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOverBooking(entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 transition-opacity duration-300 sm:right-8 sm:bottom-8 ${
        overBooking ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={overBooking}
    >
      <PillButton
        href="#book"
        tabIndex={overBooking ? -1 : undefined}
        // Worth its own event and not merged into the booking section view:
        // together they answer whether this button earns the screen space it
        // permanently occupies, or whether visitors were scrolling there anyway.
        onClick={() => track("cta_clicked", { target: "book" })}
        className="shadow-[0_8px_30px_rgb(16_24_32_/_0.16)]"
      >
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
      onClick={() => {
        const next = lang === "en" ? "it" : "en";
        // The one number that decides whether the Italian half of copy.js is
        // worth the maintenance it costs.
        track("language_switched", { to: next });
        setLang(next);
      }}
      className={`t-label text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] ${className}`}
    >
      {/* No aria-label. One overriding the visible "EN / IT" produced an
          accessible name that did not contain the button's own text, which
          breaks voice control: a user saying "click EN slash IT" addresses a
          control the browser thinks is called something else entirely. The
          description is added as text instead, so the spoken name is a
          superset of what is on screen. */}
      <span className="sr-only">{t.nav.language}</span>
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
