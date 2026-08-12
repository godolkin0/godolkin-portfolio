import { useRef, useState } from "react";
import { Reveal } from "./Reveal.jsx";
import { PracticeGraph } from "./PracticeGraph.jsx";
import { useI18n } from "../i18n.jsx";
import { STAGES } from "../data/graph.js";
import { usePinsEnabled } from "../hooks/useMediaQuery.js";
import { useScrollPin } from "../hooks/useScrollPin.js";

// The seven-stage loop in plain business language, one line each. The order is
// read from the graph data, so the section and the hero can never drift apart.
//
// Two renderings of the same content. Pinned, the visitor's scroll advances the
// loop one step at a time and each stage lights in the graph beside it. Without
// pins (under 1024px, or reduced motion) the identical seven lines render as an
// ordinary list, all present, nothing waiting on a timeline.
export function HowIWork() {
  const pinned = usePinsEnabled();
  return pinned ? <PinnedLoop /> : <PlainList />;
}

function SectionHead({ children }) {
  const { t } = useI18n();
  const s = t.howIWork;
  return (
    <>
      <p className="t-label text-[var(--color-muted)]">{s.kicker}</p>
      <h2 className="t-display mt-5 max-w-3xl">
        {s.titleA}
        <br />
        <span className="t-display-soft">{s.titleB}</span>
      </h2>
      <p className="t-body mt-6 max-w-xl text-[var(--color-muted)]">{s.lede}</p>
      {children}
    </>
  );
}

function PinnedLoop() {
  const { t, lang } = useI18n();
  const s = t.howIWork;
  const sectionRef = useRef(null);
  const [index, setIndex] = useState(0);

  useScrollPin({
    ref: sectionRef,
    // Seven beats. Two viewport heights keeps each one long enough to read
    // without turning the section into a tunnel.
    end: "+=200%",
    deps: [lang],
    onProgress: (progress) => {
      // Only ever setState on a beat change. Setting it every scroll frame
      // would re-render the whole section sixty times a second to display the
      // same sentence.
      const next = Math.min(STAGES.length - 1, Math.max(0, Math.floor(progress * STAGES.length)));
      setIndex((prev) => (prev === next ? prev : next));
    },
  });

  const stage = STAGES[index];
  const copy = s.stages[stage.id];

  return (
    <section id="how-i-work" ref={sectionRef} className="wash wash-b grain relative min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-20 sm:px-10">
        <SectionHead />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            {/* Seven beats, and which one you are on. */}
            <ol className="flex items-center gap-2" aria-hidden="true">
              {STAGES.map((st, i) => (
                <li
                  key={st.id}
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                    i <= index ? "bg-[var(--color-ink)]/45" : "bg-[var(--color-line)]/60"
                  }`}
                />
              ))}
            </ol>

            <p className="t-mono mt-8 text-[var(--color-muted)]">
              {String(index + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}
            </p>
            <h3 className="t-display mt-3">{copy.name}</h3>
            <p className="t-body mt-5 max-w-lg text-[var(--color-muted)]">{copy.copy}</p>

            {/* The whole list stays in the DOM and readable to assistive tech,
                so the pinned rendering never hides six of the seven steps from
                anyone who is not driving it with a scrollbar. */}
            <ol className="sr-only">
              {STAGES.map((st) => (
                <li key={st.id}>
                  {s.stages[st.id].name}: {s.stages[st.id].copy}
                </li>
              ))}
            </ol>
          </div>

          <div className="hidden h-[26rem] lg:block">
            {/* Simplified: 36 nodes would bury the seven steps this section
                exists to explain. Not interactive: the scrub owns the highlight,
                and a stray pointer must not fight it. */}
            <PracticeGraph
              lang={lang}
              simplified
              interactive={false}
              activeId={stage.id}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlainList() {
  const { t } = useI18n();
  const s = t.howIWork;
  return (
    <section id="how-i-work" className="wash wash-b grain relative">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <SectionHead />
        </Reveal>

        <ol className="mt-16 border-t border-[var(--color-line)]/60">
          {STAGES.map((stage, i) => {
            const copy = s.stages[stage.id];
            // Reveal renders AS the <li>, so the list stays a real list.
            return (
              <Reveal
                as="li"
                key={stage.id}
                delay={i * 40}
                className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-[var(--color-line)]/60 py-6 sm:grid-cols-[3.5rem_11rem_1fr] sm:gap-x-8"
              >
                <span className="t-mono text-[var(--color-muted)]">{String(i + 1).padStart(2, "0")}</span>
                <span className="t-display-sm">{copy.name}</span>
                <p className="t-body col-span-2 text-[var(--color-muted)] sm:col-span-1">{copy.copy}</p>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
