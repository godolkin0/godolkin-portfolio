import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Two entry points. `index.html` is the site; `graph.html` is the hero graph
// running on its own, with nothing else on the page — it is the highest-risk
// element, so it gets built and tuned in isolation before the page wraps it.
// The graph page carries a noindex tag; it ships but is not a public surface.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        graph: resolve(import.meta.dirname, "graph.html"),
      },
    },
  },
});
