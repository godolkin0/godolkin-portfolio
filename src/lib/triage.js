// Rule-based lead triage. Deterministic on purpose: for classification this
// simple, well-designed rules beat a slow, metered LLM call.
// Rules match English and Italian keywords; classification results are
// canonical keys, translated at the display layer (see labels below).

const URGENCY_RULES = [
  {
    level: "High",
    words: [
      "asap", "urgent", "immediately", "right away", "today", "this week", "emergency", "losing sales",
      "urgente", "subito", "immediatamente", "oggi", "questa settimana", "emergenza", "perdendo vendite", "al più presto",
    ],
  },
  {
    level: "Medium",
    words: ["this month", "soon", "next few weeks", "quickly", "shortly", "questo mese", "presto", "prossime settimane"],
  },
];

const CATEGORY_RULES = [
  {
    category: "Urgent Fix",
    words: ["checkout", "broken", "bug", "down", "fix", "crash", "error", "not working", "rotto", "non funziona", "guasto", "errore", "bloccato"],
  },
  {
    category: "Automation",
    words: ["automat", "automazion", "workflow", "integrat", "zapier", "pipeline", "scraper", "bot", "flusso di lavoro"],
  },
  {
    category: "Web Dev",
    words: ["website", "redesign", "site", "landing page", "web dev", "webshop", "storefront", "sito", "restyling", "e-commerce"],
  },
  {
    category: "Marketing / Social",
    words: ["social", "content", "posts", "instagram", "tiktok", "seo", "ads", "campaign", "contenuti", "pubblicità", "campagna"],
  },
];

export function classifyLead(message) {
  const text = message.toLowerCase();

  // Urgency: first matching tier wins, default Low.
  let urgency = "Low";
  let urgencyPhrase = null;
  for (const rule of URGENCY_RULES) {
    const hit = rule.words.find((w) => text.includes(w));
    if (hit) {
      urgency = rule.level;
      urgencyPhrase = hit;
      break;
    }
  }

  // Budget: extract an amount in $ or € ("$8k", "$8,000", "€800").
  let budgetAmount = null;
  const kMatch = text.match(/[$€]\s*(\d+(?:\.\d+)?)\s*k\b/);
  const plainMatch = text.match(/[$€]\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/);
  if (kMatch) budgetAmount = parseFloat(kMatch[1]) * 1000;
  else if (plainMatch) budgetAmount = parseFloat(plainMatch[1].replace(/,/g, ""));

  let budget = "Unspecified";
  if (budgetAmount !== null) {
    if (budgetAmount < 1000) budget = "Small";
    else if (budgetAmount <= 10000) budget = "Mid";
    else budget = "Large";
  }

  // Category: first taxonomy hit wins; free text always resolves to something.
  let category = "General Inquiry";
  let categoryPhrase = null;
  for (const rule of CATEGORY_RULES) {
    const hit = rule.words.find((w) => text.includes(w));
    if (hit) {
      category = rule.category;
      categoryPhrase = hit;
      break;
    }
  }

  const priority = priorityKey(urgency, budget);

  return { urgency, urgencyPhrase, budget, budgetAmount, category, categoryPhrase, priority };
}

// Every urgency × budget combination maps to a priority key. No dead ends.
function priorityKey(urgency, budget) {
  const funded = budget === "Mid" || budget === "Large";
  if (urgency === "High") return funded ? "hot" : "respondNow";
  if (urgency === "Medium") return funded ? "qualified" : "followUp";
  if (budget === "Large") return "qualified";
  if (budget === "Mid") return "followUp";
  return "nurture";
}

export const PRIORITY_LABELS = {
  en: { hot: "🔥 Hot Lead", respondNow: "⚡ Respond Now", qualified: "📈 Qualified", followUp: "📋 Follow-Up", nurture: "🌱 Nurture" },
  it: { hot: "🔥 Lead Caldo", respondNow: "⚡ Rispondi Subito", qualified: "📈 Qualificato", followUp: "📋 Da Ricontattare", nurture: "🌱 Da Coltivare" },
};

export const URGENCY_LABELS = {
  en: { High: "High", Medium: "Medium", Low: "Low" },
  it: { High: "Alta", Medium: "Media", Low: "Bassa" },
};

export const BUDGET_LABELS = {
  en: { Small: "Small", Mid: "Mid", Large: "Large", Unspecified: "Unspecified" },
  it: { Small: "Piccolo", Mid: "Medio", Large: "Grande", Unspecified: "Non specificato" },
};

export const CATEGORY_LABELS = {
  en: {
    "Urgent Fix": "Urgent Fix",
    Automation: "Automation",
    "Web Dev": "Web Dev",
    "Marketing / Social": "Marketing / Social",
    "General Inquiry": "General Inquiry",
  },
  it: {
    "Urgent Fix": "Fix Urgente",
    Automation: "Automazione",
    "Web Dev": "Sviluppo Web",
    "Marketing / Social": "Marketing / Social",
    "General Inquiry": "Richiesta Generica",
  },
};

