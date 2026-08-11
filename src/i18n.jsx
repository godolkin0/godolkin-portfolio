import { createContext, useContext, useEffect, useState } from "react";
import { STRINGS } from "./copy.js";

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

