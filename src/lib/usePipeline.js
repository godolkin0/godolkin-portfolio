import { useCallback, useEffect, useRef, useState } from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Staged reveal shared by all three demos. The logic itself is instant JS —
// this paces the output so each pipeline stage gets a visible processing beat.
// Statuses per stage: "pending" → "running" (spinner) → "done" (content).
export function usePipeline(stageCount, { gap = 350, spin = 550 } = {}) {
  const [stages, setStages] = useState(() => Array(stageCount).fill("pending"));
  const [running, setRunning] = useState(false);
  const runId = useRef(0);

  useEffect(() => () => { runId.current += 1; }, []);

  const run = useCallback(async () => {
    const id = ++runId.current;
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
  }, [stageCount, gap, spin]);

  const reset = useCallback(() => {
    runId.current += 1;
    setRunning(false);
    setStages(Array(stageCount).fill("pending"));
  }, [stageCount]);

  return { stages, running, run, reset };
}
