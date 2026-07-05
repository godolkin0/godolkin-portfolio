import { useMemo, useState } from "react";
import { SCENARIOS } from "../data/scenarios";
import { analyzeScenario, formatAlertLines, pct, MIN_EDGE, MAX_BET } from "../lib/polymarket";
import { usePipeline } from "../lib/usePipeline";
import { useI18n } from "../i18n";
import { Badge, DemoShell, RunButton, Stage } from "./ui";

export default function PolymarketDemo() {
  const { lang, t } = useI18n();
  const d = t.demo1;
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const pipeline = usePipeline(4, { gap: 450, spin: 650 });

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  const result = useMemo(() => analyzeScenario(scenario), [scenario]);
  const alert = useMemo(() => formatAlertLines(result), [result]);
  const { forecast, edge } = result;

  const selectScenario = (id) => {
    setScenarioId(id);
    pipeline.reset();
  };

  return (
    <DemoShell title={d.shellTitle} badge={<Badge tone="warn">{d.badge}</Badge>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => selectScenario(s.id)}
            className={`rounded-lg border px-3 py-1.5 text-left font-mono text-xs transition duration-200 ${
              s.id === scenarioId
                ? "border-accent/60 bg-accent/10 text-fg"
                : "border-line bg-panel-2 text-dim hover:-translate-y-0.5 hover:border-faint hover:text-fg"
            }`}
          >
            <span className="block font-semibold">{s.label[lang]}</span>
            <span className="block text-[10px] text-faint">{s.chip[lang]}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 max-w-2xl text-xs leading-relaxed text-faint">{scenario.note[lang]}</p>

      <div className="mb-5">
        <RunButton onClick={pipeline.run} disabled={pipeline.running}>
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-4">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          <div className="rounded-lg border border-line bg-panel-2 p-3">
            <p className="text-sm font-medium text-fg">“{scenario.question}”</p>
            <p className="mt-1.5 font-mono text-xs text-dim">
              {d.marketPrice} <span className="text-accent-2">{scenario.yesPrice.toFixed(2)}</span>{" "}
              <span className="text-faint">({pct(scenario.yesPrice)})</span> · {d.category}
            </p>
          </div>
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-xs text-dim">
              {d.parsedFrom} {d.city} <span className="text-fg">{scenario.parsed.city}</span> · {d.threshold}{" "}
              <span className="text-fg">{scenario.parsed.threshold}</span>
            </p>
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {scenario.forecast.map((v, i) => {
                const hit =
                  scenario.threshold.direction === "above" ? v >= scenario.threshold.value : v <= scenario.threshold.value;
                return (
                  <span
                    key={i}
                    className={`rounded border px-1.5 py-0.5 ${hit ? "border-accent/50 bg-accent/10 text-accent" : "border-line text-faint"}`}
                  >
                    {v}
                  </span>
                );
              })}
            </div>
            <p className="font-mono text-xs text-dim">
              {d.pointsLine(forecast.matching, forecast.total, scenario.threshold.direction)} → {d.probability}{" "}
              <span className="text-accent">{pct(forecast.probability, 1)}</span> · {d.horizon} {forecast.hoursOut}h →{" "}
              {d.confidence}{" "}
              <span className={forecast.confidence >= 0.8 ? "text-accent" : "text-warn"}>{pct(forecast.confidence)}</span>
            </p>
          </div>
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          <div className="grid gap-2 font-mono text-xs sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-panel-2 p-3">
              <p className="text-dim">
                {d.edgeIntro(pct(forecast.probability, 1), pct(scenario.yesPrice))}{" "}
                <span className={edge.edge >= MIN_EDGE ? "text-accent" : "text-warn"}>
                  {pct(edge.edge, 1)} {edge.side ? d.sideNote(edge.side) : ""}
                </span>
              </p>
              <p className="mt-1 text-faint">{d.minEdge(pct(MIN_EDGE))}</p>
            </div>
            <div className="rounded-lg border border-line bg-panel-2 p-3">
              {edge.action.startsWith("BET") ? (
                <p className="text-dim">
                  {d.kellyPre(pct(edge.kellyFull * 0.25, 1), MAX_BET)}{" "}
                  <span className="text-accent">${edge.kellySize.toFixed(2)}</span> {d.kellyPost(edge.side)}
                </p>
              ) : (
                <p className="text-dim">
                  {d.actionLabel} <span className="text-warn">SKIP</span> · {edge.reason}
                </p>
              )}
              <p className="mt-1 text-faint">{d.riskCaps}</p>
            </div>
          </div>
        </Stage>

        <Stage index={3} title={d.stages[3]} status={pipeline.stages[3]}>
          <TelegramBubble alert={alert} />
          <p className="mt-2 text-xs text-faint">{d.caption}</p>
        </Stage>
      </div>
    </DemoShell>
  );
}

function TelegramBubble({ alert }) {
  return (
    <div className="flex max-w-md items-start gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-2/20 font-mono text-xs font-bold text-accent-2">
        G
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-line bg-[#182533] px-3.5 py-2.5 font-mono text-xs leading-relaxed">
        <p className="mb-1.5 text-[11px] font-semibold text-accent-2">godolkin_signal_bot</p>
        <p className="font-bold text-fg">
          {alert.emoji} SIGNAL: {alert.title.replace("SIGNAL: ", "")}
        </p>
        <div className="mt-2 space-y-0.5">
          {alert.rows.map(([label, value]) => (
            <p key={label} className="text-dim">
              <span className="font-semibold text-fg">{label}:</span> {value}
            </p>
          ))}
        </div>
        <p className="mt-2 italic text-faint">{alert.footer}</p>
        <p className="mt-1.5 text-right text-[10px] text-faint">now ✓✓</p>
      </div>
    </div>
  );
}
