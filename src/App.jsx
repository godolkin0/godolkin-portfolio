import { useState } from "react";
import PolymarketDemo from "./components/PolymarketDemo";
import TriageDemo from "./components/TriageDemo";
import ReportDemo from "./components/ReportDemo";
import { Badge } from "./components/ui";
import { Reveal } from "./components/Reveal";
import { useI18n } from "./i18n";
import { SITE } from "./config";

const EMAIL = "godolkin0@gmail.com";

// Gmail's own compose URL, so this opens gmail.com in the browser instead of
// whatever the visitor's OS has set as the default mail app (e.g. Outlook).
function gmailComposeHref(subject) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(subject)}`;
}

export default function App() {
  const { t } = useI18n();
  const emailHref = gmailComposeHref(t.mailSubject);

  return (
    <div className="relative">
      <GridBackdrop />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <Header emailHref={emailHref} />
        <Hero emailHref={emailHref} />
        <main id="work" className="space-y-20 pb-24 pt-4">
          <CaseStudy index={1} copy={t.cases.c1} actions={<ProofLinks />}>
            <PolymarketDemo />
          </CaseStudy>
          <CaseStudy index={2} copy={t.cases.c2}>
            <TriageDemo />
          </CaseStudy>
          <CaseStudy index={3} copy={t.cases.c3}>
            <ReportDemo />
          </CaseStudy>
        </main>
        <HowIWork />
        <Contact emailHref={emailHref} />
        <Footer />
      </div>
    </div>
  );
}

// Subtle fixed grid, barely visible: quiet texture behind everything.
function GridBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_30%,transparent_100%)]"
    />
  );
}

function AvailabilityLine({ className = "" }) {
  const { t } = useI18n();
  return (
    <p className={`font-mono text-xs text-dim ${className}`}>
      <span className="mr-1.5 inline-block size-1.5 animate-pulse rounded-full bg-accent align-middle" />
      {t.avail.status} · {SITE.timezone} · {t.avail.replies}
    </p>
  );
}

// Verification links for the flagship case study. Each renders only when its
// URL exists in src/config.js, so nothing here can point at a dead page.
function ProofLinks() {
  const { t } = useI18n();
  const links = [
    SITE.repoUrl && { href: SITE.repoUrl, icon: "</>", label: t.proof.seeCode },
    SITE.videoUrl && { href: SITE.videoUrl, icon: "▶", label: t.proof.watchRun },
  ].filter(Boolean);
  if (links.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-3.5 py-1.5 font-mono text-xs text-dim transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-fg"
        >
          <span className="text-accent">{link.icon}</span> {link.label}
        </a>
      ))}
    </div>
  );
}

function CopyEmail({ className = "" }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(EMAIL);
      ok = true;
    } catch {
      // Fallback for browsers without the async clipboard API.
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={t.contact.copyAria}
      className={`group inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-1.5 font-mono text-xs text-dim transition duration-200 hover:border-accent/50 hover:text-fg ${className}`}
    >
      {EMAIL}
      <span className={copied ? "font-semibold text-accent" : "text-faint transition group-hover:text-fg"}>
        {copied ? t.contact.copied : "⧉"}
      </span>
    </button>
  );
}

function Header({ emailHref }) {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="sticky top-0 z-40 -mx-4 flex items-center justify-between border-b border-line/60 bg-ink/85 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:px-6">
      <a href="#" className="font-mono text-sm font-bold tracking-widest text-fg">
        GODOLKIN<span className="text-accent">_</span>
      </a>
      <div className="flex items-center gap-2.5">
        <div className="flex rounded-lg border border-line bg-panel p-0.5 font-mono text-[11px]">
          {["en", "it"].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-md px-2.5 py-1 uppercase transition duration-200 ${
                lang === l ? "bg-accent font-bold text-ink" : "text-dim hover:text-fg"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <a
          href={emailHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-line px-3.5 py-1.5 font-mono text-xs text-dim transition duration-200 hover:border-accent/50 hover:text-fg"
        >
          {t.nav.contact}
        </a>
      </div>
    </header>
  );
}

function Hero({ emailHref }) {
  const { t } = useI18n();
  return (
    <section className="relative py-16 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
        <div className="absolute -top-24 left-[10%] h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-16 right-[5%] h-72 w-72 rounded-full bg-accent-2/10 blur-3xl" />
      </div>
      <Reveal>
        <p className="font-mono text-sm text-accent">{t.hero.kicker}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-fg sm:text-6xl">
          {t.hero.titleA}{" "}
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">{t.hero.titleB}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-dim">{t.hero.sub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={emailHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-accent px-5 py-2.5 font-mono text-sm font-semibold text-ink shadow-lg shadow-accent/20 transition duration-200 hover:-translate-y-0.5 hover:bg-accent/85 hover:shadow-accent/30"
          >
            {EMAIL} →
          </a>
          <a
            href="#work"
            className="rounded-lg border border-line px-5 py-2.5 font-mono text-sm text-dim transition duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:text-fg"
          >
            {t.hero.seeDemos}
          </a>
        </div>
        <AvailabilityLine className="mt-6" />
      </Reveal>
    </section>
  );
}

function CaseStudy({ index, copy, actions, children }) {
  return (
    <section className="scroll-mt-24">
      <Reveal>
        <div className="mb-5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm text-faint">0{index}</span>
            <h2 className="text-2xl font-bold text-fg">{copy.title}</h2>
            <Badge tone="accent">{copy.flag}</Badge>
          </div>
          <div className="mt-3 space-y-2.5">
            {copy.paras.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-dim">
                {p}
              </p>
            ))}
          </div>
          {copy.highlight && (
            <p className="mt-3 border-l-2 border-accent/60 pl-3 text-[15px] italic leading-relaxed text-fg/85">
              {copy.highlight}
            </p>
          )}
          {actions}
        </div>
        {children}
      </Reveal>
    </section>
  );
}

function HowIWork() {
  const { t } = useI18n();
  return (
    <section id="how" className="border-t border-line py-16">
      <Reveal>
        <h2 className="text-2xl font-bold text-fg">{t.how.title}</h2>
      </Reveal>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {t.how.items.map((p, i) => (
          <Reveal key={p.title} delay={i * 90}>
            <div className="h-full rounded-xl border border-line bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_40px_-16px_rgba(52,211,153,0.25)]">
              <h3 className="font-mono text-sm font-semibold text-accent">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Contact({ emailHref }) {
  const { t } = useI18n();
  return (
    <section id="contact" className="border-t border-line py-20 text-center">
      <Reveal>
        <h2 className="text-3xl font-extrabold text-fg sm:text-4xl">{t.contact.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-dim">{t.contact.sub}</p>
        <a
          href={emailHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-xl bg-accent px-8 py-3.5 font-mono text-base font-bold text-ink shadow-lg shadow-accent/20 transition duration-200 hover:-translate-y-0.5 hover:bg-accent/85 hover:shadow-accent/40"
        >
          {t.contact.button}
        </a>
        <div className="mt-4">
          <CopyEmail />
        </div>
        {(SITE.linkedin || SITE.telegram || SITE.bookingUrl) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {SITE.linkedin && (
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line px-4 py-2 font-mono text-xs text-dim transition duration-200 hover:border-accent-2/50 hover:text-fg"
              >
                {t.contact.linkedin} →
              </a>
            )}
            {SITE.telegram && (
              <a
                href={`https://t.me/${SITE.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-line px-4 py-2 font-mono text-xs text-dim transition duration-200 hover:border-accent-2/50 hover:text-fg"
              >
                {t.contact.telegram} →
              </a>
            )}
            {SITE.bookingUrl && (
              <a
                href={SITE.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-accent/50 px-4 py-2 font-mono text-xs text-accent transition duration-200 hover:bg-accent/10"
              >
                {t.contact.booking} →
              </a>
            )}
          </div>
        )}
        <AvailabilityLine className="mt-6" />
      </Reveal>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line py-8 text-center font-mono text-xs text-faint">
      <p>{t.footer}</p>
    </footer>
  );
}
