// All user-facing copy, in one plain module so it can be imported by Node.
// scripts/verify-logic.mjs asserts EN/IT key parity and the no-em-dash rule
// against this file; keeping it out of the .jsx is what makes that possible.

// All user-facing copy lives here, in English and Italian, at full parity: no
// stubbed strings, no language that silently falls back to the other one.
// House rule: no em-dashes in anything a visitor reads, in either language.
// The Telegram alert body stays English wherever it appears: it mirrors the
// real bot's output verbatim, and translating it would misrepresent the system.

export const STRINGS = {
  en: {
    nav: {
      howIWork: "How I work",
      liveSystems: "Live systems",
      about: "About",
      bookACall: "Book a call",
      skipToContent: "Skip to content",
      language: "Switch to Italian",
    },
    common: { processing: "processing…" },

    hero: {
      // Mixed weight: the first line sits in the display face, the second drops
      // to the light weight. One sentence, two voices.
      lineA: "I build the systems",
      lineB: "that do your repetitive work.",
      byline: "GODOLKIN · PARMA, ITALIA",
    },

    howIWork: {
      kicker: "How I work",
      titleA: "Every system I build",
      titleB: "has the same seven steps.",
      lede: "Whatever the business, the shape does not change. Only what fills each step does.",
      stages: {
        intake: {
          name: "signal in",
          copy: "Something happens. A form is submitted, an email arrives, a file lands, a schedule fires.",
        },
        normalise: {
          name: "normalise",
          copy: "The mess is cleaned up. Duplicates collapse, formats align, missing details get filled in.",
        },
        classify: {
          name: "classify",
          copy: "The record is read and labelled. What it is, how urgent it is, whose desk it belongs on.",
        },
        decide: {
          name: "decide",
          copy: "A rule decides what happens next, including the decision to do nothing at all.",
        },
        act: {
          name: "act",
          copy: "The work itself. Draft the reply, price the property, build the report, update the record.",
        },
        notify: {
          name: "notify",
          copy: "A person is told, where that person already is. Telegram, email, a shared sheet.",
        },
        observe: {
          name: "log",
          copy: "Every decision is written down, skips included, so you can check the thing is still right.",
        },
      },
    },

    systems: {
      kicker: "Live systems",
      titleA: "Six systems.",
      titleB: "Three of them run in this page.",
      badges: { LIVE: "LIVE", REPLAY: "REPLAY", "PRIVATE BUILD": "PRIVATE BUILD" },
      badgeMeaning: {
        LIVE: "real, running, and clickable right here",
        REPLAY: "real logic, historical data, not live-computed",
        "PRIVATE BUILD": "a real system, described here rather than demonstrated",
      },
      groupA: {
        label: "Runs anywhere",
        lede: "Sector-neutral. Every business has enquiries to answer, numbers to report and decisions to make.",
      },
      groupB: {
        label: "Real estate in depth",
        lede: "Proof the practice goes deep in one vertical, not only wide. Real estate is where the deepest evidence lives, never the boundary.",
      },
      openProduct: "Open the live product",
      architecture: "Architecture",
      cards: {
        "lead-triage": {
          name: "Lead Auto-Triage",
          sector: "Any sector · inbound enquiries",
          body: "It reads an inbound enquiry the moment it arrives, classifies urgency, budget tier and category, and drafts a follow-up in seconds, around the clock.",
          note: "Rule-based, not an LLM call. For triage this structured, deterministic logic is faster, free to run, and never invents a promise you did not make.",
        },
        "report-gen": {
          name: "Auto Client-Report Generator",
          sector: "Any sector · reporting",
          body: "Raw campaign numbers in, a client-ready summary out: headline stat, highlights and a trend chart. Edit any number in the table and every figure recomputes.",
          note: "The same shape as every system here. Raw data in, reasoning in the middle, something a person can actually read at the end.",
        },
        "signal-bot": {
          name: "Weather Signal Bot",
          sector: "Any sector · scheduled decisions",
          body: "An external API in, decision logic in the middle, a human-facing alert out, with risk controls designed in from the first commit. It declines to act far more often than it acts.",
          note: "A system that knows when to say no.",
          detail:
            "Position sizing is quarter-Kelly, gated behind a 15% minimum edge and capped at $25 per signal. Those are the constants the production bot runs on, not illustrative numbers.",
        },
        valora: {
          name: "Valora",
          sector: "Property · valuation and lead capture",
          body: "A white-label valuation tool an agency embeds on its own site. The homeowner gets an instant, OMI-backed estimate; the agency gets a scored, ready-to-call lead in Telegram and Google Sheets the same second.",
          note: "The deepest system on this page: a complete product, shipped to a paying market, running on a real dataset.",
          dataset: "dataset",
          datasetRows: ["OMI Q2 2025", "157,000+ price rows", "27,000+ zone polygons"],
          stack: "stack",
          pipeline: "pipeline",
        },
        "buyer-match": {
          name: "Buyer-Matching Flow",
          sector: "Property · buyer matching",
          body: "A buyer submits their requirements through a Tally form: square footage, balconies, and the rest. The workflow searches the agency's own property database for the closest matches and emails the results back automatically.",
          note: "Built privately for an agency, so there is no demo to press here. The description is the whole claim.",
        },
        "deadline-tracker": {
          name: "Deadline & Compliance Tracker",
          sector: "Property · deadlines and compliance",
          body: "Property and contract dates arrive through a Tally form into Supabase. A daily scheduled check looks for approaching deadlines and raises an email or Telegram alert, with a simple dashboard over the top.",
          note: "Built privately for an agency, so there is no demo to press here. The description is the whole claim.",
        },
      },
    },

    demoSignal: {
      shellTitle: "weather-signal-bot · pipeline replay",
      run: "run pipeline",
      running: "running…",
      stages: ["Scan markets", "Forecast", "Edge and sizing", "Alert"],
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
      caption: "Every number above was computed here, from the scenario inputs, by the same logic the real bot runs.",
    },
    demoTriage: {
      shellTitle: "lead-triage · live rules engine",
      placeholder: "Paste an inbound enquiry, or type anything…",
      run: "triage lead",
      running: "triaging…",
      stages: ["Classify", "Prioritise", "Draft follow-up"],
      urgency: "urgency",
      budget: "budget",
      category: "category",
      priorityLine: (urgency, budget, isHigh) =>
        `${urgency} urgency + ${budget.toLowerCase()} budget → ${isHigh ? "routed to the top of the queue" : "routed for scheduled follow-up"}`,
      matchedOn: "matched on",
      draftHeader: "to: lead · subject: Re: your message",
      caption: "No model call behind this. Deterministic rules and templates, running on whatever you typed.",
    },
    demoReport: {
      shellTitle: "client-report-generator",
      week: "Week",
      weekPrefix: "W",
      columns: { impressions: "Impressions", clicks: "Clicks", conversions: "Conversions", spend: "Spend ($)" },
      run: "generate report",
      running: "generating…",
      stages: ["Crunch metrics", "Detect trends", "Compose report"],
      bestWeek: "best week:",
      biggestMover: "biggest mover:",
      reportKicker: "Weekly performance report",
      chartTitle: "Conversions by week",
      noValue: "n/a",
      caption: "Change any number in the table above and the whole report rebuilds, sentences included.",
    },

    about: {
      kicker: "About",
      titleA: "One person,",
      titleB: "answering personally.",
      intro:
        "Godolkin is one person, working alone from Parma, building production automation systems for small and medium businesses in any sector, and answering personally when one of them stops.",
      principles: [
        {
          title: "Ship in days, then iterate",
          copy: "A small working version in production beats a perfect plan in a document. Every system on this page started as a v1 that ran within the first week.",
        },
        {
          title: "Cost and safety designed in from day one",
          copy: "The signal bot has per-signal and daily exposure limits written into it. This site is fully static, so a demo cannot run up an API bill no matter how hard anyone hammers it.",
        },
        {
          title: "The right tool, not the fancy tool",
          copy: "Rule-based logic where determinism wins, models where language actually matters. Over-engineering is a cost the client pays forever.",
        },
        {
          title: "If it isn't observable, it isn't done",
          copy: "Every decision a system makes is logged and alerted, skips included. Automations you can't watch are automations you can't trust.",
        },
      ],
      stackLabel: "Stack",
      stack: "n8n · Supabase · PostGIS · OpenAI · Telegram · Google Sheets",
    },

    book: {
      kicker: "Book a call",
      titleA: "Tell me what is eating",
      titleB: "your team's hours.",
      lede: "Fifteen minutes. Describe the process by hand and I will tell you honestly whether automating it is worth your money.",
      schedulerPlaceholder: "Scheduler goes here once the booking link is live. Until then the form below reaches me directly.",
      form: {
        name: "Name",
        email: "Email",
        company: "Company",
        interest: "What is this about?",
        interests: [
          { id: "lead-handling", label: "Lead handling" },
          { id: "reporting", label: "Reporting" },
          { id: "data", label: "Data and enrichment" },
          { id: "property", label: "Property / real estate" },
          { id: "other", label: "Something else" },
        ],
        message: "What does the process look like today?",
        messagePlaceholder: "Roughly how it works now, and how often somebody has to do it by hand.",
        submit: "Send it",
        sending: "sending…",
        sent: "Thank you. It reached me, and I reply within a day.",
        error: "That did not send. Email me directly at",
        required: "required",
      },
    },

    footer: {
      honesty:
        "Every demo on this page runs entirely in your browser: real logic, bundled historical data, zero backend.",
      email: "Email",
      rights: "GODOLKIN · PARMA, ITALIA",
    },
  },

  it: {
    nav: {
      howIWork: "Come lavoro",
      liveSystems: "Sistemi live",
      about: "Chi sono",
      bookACall: "Prenota una call",
      skipToContent: "Vai al contenuto",
      language: "Passa all'inglese",
    },
    common: { processing: "elaborazione…" },

    hero: {
      lineA: "Costruisco i sistemi",
      lineB: "che fanno il tuo lavoro ripetitivo.",
      byline: "GODOLKIN · PARMA, ITALIA",
    },

    howIWork: {
      kicker: "Come lavoro",
      titleA: "Ogni sistema che costruisco",
      titleB: "ha gli stessi sette passi.",
      lede: "Qualunque sia l'attività, la forma non cambia. Cambia solo ciò che riempie ogni passo.",
      stages: {
        intake: {
          name: "segnale in",
          copy: "Succede qualcosa. Un form viene inviato, arriva una email, atterra un file, scatta un orario.",
        },
        normalise: {
          name: "normalizza",
          copy: "Il disordine viene ripulito. I duplicati si uniscono, i formati si allineano, i dati mancanti si completano.",
        },
        classify: {
          name: "classifica",
          copy: "Il record viene letto ed etichettato. Di cosa si tratta, quanto è urgente, a chi compete.",
        },
        decide: {
          name: "decide",
          copy: "Una regola decide cosa succede dopo, compresa la decisione di non fare nulla.",
        },
        act: {
          name: "agisce",
          copy: "Il lavoro vero e proprio. Scrivere la risposta, valutare l'immobile, costruire il report, aggiornare il record.",
        },
        notify: {
          name: "notifica",
          copy: "Una persona viene avvisata dove già si trova. Telegram, email, un foglio condiviso.",
        },
        observe: {
          name: "logga",
          copy: "Ogni decisione viene annotata, skip inclusi, così puoi controllare che la cosa sia ancora giusta.",
        },
      },
    },

    systems: {
      kicker: "Sistemi live",
      titleA: "Sei sistemi.",
      titleB: "Tre girano in questa pagina.",
      badges: { LIVE: "LIVE", REPLAY: "REPLAY", "PRIVATE BUILD": "BUILD PRIVATO" },
      badgeMeaning: {
        LIVE: "reale, in funzione, e cliccabile proprio qui",
        REPLAY: "logica reale, dati storici, non calcolata in tempo reale",
        "PRIVATE BUILD": "un sistema reale, qui descritto anziché dimostrato",
      },
      groupA: {
        label: "Funziona ovunque",
        lede: "Indipendente dal settore. Ogni attività ha richieste a cui rispondere, numeri da riportare e decisioni da prendere.",
      },
      groupB: {
        label: "Immobiliare in profondità",
        lede: "La prova che la pratica va in profondità in un settore, non solo in ampiezza. L'immobiliare è dove vivono le prove più solide, mai il confine.",
      },
      openProduct: "Apri il prodotto live",
      architecture: "Architettura",
      cards: {
        "lead-triage": {
          name: "Auto-Triage Lead",
          sector: "Qualsiasi settore · richieste in arrivo",
          body: "Legge una richiesta nel momento in cui arriva, classifica urgenza, fascia di budget e categoria, e scrive una risposta in pochi secondi, a qualsiasi ora.",
          note: "Logica a regole, non una chiamata a un modello. Per un triage così strutturato il determinismo è più veloce, non costa nulla da eseguire, e non inventa mai una promessa che non hai fatto.",
        },
        "report-gen": {
          name: "Generatore Report Cliente",
          sector: "Qualsiasi settore · reportistica",
          body: "Numeri grezzi di campagna in ingresso, un riepilogo pronto per il cliente in uscita: dato principale, punti salienti e grafico dell'andamento. Modifica un numero nella tabella e ogni cifra si ricalcola.",
          note: "La stessa forma di ogni sistema qui. Dati grezzi in ingresso, ragionamento nel mezzo, qualcosa che una persona può davvero leggere alla fine.",
        },
        "signal-bot": {
          name: "Weather Signal Bot",
          sector: "Qualsiasi settore · decisioni pianificate",
          body: "Un'API esterna in ingresso, logica di decisione nel mezzo, un avviso per una persona in uscita, con i controlli di rischio progettati dal primo commit. Rinuncia ad agire molto più spesso di quanto agisca.",
          note: "Un sistema che sa quando dire di no.",
          detail:
            "Il dimensionamento è un quarto di Kelly, vincolato a un edge minimo del 15% e limitato a 25$ per segnale. Sono le costanti su cui gira il bot in produzione, non numeri di esempio.",
        },
        valora: {
          name: "Valora",
          sector: "Immobiliare · valutazione e acquisizione lead",
          body: "Uno strumento di valutazione white-label che l'agenzia integra sul proprio sito. Il proprietario riceve una stima istantanea basata sui dati OMI; l'agenzia riceve nello stesso istante un lead già scoringato e pronto da richiamare, su Telegram e Google Sheets.",
          note: "Il sistema più profondo di questa pagina: un prodotto completo, consegnato a un mercato pagante, su un dataset reale.",
          dataset: "dataset",
          datasetRows: ["OMI Q2 2025", "157.000+ righe di prezzo", "27.000+ poligoni di zona"],
          stack: "stack",
          pipeline: "pipeline",
        },
        "buyer-match": {
          name: "Flusso Match Acquirenti",
          sector: "Immobiliare · match acquirenti",
          body: "Un acquirente invia i suoi requisiti tramite un form Tally: metratura, balconi, e il resto. Il flusso cerca nel database immobiliare dell'agenzia le corrispondenze più vicine e rimanda i risultati via email in automatico.",
          note: "Costruito privatamente per un'agenzia, quindi qui non c'è nessuna demo da premere. La descrizione è tutta la promessa.",
        },
        "deadline-tracker": {
          name: "Tracker Scadenze e Conformità",
          sector: "Immobiliare · scadenze e conformità",
          body: "Le date di immobili e contratti arrivano tramite un form Tally dentro Supabase. Un controllo pianificato giornaliero cerca le scadenze in avvicinamento e fa partire un avviso via email o Telegram, con una dashboard semplice sopra.",
          note: "Costruito privatamente per un'agenzia, quindi qui non c'è nessuna demo da premere. La descrizione è tutta la promessa.",
        },
      },
    },

    demoSignal: {
      shellTitle: "weather-signal-bot · replay della pipeline",
      run: "esegui pipeline",
      running: "in esecuzione…",
      stages: ["Scansione mercati", "Previsione", "Edge e sizing", "Avviso"],
      marketPrice: "prezzo YES di mercato:",
      category: "categoria: meteo",
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
      kellyPre: (k, cap) => `un quarto di Kelly (${k} del bankroll) limitato a ${cap}$ →`,
      kellyPost: (side) => `su ${side}`,
      actionLabel: "azione:",
      riskCaps: "limiti di rischio: 25% Kelly · 25$/segnale · 100$/giorno",
      caption:
        "Ogni numero qui sopra è stato calcolato qui, dagli input dello scenario, dalla stessa logica che gira nel bot reale.",
    },
    demoTriage: {
      shellTitle: "lead-triage · motore a regole live",
      placeholder: "Incolla una richiesta in arrivo, o scrivi qualsiasi cosa…",
      run: "classifica lead",
      running: "classificazione…",
      stages: ["Classifica", "Assegna priorità", "Scrivi la risposta"],
      urgency: "urgenza",
      budget: "budget",
      category: "categoria",
      priorityLine: (urgency, budget, isHigh) =>
        `urgenza ${urgency.toLowerCase()} + budget ${budget.toLowerCase()} → ${isHigh ? "messo in cima alla coda" : "instradato per un ricontatto programmato"}`,
      matchedOn: "riconosciuto su",
      draftHeader: "a: lead · oggetto: Re: il tuo messaggio",
      caption:
        "Dietro non c'è nessuna chiamata a un modello. Regole e template deterministici, che girano su quello che hai scritto.",
    },
    demoReport: {
      shellTitle: "generatore-report-cliente",
      week: "Settimana",
      weekPrefix: "S",
      columns: { impressions: "Impression", clicks: "Click", conversions: "Conversioni", spend: "Spesa ($)" },
      run: "genera report",
      running: "generazione…",
      stages: ["Calcola metriche", "Rileva andamenti", "Componi report"],
      bestWeek: "settimana migliore:",
      biggestMover: "variazione maggiore:",
      reportKicker: "Report settimanale delle performance",
      chartTitle: "Conversioni per settimana",
      noValue: "n/d",
      caption: "Cambia un numero qualsiasi nella tabella e il report si ricostruisce tutto, frasi comprese.",
    },

    about: {
      kicker: "Chi sono",
      titleA: "Una persona sola,",
      titleB: "che risponde di persona.",
      intro:
        "Godolkin lavora da solo, da Parma. Costruisce sistemi di automazione in produzione per PMI di qualsiasi settore, ed è la persona che risponde quando uno di questi si ferma.",
      principles: [
        {
          title: "Consegnare in giorni, poi iterare",
          copy: "Una piccola versione funzionante in produzione vale più di un piano perfetto in un documento. Ogni sistema di questa pagina è partito come v1 operativa entro la prima settimana.",
        },
        {
          title: "Costi e sicurezza progettati dal primo giorno",
          copy: "Il signal bot ha limiti di esposizione per segnale e giornalieri scritti nel codice. Questo sito è completamente statico, quindi una demo non può generare bollette API per quanto la si martelli.",
        },
        {
          title: "Lo strumento giusto, non quello di moda",
          copy: "Logica a regole dove vince il determinismo, modelli dove il linguaggio conta davvero. L'over-engineering è un costo che il cliente paga per sempre.",
        },
        {
          title: "Se non è osservabile, non è finito",
          copy: "Ogni decisione di un sistema viene loggata e notificata, skip inclusi. Un'automazione che non puoi osservare è un'automazione di cui non puoi fidarti.",
        },
      ],
      stackLabel: "Stack",
      stack: "n8n · Supabase · PostGIS · OpenAI · Telegram · Google Sheets",
    },

    book: {
      kicker: "Prenota una call",
      titleA: "Dimmi cosa sta mangiando",
      titleB: "le ore del tuo team.",
      lede: "Quindici minuti. Descrivimi il processo a mano e ti dirò onestamente se automatizzarlo vale i tuoi soldi.",
      schedulerPlaceholder:
        "Qui andrà il calendario quando il link per le prenotazioni sarà attivo. Fino ad allora il form qui sotto mi arriva direttamente.",
      form: {
        name: "Nome",
        email: "Email",
        company: "Azienda",
        interest: "Di cosa si tratta?",
        interests: [
          { id: "lead-handling", label: "Gestione lead" },
          { id: "reporting", label: "Reportistica" },
          { id: "data", label: "Dati e arricchimento" },
          { id: "property", label: "Immobiliare" },
          { id: "other", label: "Altro" },
        ],
        message: "Come funziona il processo oggi?",
        messagePlaceholder: "Più o meno come funziona adesso, e ogni quanto qualcuno deve farlo a mano.",
        submit: "Invia",
        sending: "invio…",
        sent: "Grazie. Mi è arrivato, e rispondo entro un giorno.",
        error: "L'invio non è riuscito. Scrivimi direttamente a",
        required: "obbligatorio",
      },
    },

    footer: {
      honesty:
        "Ogni demo di questa pagina gira interamente nel tuo browser: logica reale, dati storici inclusi, zero backend.",
      email: "Email",
      rights: "GODOLKIN · PARMA, ITALIA",
    },
  },
};
