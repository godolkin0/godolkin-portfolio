// Client-report math. All formulas run on whatever is in the editable table,
// with divide-by-zero guarded everywhere so free editing can't crash the demo.
// Report sentences are generated in the active language.

export const SAMPLE_WEEKS = [
  { impressions: 42000, clicks: 1180, conversions: 38, spend: 1450 },
  { impressions: 45500, clicks: 1390, conversions: 47, spend: 1500 },
  { impressions: 44200, clicks: 1510, conversions: 61, spend: 1520 },
  { impressions: 47800, clicks: 1720, conversions: 82, spend: 1540 },
];

export const METRIC_KEYS = ["impressions", "clicks", "conversions", "spend"];

export const METRIC_LABELS = {
  en: {
    impressions: "Impressions",
    clicks: "Clicks",
    conversions: "Conversions",
    spend: "Spend",
    ctr: "CTR",
    convRate: "Conversion rate",
    cpa: "CPA",
  },
  it: {
    impressions: "Impression",
    clicks: "Click",
    conversions: "Conversioni",
    spend: "Spesa",
    ctr: "CTR",
    convRate: "Tasso di conversione",
    cpa: "CPA",
  },
};

const SENTENCES = {
  en: {
    locale: "en-US",
    headline: (change) => `Conversions ${change >= 0 ? "up" : "down"} ${fmtPct(Math.abs(change))} week-over-week`,
    headlineFallback: "Campaign report generated",
    ctr: (a, b, n, up) => `CTR ${up ? "climbed" : "slipped"} from ${a} in week 1 to ${b} in week ${n}.`,
    cpa: (a, b, improved) => `Cost per acquisition ${improved ? "improved" : "rose"} from ${a} to ${b} over the period.`,
    best: (n, conv, clicks) => `Week ${n} was the strongest week: ${conv} conversions from ${clicks} clicks.`,
    mover: (label, sign, pct) => `Biggest mover this week: ${label}, ${sign}${pct} week-over-week.`,
  },
  it: {
    locale: "it-IT",
    headline: (change) =>
      `Conversioni ${change >= 0 ? "in crescita" : "in calo"} del ${fmtPct(Math.abs(change))} settimana su settimana`,
    headlineFallback: "Report della campagna generato",
    ctr: (a, b, n, up) => `Il CTR è ${up ? "salito" : "sceso"} dal ${a} della settimana 1 al ${b} della settimana ${n}.`,
    cpa: (a, b, improved) => `Il costo per acquisizione è ${improved ? "migliorato" : "salito"} da ${a} a ${b} nel periodo.`,
    best: (n, conv, clicks) => `La settimana ${n} è stata la più forte: ${conv} conversioni da ${clicks} click.`,
    mover: (label, sign, pct) => `Variazione maggiore questa settimana: ${label}, ${sign}${pct} settimana su settimana.`,
  },
};

function safeDiv(a, b) {
  return b > 0 ? a / b : null;
}

function pctChange(prev, curr) {
  if (prev === null || curr === null || prev === 0) return null;
  return (curr - prev) / prev;
}

export function buildReport(weeks, lang = "en") {
  const S = SENTENCES[lang] ?? SENTENCES.en;

  const derived = weeks.map((w) => ({
    ...w,
    ctr: safeDiv(w.clicks, w.impressions),
    convRate: safeDiv(w.conversions, w.clicks),
    cpa: safeDiv(w.spend, w.conversions),
  }));

  // Week-over-week % change for every metric, per transition.
  const tracked = [...METRIC_KEYS, "ctr", "convRate", "cpa"];
  const wow = derived.slice(1).map((week, i) => {
    const prev = derived[i];
    const changes = {};
    for (const key of tracked) changes[key] = pctChange(prev[key], week[key]);
    return changes;
  });

  // Best week = most conversions (latest wins ties).
  let bestWeek = 0;
  derived.forEach((w, i) => {
    if (w.conversions >= derived[bestWeek].conversions) bestWeek = i;
  });

  // Biggest mover = largest absolute % swing in the final week.
  const lastWow = wow[wow.length - 1] ?? {};
  let biggestMover = null;
  for (const key of tracked) {
    const change = lastWow[key];
    if (change === null || change === undefined) continue;
    if (!biggestMover || Math.abs(change) > Math.abs(biggestMover.change)) {
      biggestMover = { key, change };
    }
  }

  const lastConvChange = lastWow.conversions ?? null;
  const headline = lastConvChange !== null ? S.headline(lastConvChange) : S.headlineFallback;

  return {
    derived,
    wow,
    bestWeek,
    biggestMover,
    headline,
    bullets: buildBullets(derived, bestWeek, biggestMover, lang),
  };
}

function buildBullets(derived, bestWeek, biggestMover, lang) {
  const S = SENTENCES[lang] ?? SENTENCES.en;
  const labels = METRIC_LABELS[lang] ?? METRIC_LABELS.en;
  const bullets = [];
  const first = derived[0];
  const last = derived[derived.length - 1];

  if (first.ctr !== null && last.ctr !== null) {
    bullets.push(S.ctr(fmtPct(first.ctr, 2), fmtPct(last.ctr, 2), derived.length, last.ctr >= first.ctr));
  }
  if (first.cpa !== null && last.cpa !== null) {
    bullets.push(S.cpa(`$${first.cpa.toFixed(2)}`, `$${last.cpa.toFixed(2)}`, last.cpa <= first.cpa));
  }
  bullets.push(
    S.best(
      bestWeek + 1,
      derived[bestWeek].conversions.toLocaleString(S.locale),
      derived[bestWeek].clicks.toLocaleString(S.locale)
    )
  );
  if (biggestMover) {
    bullets.push(
      S.mover(labels[biggestMover.key], biggestMover.change >= 0 ? "+" : "−", fmtPct(Math.abs(biggestMover.change)))
    );
  }
  return bullets;
}

export function fmtPct(x, digits = 0) {
  return `${(x * 100).toFixed(digits)}%`;
}
