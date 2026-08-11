import { createContext, useContext, useEffect, useState } from "react";

// All user-facing copy lives here, in English and Italian, at full parity: no
// stubbed strings, no language that silently falls back to the other one.
// House rule: no em-dashes in anything a visitor reads, in either language.
// The Telegram alert body stays English on purpose, wherever it appears: it
// mirrors the real bot's output verbatim.

const STRINGS = {
  en: {
    nav: {
      howIWork: "How I work",
      liveSystems: "Live systems",
      about: "About",
      bookACall: "Book a call",
      skipToContent: "Skip to content",
      language: "Switch to Italian",
    },
    hero: {
      // Mixed weight: the first line sits in the display face, the second drops
      // to the light weight. One sentence, two voices.
      lineA: "I build the systems",
      lineB: "that do your repetitive work.",
      byline: "GODOLKIN · PARMA, ITALIA",
      graphHint: "Hover a system to see what it is built from. Click to jump to it.",
      graphHintTouch: "Tap a system to jump to it.",
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
    hero: {
      lineA: "Costruisco i sistemi",
      lineB: "che fanno il tuo lavoro ripetitivo.",
      byline: "GODOLKIN · PARMA, ITALIA",
      graphHint: "Passa sopra un sistema per vedere di cosa è fatto. Clicca per raggiungerlo.",
      graphHintTouch: "Tocca un sistema per raggiungerlo.",
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
