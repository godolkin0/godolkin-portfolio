import { createContext, useContext, useEffect, useState } from "react";

// All user-facing copy lives here, in English and Italian. Values may be
// strings or small functions when interpolation is needed. The Telegram alert
// body stays English on purpose: it mirrors the real bot's output verbatim.

const STRINGS = {
  en: {
    mailSubject: "Let's automate something",
    common: { processing: "processing…" },
    nav: { contact: "contact" },
    hero: {
      kicker: "Blenard · freelance automation developer",
      titleA: "Automation that actually ships.",
      titleB: "See it work before you hire me.",
      sub: "I design and ship automations for lead handling, reporting, and decision pipelines. The three below are real, running in your browser right now. Press run.",
      seeDemos: "see the demos",
    },
    avail: {
      status: "Available for contract work",
      replies: "replies within a day",
    },
    proof: {
      seeCode: "See the real code",
      watchRun: "Watch it run",
    },
    cases: {
      c1: {
        title: "Polymarket Weather Signal Bot",
        flag: "Real production system",
        paras: [
          "A pipeline I built and ran autonomously on a schedule: it scans Polymarket for weather-related prediction markets, parses the city and threshold straight out of each market's natural-language question, cross-references live weather forecasts, and computes the statistical edge against the market's price.",
          "When the edge clears a 15% floor, it sizes a position with risk-capped quarter-Kelly (per-signal and daily dollar limits hard-coded in) and pushes a formatted alert to Telegram in real time. Below the floor it deliberately does nothing: the skip logic is as important as the bet logic.",
          "Why it matters to an agency: this is end-to-end automation. External APIs in, decision logic in the middle, a human-facing alert out, with cost and risk controls designed in from the first commit instead of bolted on later.",
        ],
        highlight: "The Miami scenario says it best: I'd rather ship you a system that knows when to say no.",
      },
      c2: {
        title: "Lead Auto-Triage & Instant Follow-Up",
        flag: "Try it with your own text",
        paras: [
          "Agencies lose deals to slow lead response. This engine reads an inbound message the moment it arrives, classifies urgency, budget tier, and category, assigns a priority, and drafts a personalized follow-up in seconds, around the clock.",
          "It's deliberately rule-based, not an LLM call: for triage this structured, well-designed deterministic logic is faster, free to run, and never hallucinates a promise you didn't make. Simple and reliable beats slow and expensive.",
        ],
      },
      c3: {
        title: "Auto Client-Report Generator",
        flag: "Edit the inputs, it recomputes everything",
        paras: [
          "Agencies burn hours every week hand-assembling client reports. This takes raw campaign numbers and turns them into a client-ready summary with a headline stat, highlights, and a trend chart, instantly.",
          "Same shape as the trading bot: raw data in, automated reasoning in the middle, structured human-readable output at the end. That pipeline pattern is the product; reports are just one place it pays off.",
        ],
      },
    },
    demo1: {
      shellTitle: "weather-signal-bot · pipeline replay",
      badge: "REPLAY · historical scenarios, not a live trigger",
      run: "▶ run pipeline",
      running: "running…",
      stages: ["Scan Polymarket", "Forecast", "Edge & sizing", "Alert"],
      marketPrice: "market YES price:",
      category: "category: weather",
      parsedFrom: "parsed from question →",
      city: "city:",
      threshold: "threshold:",
      pointsLine: (m, total, dir) => `${m}/${total} points ${dir === "above" ? "above" : "below"} threshold`,
      probability: "probability",
      horizon: "horizon",
      confidence: "confidence",
      edgeIntro: (f, m) => `forecast ${f} vs market ${m} → edge`,
      sideNote: (side) => `(${side} side)`,
      minEdge: (pct) => `minimum edge to act: ${pct}`,
      kellyPre: (k, cap) => `quarter-Kelly (${k} of bankroll) capped at $${cap} →`,
      kellyPost: (side) => `on ${side}`,
      actionLabel: "action:",
      riskCaps: "risk caps: 25% Kelly · $25/signal · $100/day",
      caption:
        "Exactly how the real bot's Telegram alerts are formatted. Every number above was computed live from the scenario inputs.",
    },
    demo2: {
      shellTitle: "lead-triage · live rules engine",
      badge: "LIVE · runs on your input",
      placeholder: "Paste an inbound lead message, or type anything…",
      run: "▶ triage lead",
      running: "triaging…",
      stages: ["Classify", "Prioritize", "Draft follow-up"],
      urgency: "urgency",
      budget: "budget",
      category: "category",
      priorityLine: (urgency, budget, isHigh) =>
        `${urgency} urgency + ${budget.toLowerCase()} budget → ${isHigh ? "routed to the top of the queue" : "routed for scheduled follow-up"}`,
      matchedOn: "matched on",
      draftHeader: "to: lead · subject: Re: your message",
      caption:
        "No LLM call behind this. Deterministic rules and templates: for triage like this, simple and reliable beats slow and expensive.",
    },
    demo3: {
      shellTitle: "client-report-generator",
      badge: "LIVE · edit the numbers",
      week: "Week",
      weekPrefix: "W",
      columns: { impressions: "Impressions", clicks: "Clicks", conversions: "Conversions", spend: "Spend ($)" },
      run: "▶ generate report",
      running: "generating…",
      stages: ["Crunch metrics", "Detect trends", "Compose report"],
      bestWeek: "best week:",
      biggestMover: "biggest mover:",
      reportKicker: "Weekly performance report",
      chartTitle: "Conversions by week",
    },
    projects: {
      heading: "More builds, by sector",
      subhead: "Automations I've shipped in production, grouped by the sector they serve.",
      liveBadge: "Live",
      privateBadge: "Private build",
      viewLive: "View live",
    },
    how: {
      title: "How I work",
      items: [
        {
          title: "Ship in days, then iterate",
          body: "A small working version in production beats a perfect plan in a document. Every project here started as a v1 that ran within the first week.",
        },
        {
          title: "Cost and safety designed in from day one",
          body: "The trading bot has quarter-Kelly sizing, a per-signal cap, and a daily exposure limit. This site is fully static, so a demo can't run up an API bill no matter how hard anyone hammers it.",
        },
        {
          title: "The right tool, not the fancy tool",
          body: "Rule-based logic where determinism wins, LLMs where language actually matters. Over-engineering is a cost the client pays forever.",
        },
        {
          title: "If it isn't observable, it isn't done",
          body: "Every decision the bot makes is logged and alerted, skips included. Automations you can't watch are automations you can't trust.",
        },
      ],
    },
    contact: {
      title: "Got a workflow that's eating hours?",
      sub: "I'm Blenard. I build automations like the ones you just ran. Tell me what's slow and I'll tell you honestly whether automation fixes it.",
      button: "Let's automate something →",
      copyAria: "Copy email address",
      copied: "Copied!",
      linkedin: "Connect on LinkedIn",
      telegram: "Message me on Telegram, the same one my bot pings",
      booking: "Book 15 min",
    },
    footer:
      "GODOLKIN · built by Blenard. Every demo on this page runs entirely in your browser: real logic, bundled historical data, zero backend.",
  },

  it: {
    mailSubject: "Automatizziamo qualcosa",
    common: { processing: "elaborazione…" },
    nav: { contact: "contatti" },
    hero: {
      kicker: "Blenard · sviluppatore di automazioni freelance",
      titleA: "Automazione che va davvero in produzione.",
      titleB: "Vedila funzionare prima di assumermi.",
      sub: "Progetto e consegno automazioni per gestione lead, reportistica e pipeline decisionali. Le tre qui sotto sono reali e girano nel tuo browser in questo momento. Premi run.",
      seeDemos: "guarda le demo",
    },
    avail: {
      status: "Disponibile per lavori a contratto",
      replies: "rispondo entro un giorno",
    },
    proof: {
      seeCode: "Guarda il codice vero",
      watchRun: "Guardalo in azione",
    },
    cases: {
      c1: {
        title: "Polymarket Weather Signal Bot",
        flag: "Sistema reale in produzione",
        paras: [
          "Una pipeline che ho costruito e mandato in esecuzione autonoma su base programmata: scansiona Polymarket alla ricerca di mercati predittivi sul meteo, estrae città e soglia direttamente dalla domanda in linguaggio naturale di ogni mercato, incrocia il tutto con le previsioni meteo e calcola il vantaggio statistico rispetto al prezzo di mercato.",
          "Quando l'edge supera la soglia del 15%, dimensiona la posizione con quarter-Kelly a rischio limitato (limiti in dollari per segnale e giornalieri scritti nel codice) e invia un alert formattato su Telegram in tempo reale. Sotto la soglia non fa nulla, di proposito: la logica di skip conta quanto quella di puntata.",
          "Perché interessa a un'agenzia: è automazione end-to-end. API esterne in ingresso, logica decisionale nel mezzo, un alert leggibile in uscita, con controlli di costo e rischio progettati dal primo commit e non aggiunti dopo.",
        ],
        highlight: "Lo scenario di Miami lo dice meglio di tutto: preferisco consegnarti un sistema che sa quando dire di no.",
      },
      c2: {
        title: "Auto-Triage dei Lead e Risposta Immediata",
        flag: "Provalo con il tuo testo",
        paras: [
          "Le agenzie perdono contratti per la lentezza nel rispondere ai lead. Questo motore legge un messaggio nell'istante in cui arriva, classifica urgenza, fascia di budget e categoria, assegna una priorità e prepara una risposta personalizzata in pochi secondi, 24 ore su 24.",
          "È volutamente basato su regole, senza chiamate a un LLM: per un triage così strutturato la logica deterministica ben progettata è più veloce, gira gratis e non si inventa mai promesse che non hai fatto. Semplice e affidabile batte lento e costoso.",
        ],
      },
      c3: {
        title: "Generatore Automatico di Report per i Clienti",
        flag: "Modifica i numeri, ricalcola tutto",
        paras: [
          "Le agenzie bruciano ore ogni settimana ad assemblare a mano i report per i clienti. Questo prende i numeri grezzi delle campagne e li trasforma all'istante in un riepilogo pronto da inviare, con dato principale, punti salienti e grafico del trend.",
          "Stessa forma del trading bot: dati grezzi in ingresso, ragionamento automatico nel mezzo, output strutturato e leggibile alla fine. Il prodotto è quel pattern di pipeline; i report sono solo uno dei posti in cui rende.",
        ],
      },
    },
    demo1: {
      shellTitle: "weather-signal-bot · replay della pipeline",
      badge: "REPLAY · scenari storici, non un trigger live",
      run: "▶ esegui pipeline",
      running: "in esecuzione…",
      stages: ["Scansione Polymarket", "Previsioni", "Edge e sizing", "Alert"],
      marketPrice: "prezzo YES di mercato:",
      category: "categoria: weather",
      parsedFrom: "estratto dalla domanda →",
      city: "città:",
      threshold: "soglia:",
      pointsLine: (m, total, dir) => `${m}/${total} punti ${dir === "above" ? "sopra" : "sotto"} la soglia`,
      probability: "probabilità",
      horizon: "orizzonte",
      confidence: "confidenza",
      edgeIntro: (f, m) => `previsione ${f} vs mercato ${m} → edge`,
      sideNote: (side) => `(lato ${side})`,
      minEdge: (pct) => `edge minimo per agire: ${pct}`,
      kellyPre: (k, cap) => `quarter-Kelly (${k} del bankroll) con tetto a $${cap} →`,
      kellyPost: (side) => `su ${side}`,
      actionLabel: "azione:",
      riskCaps: "limiti di rischio: 25% Kelly · $25/segnale · $100/giorno",
      caption:
        "Il formato è identico agli alert Telegram del bot reale. Ogni numero qui sopra è stato calcolato in tempo reale dagli input dello scenario.",
    },
    demo2: {
      shellTitle: "lead-triage · motore di regole live",
      badge: "LIVE · gira sul tuo testo",
      placeholder: "Incolla il messaggio di un lead, o scrivi quello che vuoi…",
      run: "▶ analizza lead",
      running: "analisi…",
      stages: ["Classificazione", "Priorità", "Bozza di risposta"],
      urgency: "urgenza",
      budget: "budget",
      category: "categoria",
      priorityLine: (urgency, budget, isHigh) =>
        `urgenza ${urgency.toLowerCase()} + budget ${budget.toLowerCase()} → ${isHigh ? "in cima alla coda" : "follow-up programmato"}`,
      matchedOn: "match su",
      draftHeader: "a: lead · oggetto: Re: il tuo messaggio",
      caption:
        "Nessuna chiamata a un LLM. Regole deterministiche e template: per un triage così, semplice e affidabile batte lento e costoso.",
    },
    demo3: {
      shellTitle: "client-report-generator",
      badge: "LIVE · modifica i numeri",
      week: "Sett.",
      weekPrefix: "S",
      columns: { impressions: "Impression", clicks: "Click", conversions: "Conversioni", spend: "Spesa ($)" },
      run: "▶ genera report",
      running: "generazione…",
      stages: ["Calcolo metriche", "Rilevamento trend", "Composizione report"],
      bestWeek: "settimana migliore:",
      biggestMover: "variazione maggiore:",
      reportKicker: "Report settimanale delle performance",
      chartTitle: "Conversioni per settimana",
    },
    projects: {
      heading: "Altri progetti, per settore",
      subhead: "Automazioni che ho portato in produzione, raggruppate per settore.",
      liveBadge: "Online",
      privateBadge: "Progetto privato",
      viewLive: "Vedi il sito",
    },
    how: {
      title: "Come lavoro",
      items: [
        {
          title: "Consegna in giorni, poi itera",
          body: "Una piccola versione funzionante in produzione vale più di un piano perfetto in un documento. Ogni progetto qui è partito come v1 operativa entro la prima settimana.",
        },
        {
          title: "Costi e sicurezza progettati dal primo giorno",
          body: "Il trading bot ha sizing quarter-Kelly, un tetto per segnale e un limite di esposizione giornaliero. Questo sito è completamente statico, quindi una demo non può generare bollette API per quanto la si martelli.",
        },
        {
          title: "Lo strumento giusto, non quello di moda",
          body: "Logica a regole dove vince il determinismo, LLM dove il linguaggio conta davvero. L'over-engineering è un costo che il cliente paga per sempre.",
        },
        {
          title: "Se non è osservabile, non è finito",
          body: "Ogni decisione del bot viene loggata e notificata, skip inclusi. Un'automazione che non puoi osservare è un'automazione di cui non puoi fidarti.",
        },
      ],
    },
    contact: {
      title: "Un flusso di lavoro ti sta mangiando ore?",
      sub: "Sono Blenard. Costruisco automazioni come quelle che hai appena eseguito. Dimmi cosa è lento e ti dirò onestamente se l'automazione lo risolve.",
      button: "Automatizziamo qualcosa →",
      copyAria: "Copia l'indirizzo email",
      copied: "Copiato!",
      linkedin: "Collegati su LinkedIn",
      telegram: "Scrivimi su Telegram, lo stesso a cui il mio bot manda gli alert",
      booking: "Prenota 15 minuti",
    },
    footer:
      "GODOLKIN · creato da Blenard. Ogni demo di questa pagina gira interamente nel tuo browser: logica reale, dati storici inclusi, zero backend.",
  },
};

const LangContext = createContext({ lang: "en", setLang: () => {}, t: STRINGS.en });

function initialLang() {
  try {
    const saved = localStorage.getItem("godolkin-lang");
    if (saved === "en" || saved === "it") return saved;
    if (navigator.language?.toLowerCase().startsWith("it")) return "it";
  } catch {
    /* private mode etc. */
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    try {
      localStorage.setItem("godolkin-lang", lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang, t: STRINGS[lang] }}>{children}</LangContext.Provider>;
}

export function useI18n() {
  return useContext(LangContext);
}
