"use client";

// Temporary Phase 1 validation harness — proves worker+Pyodide+tracer produce
// a correct trace end to end. Superseded by the real editor/controls in Phase 2.
import { useState } from "react";
import { getPyodideClient } from "@/lib/trace/pyodideClient";
import { TWO_SUM_SOURCE } from "@/lib/examples/twoSum";
import type { TraceResult } from "@/lib/trace/types";

export default function Phase1TraceTest() {
  const [status, setStatus] = useState<"idle" | "warming" | "running" | "done" | "error">("idle");
  const [summary, setSummary] = useState<string | null>(null);

  async function run() {
    setStatus("warming");
    const client = getPyodideClient();
    if (client.getStatus() !== "ready") {
      await new Promise<void>((resolve) => {
        const offReady = client.onReady(() => {
          offReady();
          offError();
          resolve();
        });
        const offError = client.onError((message) => {
          offReady();
          offError();
          setStatus("error");
          setSummary(`worker error: ${message}`);
          resolve();
        });
        client.ensureStarted();
      });
      if (client.getStatus() !== "ready") return;
    }
    setStatus("running");
    const result: TraceResult = await client.runTrace(TWO_SUM_SOURCE);
    console.log("Two Sum trace result", result);
    if (result.error) {
      setStatus("error");
      setSummary(`${result.error.message} (line ${result.error.line})`);
      return;
    }
    setStatus("done");
    const last = result.steps.at(-1);
    setSummary(
      `${result.steps.length} steps, truncated=${result.truncated}, final result=${JSON.stringify(last?.locals.result)}`,
    );
  }

  return (
    <div className="card-neo p-3 font-mono text-xs text-ink/70 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button type="button" onClick={run} className="btn-neo text-xs py-1">
          Phase 1 check: trace Two Sum
        </button>
        <span>{status}</span>
      </div>
      {summary && <div>{summary}</div>}
    </div>
  );
}
