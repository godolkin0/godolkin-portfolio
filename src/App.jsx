import { LanguageProvider, useI18n } from "./i18n.jsx";
import { BookCallButton, SiteHeader } from "./components/ui.jsx";
import { Hero } from "./components/Hero.jsx";
import { HowIWork } from "./components/HowIWork.jsx";
import { LiveSystems } from "./components/LiveSystems.jsx";
import { About } from "./components/About.jsx";
import { BookCall } from "./components/BookCall.jsx";
import { Footer } from "./components/Footer.jsx";
import { useScrollTriggerRefresh } from "./hooks/useScrollPin.js";

function Page() {
  const { t } = useI18n();
  // Pinned heights are measured from laid-out content, so late reflows (fonts,
  // most of all) silently invalidate every pin and every anchor target.
  useScrollTriggerRefresh();
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
        <HowIWork />
        <LiveSystems />
        <About />
        <BookCall />
      </main>
      <Footer />
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
