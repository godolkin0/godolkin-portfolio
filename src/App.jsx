import { LanguageProvider, useI18n } from "./i18n.jsx";
import { BookCallButton, SiteHeader } from "./components/ui.jsx";
import { Hero } from "./components/Hero.jsx";

// Sections below the hero land in the next pass. Their anchors exist now so the
// nav and the graph's click-to-dive both have somewhere real to go.
function Placeholder({ id, title }) {
  return (
    <section id={id} className="wash wash-b grain relative border-t border-[var(--color-line)]/40">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10">
        <p className="t-label text-[var(--color-muted)]">{title}</p>
      </div>
    </section>
  );
}

function Page() {
  const { t } = useI18n();
  return (
    <>
      <a
        href="#how-i-work"
        className="t-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[var(--color-dark)] focus:px-5 focus:py-3 focus:text-white"
      >
        {t.nav.skipToContent}
      </a>
      <SiteHeader />
      <main>
        <Hero />
        <Placeholder id="how-i-work" title={t.nav.howIWork} />
        <Placeholder id="live-systems" title={t.nav.liveSystems} />
        <Placeholder id="about" title={t.nav.about} />
        <Placeholder id="book" title={t.nav.bookACall} />
      </main>
      <BookCallButton />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}
