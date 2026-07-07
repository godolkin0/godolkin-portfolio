// Portfolio project showcases. Each card either links out to its own live site
// or shows a "private build" badge when there's no public URL. Add a new entry
// to extend the section, no component changes needed.
//
// `thumb` is optional: drop a real screenshot PNG in public/projects/ and set
// the path (e.g. "/projects/valora.png") to replace the generated initial tile.

export const PROJECTS = [
  {
    id: "valora",
    name: "Valora",
    initial: "V",
    sector: { en: "Real Estate · Lead Valuation", it: "Immobiliare · Valutazione Lead" },
    blurb: {
      en: "A white-label valuation tool real estate agencies embed on their own site. A homeowner gets an instant, OMI-data-backed price estimate; the agency gets a scored, ready-to-call lead pushed to Telegram and Google Sheets the same second.",
      it: "Uno strumento di valutazione white-label che le agenzie immobiliari integrano sul proprio sito. Il proprietario riceve una stima istantanea basata sui dati OMI; l'agenzia riceve un lead già scoringato e pronto da richiamare, inviato su Telegram e Google Sheets nello stesso istante.",
    },
    url: "https://valora-landing-10417c.netlify.app/",
    thumb: null,
  },
  {
    id: "lead-listing-matcher",
    name: "Lead-to-Listing Matcher",
    initial: "M",
    sector: { en: "Real Estate · Buyer Matching", it: "Immobiliare · Match Acquirenti" },
    blurb: {
      en: "A private automation for a real estate site: a buyer's inquiry form gets deduplicated and AI-scored hot, warm, or cold, then matched against the agency's live listings for genuine fits, and emailed out via Gmail with a Telegram heads-up.",
      it: "Un'automazione privata per un sito immobiliare: il form di richiesta di un acquirente viene deduplicato e classificato dall'IA come hot, warm o cold, poi confrontato con gli annunci attivi dell'agenzia per trovare match reali, e inviato via Gmail con una notifica su Telegram.",
    },
    // Private build: no public URL. Card shows a "private build" badge instead of a link.
    url: null,
    thumb: null,
  },
];
