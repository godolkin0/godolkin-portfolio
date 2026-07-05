import { useMemo, useState } from "react";
import { buildReport, fmtPct, METRIC_LABELS, SAMPLE_WEEKS } from "../lib/report";
import { usePipeline } from "../lib/usePipeline";
import { useI18n } from "../i18n";
import { Badge, DemoShell, RunButton, Stage } from "./ui";

const COLUMN_KEYS = ["impressions", "clicks", "conversions", "spend"];

export default function ReportDemo() {
  const { lang, t } = useI18n();
  const d = t.demo3;
  const locale = lang === "it" ? "it-IT" : "en-US";
  const [weeks, setWeeks] = useState(SAMPLE_WEEKS);
  const [snapshot, setSnapshot] = useState(null);
  const pipeline = usePipeline(3, { gap: 400, spin: 600 });

  const report = useMemo(() => (snapshot ? buildReport(snapshot, lang) : null), [snapshot, lang]);

  const updateCell = (row, key, value) => {
    const parsed = Math.max(0, Number(value) || 0);
    setWeeks((prev) => prev.map((w, i) => (i === row ? { ...w, [key]: parsed } : w)));
    setSnapshot(null);
    pipeline.reset();
  };

  const generate = () => {
    setSnapshot(weeks);
    pipeline.run();
  };

  return (
    <DemoShell title={d.shellTitle} badge={<Badge tone="cyan">{d.badge}</Badge>}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-0 font-mono text-xs">
          <thead>
            <tr>
              <th className="rounded-tl-lg border border-line bg-panel-2 px-3 py-2 text-left font-medium text-dim">
                {d.week}
              </th>
              {COLUMN_KEYS.map((key, i) => (
                <th
                  key={key}
                  className={`border border-l-0 border-line bg-panel-2 px-3 py-2 text-right font-medium text-dim ${i === COLUMN_KEYS.length - 1 ? "rounded-tr-lg" : ""}`}
                >
                  {d.columns[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row}>
                <td className="border border-t-0 border-line px-3 py-1.5 text-dim">
                  {d.weekPrefix}
                  {row + 1}
                </td>
                {COLUMN_KEYS.map((key) => (
                  <td key={key} className="border border-l-0 border-t-0 border-line px-1 py-1">
                    <input
                      type="number"
                      min="0"
                      value={week[key]}
                      onChange={(e) => updateCell(row, key, e.target.value)}
                      className="w-full rounded bg-transparent px-2 py-0.5 text-right text-fg transition focus:bg-panel-2 focus:outline-none"
                      aria-label={`${d.week} ${row + 1} ${d.columns[key]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-5 mt-3">
        <RunButton onClick={generate} disabled={pipeline.running}>
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-4">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          {report && (
            <div className="flex flex-wrap gap-2 font-mono text-xs">
              {report.derived.map((w, i) => (
                <div key={i} className="rounded-lg border border-line bg-panel-2 px-3 py-2">
                  <p className="text-faint">
                    {d.weekPrefix}
                    {i + 1}
                  </p>
                  <p className="text-dim">
                    CTR <span className="text-fg">{w.ctr !== null ? fmtPct(w.ctr, 2) : "—"}</span>
                  </p>
                  <p className="text-dim">
                    CPA <span className="text-fg">{w.cpa !== null ? `$${w.cpa.toFixed(2)}` : "—"}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          {report && (
            <p className="font-mono text-xs text-dim">
              {d.bestWeek}{" "}
              <span className="text-accent">
                {d.weekPrefix}
                {report.bestWeek + 1}
              </span>
              {report.biggestMover && (
                <>
                  {" "}· {d.biggestMover}{" "}
                  <span className="text-accent-2">{METRIC_LABELS[lang][report.biggestMover.key]}</span> (
                  {report.biggestMover.change >= 0 ? "+" : "−"}
                  {fmtPct(Math.abs(report.biggestMover.change))} WoW)
                </>
              )}
            </p>
          )}
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          {report && <ReportCard report={report} kicker={d.reportKicker} chartTitle={d.chartTitle} weekPrefix={d.weekPrefix} locale={locale} />}
        </Stage>
      </div>
    </DemoShell>
  );
}

function ReportCard({ report, kicker, chartTitle, weekPrefix, locale }) {
  const maxConv = Math.max(1, ...report.derived.map((w) => w.conversions));
  return (
    <div className="rounded-xl border border-line bg-gradient-to-b from-panel-2 to-panel p-5">
      <p className="font-mono text-[11px] uppercase tracking-widest text-faint">{kicker}</p>
      <h4 className="mt-1.5 text-lg font-bold text-fg sm:text-xl">{report.headline}</h4>

      <ul className="mt-4 space-y-2 text-sm text-fg/85">
        {report.bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent">▸</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <p className="mb-2 font-mono text-[11px] text-faint">{chartTitle}</p>
        <div className="flex h-28 items-end gap-3">
          {report.derived.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[11px] text-dim">{w.conversions.toLocaleString(locale)}</span>
              <div
                className={`w-full rounded-t transition-all duration-500 ${i === report.bestWeek ? "bg-accent" : "bg-accent/35"}`}
                style={{ height: `${Math.max(6, (w.conversions / maxConv) * 80)}px` }}
              />
              <span className="font-mono text-[11px] text-faint">
                {weekPrefix}
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
