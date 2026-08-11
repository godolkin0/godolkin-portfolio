import { PracticeGraph } from "./PracticeGraph.jsx";
import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";
import { MOBILE_QUERY, useMediaQuery } from "../hooks/useMediaQuery.js";

// The hero is the graph, full viewport, edge to edge. No headline slab sits on
// top of it: one line resolves in body-sized display type at lower left, which
// is the minimum a hero needs to not read as a bounce.
export function Hero() {
  const { t, lang } = useI18n();
  const isMobile = useMediaQuery(MOBILE_QUERY);

  return (
    <section id="top" className="wash grain relative min-h-[100svh] overflow-hidden">
      {/* The graph sits behind the copy and stays interactive: the overlay
          below is pointer-transparent except where it actually has content.
          It stops short of the bottom band rather than running the full height,
          because a node drifting under the headline puts a grey dot through the
          one sentence on the page that has to be read. */}
      <div className="absolute inset-x-0 top-0 bottom-[30svh] flex items-center justify-center sm:bottom-[26svh]">
        <PracticeGraph lang={lang} isMobile={isMobile} className="h-full w-full" />
      </div>

      <div className="pointer-events-none relative flex min-h-[100svh] flex-col justify-end px-5 pb-28 sm:px-10 sm:pb-16">
        <Reveal className="pointer-events-auto max-w-[42rem]">
          <h1 className="t-display">
            {t.hero.lineA}
            <br />
            <span className="t-display-soft">{t.hero.lineB}</span>
          </h1>
          <p className="t-label mt-5 text-[var(--color-muted)]">{t.hero.byline}</p>
        </Reveal>
      </div>
    </section>
  );
}
