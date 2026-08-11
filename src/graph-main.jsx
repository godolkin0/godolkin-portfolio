import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { PracticeGraph } from "./components/PracticeGraph.jsx";
import { LINKS, NODES } from "./data/graph.js";

// Workbench for the hero graph, on its own route with nothing else on the page.
// The graph is the highest-risk element in the rebuild and everything around it
// is conventional, so it gets tuned here before the page is wired around it.
// Not linked from anywhere and tagged noindex.

function Workbench() {
  const [lang, setLang] = useState("en");
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <main className="min-h-screen wash grain">
      <div className="mx-auto max-w-[1600px] px-6 py-6">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="t-label text-[var(--color-muted)]">Graph workbench</h1>
          <div className="flex items-center gap-2">
            <Toggle on={lang === "it"} onClick={() => setLang(lang === "en" ? "it" : "en")}>
              {lang.toUpperCase()}
            </Toggle>
            <Toggle on={isMobile} onClick={() => setIsMobile((v) => !v)}>
              {isMobile ? "mobile" : "desktop"}
            </Toggle>
          </div>
        </header>

        <div
          className={`mt-4 border border-[var(--color-line)]/40 ${
            isMobile ? "mx-auto w-[390px]" : "w-full"
          }`}
        >
          <PracticeGraph
            lang={lang}
            isMobile={isMobile}
            onActiveChange={setActive}
            className="block h-[70vh] w-full"
          />
        </div>

        <p className="t-secondary mt-4">
          {NODES.length} nodes · {LINKS.length} edges · active:{" "}
          <span className="t-mono text-[var(--color-ink)]">{active ?? "none"}</span>
        </p>
      </div>
    </main>
  );
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`t-label rounded-full border px-4 py-1.5 transition-colors ${
        on
          ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
          : "border-[var(--color-line)] text-[var(--color-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Workbench />
  </StrictMode>
);
