import { useEffect, useMemo, useState } from "react";
import {
  BUDGET_LABELS,
  CATEGORY_LABELS,
  EXAMPLE_LEADS,
  PRIORITY_LABELS,
  URGENCY_LABELS,
  classifyLead,
  draftFollowUp,
} from "../lib/triage.js";
import { usePipeline } from "../lib/usePipeline.js";
import { useI18n } from "../i18n.jsx";
import { Badge, ChipButton, DemoShell, Panel, RunButton, Stage } from "./demo-ui.jsx";

// Logic ported unchanged from src/lib/triage.js. This component only decides
// when each stage of the result becomes visible.
export function TriageDemo({ badge }) {
  const { lang, t } = useI18n();
  const d = t.demoTriage;
  const examples = EXAMPLE_LEADS[lang];
  const [message, setMessage] = useState(EXAMPLE_LEADS.en[0].text);
  const [submitted, setSubmitted] = useState(null);
  const pipeline = usePipeline(3, { gap: 400, spin: 600 });

  // If the box still holds an untouched example, swap it to the new language.
  useEffect(() => {
    for (const l of Object.keys(EXAMPLE_LEADS)) {
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

  const loadExample = (text) => {
    setMessage(text);
    setSubmitted(null);
    pipeline.reset();
  };

  return (
    <DemoShell title={d.shellTitle} badge={badge}>
      <div className="mb-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <ChipButton key={ex.label} onClick={() => loadExample(ex.text)} active={message === ex.text}>
            {ex.label}
          </ChipButton>
        ))}
      </div>

      <label className="sr-only" htmlFor="triage-input">
        {d.placeholder}
      </label>
      <textarea
        id="triage-input"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={d.placeholder}
        className="t-body w-full resize-none rounded-xl border border-[var(--color-line)] bg-white/70 p-3 text-[15px] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-ink)]/40 focus:outline-none"
      />

      <div className="mt-3 mb-6">
        <RunButton
          onClick={() => {
            if (!message.trim()) return;
            setSubmitted(message);
            pipeline.run();
          }}
          disabled={pipeline.running || !message.trim()}
        >
          {pipeline.running ? d.running : d.run}
        </RunButton>
      </div>

      <div className="space-y-5">
        <Stage index={0} title={d.stages[0]} status={pipeline.stages[0]}>
          {result && (
            <div className="flex flex-wrap gap-2">
              <Badge tone={result.urgency === "High" ? "accent" : "dim"}>
                {d.urgency}: {URGENCY_LABELS[lang][result.urgency]}
              </Badge>
              <Badge tone="ink">
                {d.budget}: {BUDGET_LABELS[lang][result.budget]}
                {result.budgetAmount !== null && ` ($${result.budgetAmount.toLocaleString("en-US")})`}
              </Badge>
              <Badge tone="ink">
                {d.category}: {CATEGORY_LABELS[lang][result.category]}
              </Badge>
            </div>
          )}
        </Stage>

        <Stage index={1} title={d.stages[1]} status={pipeline.stages[1]}>
          {result && (
            <Panel>
              <p className="t-mono text-[var(--color-ink)]">{PRIORITY_LABELS[lang][result.priority]}</p>
              <p className="t-secondary mt-1">
                {d.priorityLine(
                  URGENCY_LABELS[lang][result.urgency],
                  BUDGET_LABELS[lang][result.budget],
                  result.urgency === "High"
                )}
                {result.categoryPhrase && (
                  <>
                    {" · "}
                    {d.matchedOn}{" "}
                    <span className="t-mono text-[var(--color-ink)]">"{result.categoryPhrase}"</span>
                  </>
                )}
              </p>
            </Panel>
          )}
        </Stage>

        <Stage index={2} title={d.stages[2]} status={pipeline.stages[2]}>
          {draft && (
            <Panel className="p-4">
              <p className="t-mono mb-2 text-[var(--color-muted)]">{d.draftHeader}</p>
              <p className="t-body whitespace-pre-line text-[15px]">{draft}</p>
            </Panel>
          )}
          <p className="t-secondary mt-2">{d.caption}</p>
        </Stage>
      </div>
    </DemoShell>
  );
}
