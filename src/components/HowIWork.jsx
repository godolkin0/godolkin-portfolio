import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";
import { STAGES } from "../data/graph.js";

// The seven-stage loop in plain business language, one line each. The order is
// read from the graph data, so the section and the hero can never drift apart.
export function HowIWork() {
  const { t } = useI18n();
  const s = t.howIWork;

  return (
    <section id="how-i-work" className="wash wash-b grain relative">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <p className="t-label text-[var(--color-muted)]">{s.kicker}</p>
          <h2 className="t-display mt-5 max-w-3xl">
            {s.titleA}
            <br />
            <span className="t-display-soft">{s.titleB}</span>
          </h2>
          <p className="t-body mt-6 max-w-xl text-[var(--color-muted)]">{s.lede}</p>
        </Reveal>

        <ol className="mt-16 border-t border-[var(--color-line)]/60">
          {STAGES.map((stage, i) => {
            const copy = s.stages[stage.id];
            return (
              <Reveal key={stage.id} delay={i * 40}>
                <li className="grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-[var(--color-line)]/60 py-6 sm:grid-cols-[3.5rem_11rem_1fr] sm:gap-x-8">
                  <span className="t-mono text-[var(--color-muted)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-display-sm">{copy.name}</span>
                  <p className="t-body col-span-2 text-[var(--color-muted)] sm:col-span-1">{copy.copy}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