const TEMPLATES = {
  en: {
    openers: {
      High: "Thanks for reaching out. I saw the urgency, so I'm replying straight away.",
      Medium: "Thanks for reaching out. This sounds like a solid fit, and your timeline is very doable.",
      Low: "Thanks for reaching out. Happy to give you the full picture, no pressure attached.",
    },
    bodies: {
      "Urgent Fix":
        "Broken revenue paths get priority: my first step is a quick diagnostic call so I can reproduce the issue, then I'll patch the immediate problem before touching anything structural.",
      Automation:
        "Automation projects are my core work. I'd map the workflow end-to-end first, then ship a small working version within days so you can see it run before committing further.",
      "Web Dev":
        "For build and redesign work I start with a short scoping call, turn that into a fixed plan with milestones, and ship a first working version early rather than disappearing for a month.",
      "Marketing / Social":
        "For marketing and content operations I focus on the repeatable parts (scheduling, reporting, asset pipelines) so your team spends time on creative, not busywork.",
      "General Inquiry":
        "Happy to answer anything. The easiest next step is a quick call where you describe what's eating your team's time, and I'll tell you honestly whether automation helps.",
    },
    budgetSmall: (amount) => `A budget around ${amount} works for a tightly scoped first version. I'll propose exactly what fits inside it.`,
    budgetSolid: (amount) => `A budget around ${amount} gives us real room to do this properly. I'll send a scoped proposal so you know exactly where it goes.`,
    timeline: (phrase) => `You mentioned "${phrase}" and I can accommodate that timeline.`,
    close: "Would a 15-minute call tomorrow work? Reply with a time and I'll send an invite.\n\nBlenard",
  },
  it: {
    openers: {
      High: "Grazie per avermi scritto. Ho visto l'urgenza, quindi rispondo subito.",
      Medium: "Grazie per avermi scritto. Sembra un ottimo fit e la tua tempistica è assolutamente fattibile.",
      Low: "Grazie per avermi scritto. Volentieri ti do il quadro completo, senza alcuna pressione.",
    },
    bodies: {
      "Urgent Fix":
        "I percorsi di ricavo rotti hanno la priorità: il primo passo è una breve call diagnostica per riprodurre il problema, poi sistemo il guasto immediato prima di toccare qualsiasi cosa di strutturale.",
      Automation:
        "I progetti di automazione sono il mio lavoro principale. Prima mappo il flusso end-to-end, poi consegno in pochi giorni una piccola versione funzionante, così la vedi girare prima di impegnarti oltre.",
      "Web Dev":
        "Per sviluppo e redesign parto da una breve call di inquadramento, la trasformo in un piano fisso con milestone e consegno presto una prima versione funzionante, invece di sparire per un mese.",
      "Marketing / Social":
        "Per marketing e contenuti mi concentro sulle parti ripetibili (programmazione, reportistica, pipeline di asset) così il tuo team passa il tempo sulla creatività, non sul lavoro manuale.",
      "General Inquiry":
        "Rispondo volentieri a qualsiasi domanda. Il passo più semplice è una breve call in cui mi racconti cosa sta mangiando il tempo del tuo team, e ti dirò onestamente se l'automazione può aiutare.",
    },
    budgetSmall: (amount) => `Un budget intorno a ${amount} va bene per una prima versione dal perimetro stretto. Ti proporrò esattamente ciò che ci sta dentro.`,
    budgetSolid: (amount) => `Un budget intorno a ${amount} ci dà davvero spazio per farlo bene. Ti invierò una proposta dettagliata così sai esattamente dove va a finire.`,
    timeline: (phrase) => `Hai menzionato "${phrase}" e posso rispettare quella tempistica.`,
    close: "Andrebbe bene una call di 15 minuti domani? Rispondi con un orario e ti mando l'invito.\n\nBlenard",
  },
};

export function draftFollowUp(message, result, lang = "en") {
  const T = TEMPLATES[lang] ?? TEMPLATES.en;
  const parts = [T.openers[result.urgency], T.bodies[result.category]];

  if (result.budgetAmount !== null) {
    const amount = `$${result.budgetAmount.toLocaleString("en-US")}`;
    parts.push(result.budget === "Small" ? T.budgetSmall(amount) : T.budgetSolid(amount));
  }

  if (result.urgencyPhrase && result.urgency !== "Low") {
    parts.push(T.timeline(result.urgencyPhrase));
  }

  parts.push(T.close);
  return parts.join(" ");
}

export const EXAMPLE_LEADS = {
  en: [
    {
      label: "Redesign, $8k, this month",
      text: "Hey we need a full website redesign, kind of urgent, budget around $8k, can you start this month?",
    },
    {
      label: "Price shopper",
      text: "just curious what you guys charge for social media management",
    },
    {
      label: "Checkout down, ASAP",
      text: "URGENT - our checkout is broken and we're losing sales, need this fixed ASAP",
    },
  ],
  it: [
    {
      label: "Redesign, $8k, questo mese",
      text: "Ciao, ci serve un redesign completo del sito, abbastanza urgente, budget intorno a $8k, puoi iniziare questo mese?",
    },
    {
      label: "Caccia-prezzi",
      text: "volevo solo sapere quanto costa la gestione dei social",
    },
    {
      label: "Checkout giù, subito",
      text: "URGENTE - il checkout è rotto e stiamo perdendo vendite, serve un fix subito",
    },
  ],
};
