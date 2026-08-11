import { useMemo, useState } from "react";
import { METRIC_LABELS, SAMPLE_WEEKS, buildReport, fmtPct } from "../lib/report.js";
import { usePipeline } from "../lib/usePipeline.js";
import { useI18n } from "../i18n.jsx";
import { ChipButton, DemoShell, Panel, RunButton, Stage } from "./demo-ui.jsx";

const COLUMN_KEYS = ["impressions", "clicks", "conversions", "spend"];

// Every figure is computed from whatever is currently in the table, with
// divide-by-zero guarded in src/lib/report.js so free editing cannot crash it.
export function ReportDemo({ badge }) {
  const { lang, t } = useI18n();
  const d = t.demoReport;
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

  return (
    <DemoShell title={d.shellTitle} badge={badge}>
      <div className="overflow-x-auto">
        <table className="t-mono w-full min-w-[420px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="t-label rounded-tl-lg border border-[var(--color-line)] px-3 py-2 text-left text-[var(--color-muted)]">
                {d.week}
              </th>
              {COLUMN_KEYS.map((key, i) => (
                <th
                  key={key}
                  className={`t-label border border-l-0 border-[var(--color-line)] px-3 py-2 text-right text-[var(--color-muted)] ${
                    i === COLUMN_KEYS.length - 1 ? "rounded-tr-lg" : ""
                  }`}
                >
                  {d.columns[key]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, row) => (
              <tr key={row}>
                <td className="border border-t-0 border-[var(--color-line)] px-3 py-1.5 text-[var(--color-muted)]">
                  {d.weekPrefix}
                  {row + 1}
                </td>
                {COLUMN_KEYS.map((key) => (
                  <td key={key} className="border border-t-0 border-l-0 border-[var(--color-line)] px-1 py-1">
                    <input
                      type="number"
                      min="0"
                      value={week[key]}
                      onChange={(e) => updateCell(row, key, e.target.value)}
                      className="w-full rounded bg-transparent px-2 py-1 text-right text-[var(--color-ink)] focus:bg-[var(--color-wash)] focus:outline-none"
                      aria-label={`${d.week} ${row + 1} ${d.columns[key]}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 mb-6">
        <RunButton
          onClick={() => {
            setSnapshot(weeks);
            pipeline.run();
          }}
          disabled={pipeline.running}
        >
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-5">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          {report && (
            <div className="t-mono flex flex-wrap gap-2">
              {report.derived.map((w, i) => (
                <Panel key={i} className="px-3 py-2">
                  <p className="text-[var(--color-muted)]">
                    {d.weekPrefix}
                    {i + 1}
                  </p>
                  <p className="text-[var(--color-muted)]">
                    CTR <span className="text-[var(--color-ink)]">{w.ctr !== null ? fmtPct(w.ctr, 2) : d.noValue}</span>
                  </p>
                  <p className="text-[var(--color-muted)]">
                    CPA{" "}
                    <span className="text-[var(--color-ink)]">
                      {w.cpa !== null ? `$${w.cpa.toFixed(2)}` : d.noValue}
                    </span>
                  </p>
                </Panel>
              ))}
            </div>
          )}
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          {report && (
            <p className="t-mono text-[var(--color-muted)]">
              {d.bestWeek}{" "}
              <span className="text-[var(--color-ink)]">
                {d.weekPrefix}
                {report.bestWeek + 1}
              </span>
              {report.biggestMover && (
                <>
                  {" · "}
                  {d.biggestMover}{" "}
                  <span className="text-[var(--color-ink)]">{METRIC_LABELS[lang][report.biggestMover.key]}</span> (
                  {report.biggestMover.change >= 0 ? "+" : "-"}
                  {fmtPct(Math.abs(report.biggestMover.change))} WoW)
                </>
              )}
            </p>
          )}
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          {report && <ReportCard report={report} d={d} locale={locale} />}
          <p className="t-secondary mt-2">{d.caption}</p>
        </Stage>
      </div>
    </DemoShell>
  );
}

function ReportCard({ report, d, locale }) {
  const maxConv = Math.max(1, ...report.derived.map((w) => w.conversions));
  return (
    <div className="rounded-2xl border border-[var(--color-line)]/70 bg-white/80 p-5">
      <p className="t-label text-[var(--color-muted)]">{d.reportKicker}</p>
      <h4 className="t-display-sm mt-2">{report.headline}</h4>

      <ul className="mt-4 space-y-2">
        {report.bullets.map((b, i) => (
          <li key={i} className="t-body flex gap-2.5 text-[15px]">
            <span aria-hidden="true" className="text-[var(--color-line)]">
              /
            </span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <p className="t-label mb-3 text-[var(--color-muted)]">{d.chartTitle}</p>
        <div className="flex h-28 items-end gap-3">
          {report.derived.map((w, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="t-mono text-[var(--color-muted)]">{w.conversions.toLocaleString(locale)}</span>
              <div
                // The best week is the one figure the reader should land on, so
                // it is the single orange mark in this panel.
                className={`w-full rounded-t ${
                  i === report.bestWeek ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink)]/15"
                }`}
                style={{ height: `${Math.max(6, (w.conversions / maxConv) * 80)}px` }}
              />
              <span className="t-mono text-[var(--color-muted)]">
                {d.weekPrefix}
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
