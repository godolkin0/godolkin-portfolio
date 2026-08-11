import { useRef } from "react";
import { PracticeGraph } from "./PracticeGraph.jsx";
import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";
import { MOBILE_QUERY, useMediaQuery } from "../hooks/useMediaQuery.js";
import { useScrollPin } from "../hooks/useScrollPin.js";

// The hero is the graph, full viewport, edge to edge. No headline slab sits on
// top of it: one line resolves in display type at lower left, which is the
// minimum a hero needs to not read as a bounce.
//
// Pinned for ~1.2 viewport heights on desktop, where the visitor's own scroll
// builds the graph: stages fade in, then capabilities, then the edges draw.
//
// The systems tier is deliberately NOT part of the build. Starting from an
// empty canvas would mean anyone who lands and does not scroll gets a blank
// hero, which is the same failure this site already shipped once and the same
// thing the no-loading-screen rule exists to prevent. So first paint always
// carries the six labelled systems and the headline, and scrolling adds the
// structure around them. Turning that into a full build from nothing is a
// one-line change: add the systems selector to the timeline below.
export function Hero() {
  const { t, lang } = useI18n();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const sectionRef = useRef(null);

  useScrollPin({
    ref: sectionRef,
    end: "+=120%",
    deps: [isMobile, lang],
    build: (timeline, el) => {
      const stages = el.querySelectorAll('[data-tier="stage"]');
      const capabilities = el.querySelectorAll('[data-tier="capability"]');
      const edges = el.querySelectorAll(".graph-edge");

      timeline
        .from(stages, { opacity: 0, duration: 0.25, stagger: 0.01 }, 0)
        .from(capabilities, { opacity: 0, duration: 0.3, stagger: 0.004 }, 0.12)
        // Edges are normalised to pathLength 1, so one offset draws them all.
        .from(edges, { strokeDashoffset: 1, duration: 0.45, stagger: 0.002 }, 0.1)
        // The headline moves; it never fades. Legibility is not animated here,
        // only motion is, and a scrub can be parked at any progress value
        // indefinitely, including zero.
        .from(".hero-copy", { y: 18, duration: 0.5 }, 0);
    },
  });

  return (
    <section id="top" ref={sectionRef} className="wash grain relative min-h-[100svh] overflow-hidden">
      {/* The graph sits behind the copy and stays interactive: the overlay
          below is pointer-transparent except where it actually has content.
          It stops short of the bottom band rather than running the full height,
          because a node drifting under the headline puts a grey dot through the
          one sentence on the page that has to be read. */}
      <div className="absolute inset-x-0 top-0 bottom-[30svh] flex items-center justify-center sm:bottom-[26svh]">
        <PracticeGraph lang={lang} simplified={isMobile} className="h-full w-full" />
      </div>

      <div className="pointer-events-none relative flex min-h-[100svh] flex-col justify-end px-5 pb-28 sm:px-10 sm:pb-16">
        <Reveal className="hero-copy pointer-events-auto max-w-[42rem]">
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
