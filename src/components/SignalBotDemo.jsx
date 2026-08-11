import { useMemo, useState } from "react";
import { SCENARIOS } from "../data/scenarios.js";
import { MAX_BET, MIN_EDGE, analyzeScenario, formatAlertLines, pct } from "../lib/polymarket.js";
import { usePipeline } from "../lib/usePipeline.js";
import { useI18n } from "../i18n.jsx";
import { ChipButton, DemoShell, Panel, RunButton, Stage } from "./demo-ui.jsx";

// A replay, not a live trigger: the scenarios are historical and bundled, but
// every number shown is computed here by the same logic as the production bot
// (src/lib/polymarket.js, faithful to weather.py and edge.py).
export function SignalBotDemo({ badge }) {
  const { lang, t } = useI18n();
  const d = t.demoSignal;
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const pipeline = usePipeline(4, { gap: 450, spin: 650 });

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const result = useMemo(() => analyzeScenario(scenario), [scenario]);
  const alert = useMemo(() => formatAlertLines(result), [result]);
  const { forecast, edge } = result;

  return (
    <DemoShell title={d.shellTitle} badge={badge}>
      <div className="mb-3 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <ChipButton
            key={s.id}
            active={s.id === scenarioId}
            onClick={() => {
              setScenarioId(s.id);
              pipeline.reset();
            }}
          >
            <span className="block">{s.label[lang]}</span>
            <span className="block text-[10px] opacity-70">{s.chip[lang]}</span>
          </ChipButton>
        ))}
      </div>

      <p className="t-secondary mb-4 max-w-2xl">{scenario.note[lang]}</p>

      <div className="mb-6">
        <RunButton onClick={pipeline.run} disabled={pipeline.running}>
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-5">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          <Panel>
            <p className="t-body text-[15px]">"{scenario.question}"</p>
            <p className="t-mono mt-1.5 text-[var(--color-muted)]">
              {d.marketPrice} <span className="text-[var(--color-ink)]">{scenario.yesPrice.toFixed(2)}</span> (
              {pct(scenario.yesPrice)}) · {d.category}
            </p>
          </Panel>
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          <div className="space-y-2">
            <p className="t-mono text-[var(--color-muted)]">
              {d.parsedFrom} {d.city} <span className="text-[var(--color-ink)]">{scenario.parsed.city}</span> ·{" "}
              {d.threshold} <span className="text-[var(--color-ink)]">{scenario.parsed.threshold}</span>
            </p>
            <div className="t-mono flex flex-wrap gap-1">
              {scenario.forecast.map((v, i) => {
                const hit =
                  scenario.threshold.direction === "above"
                    ? v >= scenario.threshold.value
                    : v <= scenario.threshold.value;
                return (
                  <span
                    key={i}
                    className={`rounded border px-1.5 py-0.5 text-[11px] ${
                      hit
                        ? "border-[var(--color-ink)]/35 bg-[var(--color-ink)]/5 text-[var(--color-ink)]"
                        : "border-[var(--color-line)] text-[var(--color-muted)]"
                    }`}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
            <p className="t-mono text-[var(--color-muted)]">
              {d.pointsLine(forecast.matching, forecast.total, scenario.threshold.direction)} → {d.probability}{" "}
              <span className="text-[var(--color-ink)]">{pct(forecast.probability, 1)}</span> · {d.horizon}{" "}
              {forecast.hoursOut}h → {d.confidence}{" "}
              <span className="text-[var(--color-ink)]">{pct(forecast.confidence)}</span>
            </p>
          </div>
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          <div className="grid gap-2 sm:grid-cols-2">
            <Panel>
              <p className="t-mono text-[var(--color-muted)]">
                {d.edgeIntro(pct(forecast.probability, 1), pct(scenario.yesPrice))}{" "}
                {/* The edge is the number the whole system turns on, so it gets
                    the accent when it clears the floor and plain ink when it
                    does not. */}
                <span
                  className={
                    edge.edge >= MIN_EDGE ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]"
                  }
                >
                  {pct(edge.edge, 1)} {edge.side ? d.sideNote(edge.side) : ""}
                </span>
              </p>
              <p className="t-mono mt-1 text-[var(--color-muted)]">{d.minEdge(pct(MIN_EDGE))}</p>
            </Panel>
            <Panel>
              {edge.action.startsWith("BET") ? (
                <p className="t-mono text-[var(--color-muted)]">
                  {d.kellyPre(pct(edge.kellyFull * 0.25, 1), MAX_BET)}{" "}
                  <span className="text-[var(--color-ink)]">${edge.kellySize.toFixed(2)}</span>{" "}
                  {d.kellyPost(edge.side)}
                </p>
              ) : (
                <p className="t-mono text-[var(--color-muted)]">
                  {d.actionLabel} <span className="text-[var(--color-ink)]">SKIP</span> · {edge.reason}
                </p>
              )}
              <p className="t-mono mt-1 text-[var(--color-muted)]">{d.riskCaps}</p>
            </Panel>
          </div>
        </Stage>

        <Stage index={3} title={d.stages[3]} status={pipeline.stages[3]}>
          <TelegramBubble alert={alert} />
          <p className="t-secondary mt-2">{d.caption}</p>
        </Stage>
      </div>
    </DemoShell>
  );
}

// The alert body stays in English in both languages on purpose: this is a
// reproduction of what the real bot sends, and translating it would be a
// prettier lie.
function TelegramBubble({ alert }) {
  return (
    <div className="flex max-w-md items-start gap-2.5">
      <div className="t-mono flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-white">
        G
      </div>
      <div className="t-mono rounded-2xl rounded-tl-sm border border-[var(--color-line)]/70 bg-white/80 px-3.5 py-2.5 leading-relaxed">
        <p className="mb-1.5 text-[var(--color-muted)]">godolkin_signal_bot</p>
        <p className="font-semibold text-[var(--color-ink)]">
          {alert.emoji} {alert.title}
        </p>
        <div className="mt-2 space-y-0.5">
          {alert.rows.map(([label, value]) => (
            <p key={label} className="text-[var(--color-muted)]">
              <span className="text-[var(--color-ink)]">{label}:</span> {value}
            </p>
          ))}
        </div>
        <p className="mt-2 text-[var(--color-muted)] italic">{alert.footer}</p>
      </div>
    </div>
  );
}
