"use client";

import { useTraceStore } from "@/lib/store/traceStore";

export default function VisualizeButton() {
  const visualize = useTraceStore((s) => s.visualize);
  const status = useTraceStore((s) => s.status);
  const busy = status === "preprocessing" || status === "warming" || status === "running";

  return (
    <button
      type="button"
      onClick={() => void visualize()}
      disabled={busy}
      className="btn-neo-accent disabled:opacity-60 disabled:cursor-wait"
    >
      {busy ? "Visualizing…" : "Visualize"}
    </button>
  );
}
