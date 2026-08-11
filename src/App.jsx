// Placeholder shell. The page is built in Phase 2, once the graph is settled on
// its own route at /graph.html. Kept minimal on purpose so the production build
// stays green while the graph is being tuned.
export function App() {
  return (
    <main className="wash grain min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
        <p className="t-label text-[var(--color-muted)]">Rebuild in progress</p>
        <h1 className="t-display mt-4">
          I build the systems
          <br />
          <span className="t-display-soft">that do your repetitive work.</span>
        </h1>
        <p className="t-secondary mt-6">
          The hero graph is being built in isolation at <span className="t-mono">/graph.html</span>.
        </p>
      </div>
    </main>
  );
}
