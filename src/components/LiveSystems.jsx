import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";
import { SYSTEMS } from "../data/graph.js";
import { ArrowMark } from "./ui.jsx";
import { TriageDemo } from "./TriageDemo.jsx";
import { ReportDemo } from "./ReportDemo.jsx";
import { SignalBotDemo } from "./SignalBotDemo.jsx";

const VALORA_URL = "https://valora-landing-10417c.netlify.app/";

// The demo that belongs inside each card, if any. The two private builds map to
// nothing on purpose: a PRIVATE BUILD card must never imply something to press.
const DEMOS = {
  "lead-triage": TriageDemo,
  "report-gen": ReportDemo,
  "signal-bot": SignalBotDemo,
};

// Architecture, drawn only from what has actually been specified for these two
// systems. No step here is invented to make the diagram look fuller.
const FLOWS = {
  "buyer-match": [
    { en: "Tally form", it: "Form Tally" },
    { en: "search property database", it: "cerca nel database immobili" },
    { en: "email the matches back", it: "rimanda i match via email" },
  ],
  "deadline-tracker": [
    { en: "Tally form", it: "Form Tally" },
    { en: "Supabase", it: "Supabase" },
    { en: "daily scheduled check", it: "controllo giornaliero" },
    { en: "email or Telegram alert", it: "avviso email o Telegram" },
  ],
};

export function LiveSystems() {
  const { t } = useI18n();
  const s = t.systems;
  const groupA = SYSTEMS.filter((x) => x.group === "A");
  const groupB = SYSTEMS.filter((x) => x.group === "B");

  return (
    <section id="live-systems" className="wash grain relative">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <p className="t-label text-[var(--color-muted)]">{s.kicker}</p>
          <h2 className="t-display mt-5 max-w-3xl">
            {s.titleA}
            <br />
            <span className="t-display-soft">{s.titleB}</span>
          </h2>
        </Reveal>

        {/* The split is the pitch: it makes range a visible fact rather than a
            claim in the hero copy, so the two groups are labelled and separated
            instead of merged into one grid. */}
        <GroupHeading label={s.groupA.label} lede={s.groupA.lede} />
        <div className="space-y-20">
          {groupA.map((system) => (
            <SystemCard key={system.id} system={system} />
          ))}
        </div>

        <GroupHeading label={s.groupB.label} lede={s.groupB.lede} />
        <div className="space-y-20">
          {groupB.map((system) => (
            <SystemCard key={system.id} system={system} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GroupHeading({ label, lede }) {
  return (
    <Reveal>
      <div className="mt-24 mb-14 border-t border-[var(--color-ink)]/15 pt-8 sm:mt-32">
        <h3 className="t-display-sm">{label}</h3>
        <p className="t-body mt-3 max-w-2xl text-[var(--color-muted)]">{lede}</p>
      </div>
    </Reveal>
  );
}

function SystemCard({ system }) {
  const { t, lang } = useI18n();
  const s = t.systems;
  const card = s.cards[system.id];
  const Demo = DEMOS[system.id];

  return (
    <Reveal>
      {/* The anchor the hero graph dives to. */}
      <article id={system.id} className="scroll-mt-24">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="t-label text-[var(--color-muted)]">{card.sector}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h4 className="t-display-sm">{card.name}</h4>
            <BadgeTag badge={system.badge} />
          </div>
          <p className="t-body mt-5 text-[var(--color-ink)]">{card.body}</p>
          <p className="t-body mt-4 text-[var(--color-muted)]">{card.note}</p>
        </header>

        {system.id === "valora" && <ValoraPanel card={card} />}

        {FLOWS[system.id] && <FlowDiagram steps={FLOWS[system.id]} lang={lang} label={s.architecture} />}

        {Demo && (
          <div className="mt-8">
            <Demo badge={<BadgeTag badge={system.badge} />} />
          </div>
        )}

        {/* Engineer-grade detail sits BELOW the interactive element: it means
            nothing to a buyer deciding whether to book a call, and putting it in
            the lead paragraph buys nothing but a bounce. */}
        {card.detail && <p className="t-secondary mt-4 max-w-2xl">{card.detail}</p>}
      </article>
    </Reveal>
  );
}

function BadgeTag({ badge }) {
  const { t } = useI18n();
  const label = t.systems.badges[badge];
  const meaning = t.systems.badgeMeaning[badge];
  // LIVE is the only badge that earns the accent. REPLAY and PRIVATE BUILD are
  // honest labels, not achievements, and colouring them would blur the one
  // distinction the vocabulary exists to make.
  //
  // The accent is carried by a dot, not by the letters: #FF6A1F on white is
  // 2.51:1, so orange text this small is unreadable for anyone who needs
  // contrast. As a mark beside ink-coloured type it reads exactly as intended,
  // which is also what the reference does with orange everywhere else.
  const isLive = badge === "LIVE";
  return (
    <span
      title={meaning}
      className={`t-label inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${
        isLive ? "border-[var(--color-accent)]/50 text-[var(--color-ink)]" : "border-[var(--color-line)] text-[var(--color-muted)]"
      }`}
    >
      {isLive && (
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--color-accent)]" />
      )}
      {label}
    </span>
  );
}

function ValoraPanel({ card }) {
  const { t } = useI18n();
  return (
    <div className="mt-8 rounded-2xl border border-[var(--color-line)]/70 bg-white/60 p-5 sm:p-6">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="t-label text-[var(--color-muted)]">{card.dataset}</p>
          <ul className="t-mono mt-3 space-y-1">
            {card.datasetRows.map((row) => (
              <li key={row}>{row}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="t-label text-[var(--color-muted)]">{card.stack}</p>
          <p className="t-mono mt-3 leading-relaxed">
            Supabase · PostGIS · n8n
            <br />
            Telegram · Google Sheets
          </p>
        </div>
        <div>
          <p className="t-label text-[var(--color-muted)]">{card.pipeline}</p>
          <p className="t-mono mt-3 leading-relaxed">
            01 form → 02 zone match
            <br />
            03 estimate → 04 score
            <br />
            05 push → 06 log
          </p>
        </div>
      </div>
      <a
        href={VALORA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="t-label mt-6 inline-flex items-center gap-2 text-[var(--color-ink)] underline decoration-[var(--color-line)] underline-offset-8 transition-colors hover:decoration-[var(--color-ink)]"
      >
        {t.systems.openProduct}
        <ArrowMark />
      </a>
    </div>
  );
}

// Static, and deliberately so: this is a description of a system that is not on
// this page, so nothing here may look pressable.
function FlowDiagram({ steps, lang, label }) {
  return (
    <div className="mt-8">
      <p className="t-label text-[var(--color-muted)]">{label}</p>
      <ol className="mt-4 flex flex-wrap items-stretch gap-x-3 gap-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="t-mono rounded-xl border border-[var(--color-line)] px-4 py-3 text-[var(--color-ink)]">
              {step[lang]}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="t-mono text-[var(--color-line)]">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
