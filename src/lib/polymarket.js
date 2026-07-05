// Faithful JS reimplementation of the real bot's logic (weather.py + edge.py).
// Every displayed number is computed here from the scenario inputs — nothing is hardcoded.

export const MAX_BET = 25; // $ cap per signal ($100 bankroll unit)
export const MIN_EDGE = 0.15; // 15% minimum edge required to act
export const KELLY_FRACTION = 0.25; // quarter-Kelly — conservative

// weather.py: forecast_to_probability
export function forecastToProbability(forecast, threshold, unit) {
  let matching = 0;
  const total = forecast.length;
  const min = Math.min(...forecast);
  const max = Math.max(...forecast);

  for (const value of forecast) {
    if (threshold.direction === "above" && value >= threshold.value) matching += 1;
    else if (threshold.direction === "below" && value <= threshold.value) matching += 1;
  }

  const probability = total > 0 ? matching / total : 0.5;

  // Confidence degrades with time — forecasts beyond 3 days are less reliable.
  // Forecast points are 3h apart, so horizon = points * 3 hours.
  const hoursOut = total * 3;
  let confidence;
  if (hoursOut <= 24) confidence = 0.9;
  else if (hoursOut <= 72) confidence = 0.8;
  else if (hoursOut <= 120) confidence = 0.65;
  else confidence = 0.5;

  return {
    probability: Math.round(probability * 1000) / 1000,
    matching,
    total,
    hoursOut,
    confidence,
    forecastValue: `Range: ${fmtVal(min, unit)} - ${fmtVal(max, unit)} | Threshold: ${threshold.direction} ${fmtVal(threshold.value, unit)}`,
  };
}

// edge.py: calculate_edge
export function calculateEdge(forecastProb, marketPrice) {
  const yesEdge = forecastProb - marketPrice;
  const noEdge = 1 - forecastProb - (1 - marketPrice);

  let side, edge, odds;
  if (yesEdge > noEdge && yesEdge > 0) {
    side = "YES";
    edge = yesEdge;
    odds = marketPrice;
  } else if (noEdge > 0) {
    side = "NO";
    edge = noEdge;
    odds = 1 - marketPrice;
  } else {
    return { side: null, edge: 0, kellyFull: 0, kellySize: 0, action: "SKIP", reason: "No edge" };
  }

  if (odds <= 0 || odds >= 1) {
    return { side, edge, kellyFull: 0, kellySize: 0, action: "SKIP", reason: "Invalid odds" };
  }

  // Kelly criterion: f = (bp - q) / b
  const b = (1 - odds) / odds; // payout ratio
  const p = side === "YES" ? forecastProb : 1 - forecastProb;
  const q = 1 - p;

  const kellyFull = (b * p - q) / b;
  const kellyQuarter = Math.max(0, kellyFull * KELLY_FRACTION);
  const betAmount = Math.round(Math.min(kellyQuarter * 100, MAX_BET) * 100) / 100;

  if (edge < MIN_EDGE) {
    return {
      side,
      edge: round4(edge),
      kellyFull,
      kellySize: betAmount,
      action: "SKIP",
      reason: `Edge ${pct(edge, 1)} below threshold ${pct(MIN_EDGE, 1)}`,
    };
  }

  return {
    side,
    edge: round4(edge),
    kellyFull,
    kellySize: betAmount,
    action: `BET_${side}`,
    reason: `Edge: ${pct(edge, 1)} | Kelly: $${betAmount.toFixed(2)}`,
  };
}

// Runs the whole pipeline for one scenario. Results are computed once,
// up front — the UI only controls when each stage is revealed.
export function analyzeScenario(scenario) {
  const forecast = forecastToProbability(scenario.forecast, scenario.threshold, scenario.unit);
  const edge = calculateEdge(forecast.probability, scenario.yesPrice);
  return { scenario, forecast, edge };
}

// executor.py: format_signal_alert — same field order and wording as the real Telegram alert.
export function formatAlertLines({ scenario, forecast, edge }) {
  const emoji = edge.action.includes("BET") ? "\u{1F7E2}" : "⚪";
  return {
    emoji,
    title: `SIGNAL: ${edge.action}`,
    rows: [
      ["Market", scenario.question],
      ["Category", "WEATHER"],
      ["Market Price (YES)", pct(scenario.yesPrice, 0)],
      ["Forecast Prob", pct(forecast.probability, 0)],
      ["Confidence", pct(forecast.confidence, 0)],
      ["Edge", pct(edge.edge, 1)],
      ["Suggested", edge.side ? `${edge.side} @ $${edge.kellySize.toFixed(2)}` : "—"],
      ["Reason", edge.reason],
    ],
    footer: `Forecast: ${forecast.forecastValue}`,
  };
}

export function pct(x, digits = 0) {
  return `${(x * 100).toFixed(digits)}%`;
}

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function fmtVal(v, unit) {
  return unit === "in" ? `${v}in` : `${v}${unit}`;
}
