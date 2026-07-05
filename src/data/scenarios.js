// Historical scenarios bundled with the site. The inputs (market price, forecast
// points, threshold) are the data; every output number is computed live in
// src/lib/polymarket.js. Forecast points are 3h apart, mirroring OpenWeatherMap's
// 5-day/3-hour feed the real bot consumes. Market questions stay in English:
// they are what real Polymarket markets look like.

export const SCENARIOS = [
  {
    id: "nyc-heat",
    label: { en: "NYC heatwave", it: "Ondata di caldo a NYC" },
    chip: { en: "Clear edge → BET YES", it: "Edge chiaro → BET YES" },
    question: "Will NYC temperature exceed 90°F on Friday?",
    parsed: { city: "New York (nyc)", threshold: "above 90°F" },
    yesPrice: 0.42,
    unit: "°F",
    threshold: { value: 90, direction: "above" },
    forecast: [88, 91, 93, 94, 92, 90, 89, 87],
    note: {
      en: "The market prices YES at 42¢, but 5 of 8 forecast points clear the threshold. That mispricing is the edge.",
      it: "Il mercato prezza il YES a 42¢, ma 5 punti di previsione su 8 superano la soglia. Quel disallineamento è l'edge.",
    },
  },
  {
    id: "miami-rain",
    label: { en: "Miami rain", it: "Pioggia a Miami" },
    chip: { en: "Edge too thin → SKIP", it: "Edge troppo sottile → SKIP" },
    question: "Will Miami see over 3 inches of rain this week?",
    parsed: { city: "Miami", threshold: "above 3in" },
    yesPrice: 0.55,
    unit: "in",
    threshold: { value: 3, direction: "above" },
    forecast: [2.4, 3.1, 3.6, 2.8, 3.3, 3.9, 2.6, 3.2, 2.9, 3.4, 2.7, 3.5, 3.8, 2.5, 3.3, 3.0],
    note: {
      en: "The forecast leans YES, but only a little past the market. Below the 15% edge floor the system stands down: it doesn't bet just to bet.",
      it: "La previsione pende verso il YES, ma solo di poco oltre il mercato. Sotto la soglia del 15% il sistema si ferma: non punta tanto per puntare.",
    },
  },
  {
    id: "chicago-cold",
    label: { en: "Chicago cold snap", it: "Gelo a Chicago" },
    chip: { en: "Market overpriced → BET NO", it: "Mercato sopravvalutato → BET NO" },
    question: "Will Chicago drop below 20°F this weekend?",
    parsed: { city: "Chicago", threshold: "below 20°F" },
    yesPrice: 0.7,
    unit: "°F",
    threshold: { value: 20, direction: "below" },
    forecast: [24, 22, 19, 21, 23, 18, 25, 26],
    note: {
      en: "The market has YES at 70¢ but only 2 of 8 forecast points go that cold. The edge is on the NO side, so the system bets against the crowd.",
      it: "Il mercato dà il YES a 70¢ ma solo 2 punti su 8 scendono così in basso. L'edge è sul lato NO: il sistema punta contro la folla.",
    },
  },
  {
    id: "london-snow",
    label: { en: "London snow, day 5", it: "Neve a Londra, giorno 5" },
    chip: { en: "Long horizon → lower confidence", it: "Orizzonte lungo → meno confidenza" },
    question: "Will it snow in London this Sunday?",
    parsed: { city: "London", threshold: "below 33°F (freezing proxy)" },
    yesPrice: 0.28,
    unit: "°F",
    threshold: { value: 33, direction: "below" },
    // 40 points × 3h = 120h out — confidence drops to 0.65 at this horizon.
    forecast: [
      36, 32, 33, 32, 31, 33, 35, 37,
      38, 36, 33, 32, 31, 32, 34, 36,
      37, 35, 33, 32, 33, 33, 36, 38,
      39, 37, 35, 33, 32, 33, 35, 37,
      38, 36, 33, 33, 35, 36, 38, 40,
    ],
    note: {
      en: "Five days out, forecasts get shaky. Confidence is flagged at 65%, and the same quarter-Kelly cap keeps the position small either way.",
      it: "A cinque giorni di distanza le previsioni diventano incerte. La confidenza viene segnalata al 65% e lo stesso tetto quarter-Kelly tiene comunque piccola la posizione.",
    },
  },
];
