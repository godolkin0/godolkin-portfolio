import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "./analytics.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Staged reveal shared by all three demos. The logic itself is instant JS —
// this paces the output so each pipeline stage gets a visible processing beat.
// Statuses per stage: "pending" → "running" (spinner) → "done" (content).
//
// `name` is the one instrumentation point for all three demos. It sits here
// rather than on each RunButton because every demo already routes its run
// through this hook, so one call site cannot drift out of sync with another,
// and a demo added later is measured the day it is added. Use the system id
// from src/data/graph.js so the event joins to the graph without a lookup.
export function usePipeline(stageCount, { gap = 350, spin = 550, name = null } = {}) {
  const [stages, setStages] = useState(() => Array(stageCount).fill("pending"));
  const [running, setRunning] = useState(false);
  const runId = useRef(0);

  useEffect(() => () => { runId.current += 1; }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
    // Fired on intent, before the staged reveal starts, so a visitor who runs
    // a demo and immediately scrolls away still counts as having run it.
    if (name) track("demo_run", { demo: name });
    setRunning(true);
    setStages(Array(stageCount).fill("pending"));
    for (let i = 0; i < stageCount; i += 1) {
      await sleep(i === 0 ? 150 : gap);
      if (runId.current !== id) return;
      setStages((prev) => prev.map((s, j) => (j === i ? "running" : j < i ? "done" : "pending")));
      await sleep(spin);
      if (runId.current !== id) return;
      setStages((prev) => prev.map((s, j) => (j <= i ? "done" : "pending")));
    }
    if (runId.current === id) setRunning(false);
  }, [stageCount, gap, spin, name]);

  const reset = useCallback(() => {
    runId.current += 1;
    setRunning(false);
    setStages(Array(stageCount).fill("pending"));
  }, [stageCount]);

  return { stages, running, run, reset };
}
