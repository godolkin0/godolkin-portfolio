import { useEffect } from "react";
import { LanguageProvider, useI18n } from "./i18n.jsx";
import { BookCallButton, SiteHeader } from "./components/ui.jsx";
import { Hero } from "./components/Hero.jsx";
import { HowIWork } from "./components/HowIWork.jsx";
import { LiveSystems } from "./components/LiveSystems.jsx";
import { About } from "./components/About.jsx";
import { BookCall } from "./components/BookCall.jsx";
import { Footer } from "./components/Footer.jsx";
import { useScrollTriggerRefresh } from "./hooks/useScrollPin.js";
import { installPageTracking, trackOnce } from "./lib/analytics.js";

// One observer for the whole page instead of instrumentation inside each
// section. The sections already carry the anchor ids the nav points at, so the
// ids are the vocabulary; adding a section to the array below is the entire
// cost of measuring a new one.
//
// The threshold is expressed as a rootMargin, NOT as an intersection ratio.
// A ratio is measured against the target's own height, and these sections are
// taller than the viewport: a section three screens tall can never exceed a
// ratio of about 0.33, so a plausible-looking `threshold: 0.5` would silently
// record nothing at all. Shrinking the root to its middle band instead asks the
// question that was actually meant, which is whether the section is what the
// visitor is looking at, and it asks it the same way at any section height.
const TRACKED_SECTIONS = ["how-i-work", "live-systems", "about", "book"];

function usePageTracking() {
  useEffect(() => {
    const stopPageTracking = installPageTracking();
    if (typeof IntersectionObserver === "undefined") return stopPageTracking;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) trackOnce("section_view", { section: entry.target.id });
        }
      },
      { rootMargin: "-25% 0px -25% 0px" }
    );
    for (const id of TRACKED_SECTIONS) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }

    return () => {
      observer.disconnect();
      stopPageTracking();
    };
  }, []);
}

function Page() {
  const { t } = useI18n();
  // Pinned heights are measured from laid-out content, so late reflows (fonts,
  // most of all) silently invalidate every pin and every anchor target.
  useScrollTriggerRefresh();
  usePageTracking();
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
