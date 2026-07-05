import { useEffect, useMemo, useState } from "react";
import {
  classifyLead,
  draftFollowUp,
  EXAMPLE_LEADS,
  PRIORITY_LABELS,
  URGENCY_LABELS,
  BUDGET_LABELS,
  CATEGORY_LABELS,
} from "../lib/triage";
import { usePipeline } from "../lib/usePipeline";
import { useI18n } from "../i18n";
import { Badge, DemoShell, RunButton, Stage } from "./ui";

const URGENCY_TONE = { High: "danger", Medium: "warn", Low: "dim" };
const BUDGET_TONE = { Large: "accent", Mid: "accent", Small: "cyan", Unspecified: "dim" };

export default function TriageDemo() {
  const { lang, t } = useI18n();
  const d = t.demo2;
  const examples = EXAMPLE_LEADS[lang];
  const [message, setMessage] = useState(EXAMPLE_LEADS.en[0].text);
  const [submitted, setSubmitted] = useState(null);
  const pipeline = usePipeline(3, { gap: 400, spin: 600 });

  // If the box still holds an untouched example, swap it to the new language.
  useEffect(() => {
    const langs = Object.keys(EXAMPLE_LEADS);
    for (const l of langs) {
      const idx = EXAMPLE_LEADS[l].findIndex((ex) => ex.text === message);
      if (idx !== -1 && l !== lang) {
        setMessage(EXAMPLE_LEADS[lang][idx].text);
        setSubmitted(null);
        pipeline.reset();
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const result = useMemo(() => (submitted ? classifyLead(submitted) : null), [submitted]);
  const draft = useMemo(
    () => (result ? draftFollowUp(submitted, result, lang) : null),
    [submitted, result, lang]
  );

  const runTriage = () => {
    if (!message.trim()) return;
    setSubmitted(message);
    pipeline.run();
  };

  const loadExample = (text) => {
    setMessage(text);
    setSubmitted(null);
    pipeline.reset();
  };

  return (
    <DemoShell title={d.shellTitle} badge={<Badge tone="cyan">{d.badge}</Badge>}>
      <div className="mb-2 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => loadExample(ex.text)}
            className="rounded-full border border-line bg-panel-2 px-3 py-1 font-mono text-[11px] text-dim transition duration-200 hover:-translate-y-0.5 hover:border-faint hover:text-fg"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={d.placeholder}
        className="w-full resize-none rounded-lg border border-line bg-panel-2 p-3 text-sm text-fg transition placeholder:text-faint focus:border-accent/60 focus:outline-none"
      />

      <div className="mb-5 mt-3">
        <RunButton onClick={runTriage} disabled={pipeline.running || !message.trim()}>
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-4">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          {result && (
            <div className="flex flex-wrap gap-2">
              <Badge tone={URGENCY_TONE[result.urgency]}>
                {d.urgency}: {URGENCY_LABELS[lang][result.urgency]}
              </Badge>
              <Badge tone={BUDGET_TONE[result.budget]}>
                {d.budget}: {BUDGET_LABELS[lang][result.budget]}
                {result.budgetAmount !== null && ` ($${result.budgetAmount.toLocaleString("en-US")})`}
              </Badge>
              <Badge tone="cyan">
                {d.category}: {CATEGORY_LABELS[lang][result.category]}
              </Badge>
            </div>
          )}
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          {result && (
            <div className="rounded-lg border border-line bg-panel-2 p-3">
              <p className="font-mono text-sm font-semibold text-fg">{PRIORITY_LABELS[lang][result.priority]}</p>
              <p className="mt-1 text-xs text-dim">
                {d.priorityLine(
                  URGENCY_LABELS[lang][result.urgency],
                  BUDGET_LABELS[lang][result.budget],
                  result.urgency === "High"
                )}
                {result.categoryPhrase && (
                  <>
                    {" "}· {d.matchedOn} <span className="font-mono text-accent-2">"{result.categoryPhrase}"</span>
                  </>
                )}
              </p>
            </div>
          )}
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          {draft && (
            <div className="rounded-lg border border-line bg-panel-2 p-4">
              <p className="mb-2 font-mono text-[11px] text-faint">{d.draftHeader}</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-fg/90">{draft}</p>
            </div>
          )}
          <p className="mt-2 text-xs text-faint">{d.caption}</p>
        </Stage>
      </div>
    </DemoShell>
  );
}
