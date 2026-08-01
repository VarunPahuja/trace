"use client";

import { useTraceStore } from "@/lib/store/traceStore";

export default function ProblemCard() {
  const meta = useTraceStore((s) => s.meta);
  if (!meta) return null;

  const { problemName, problemSummary, constraints } = meta;
  const unknown = !problemName || problemName === "Unknown";

  return (
    <div className="card-neo p-3 flex flex-col gap-2">
      <div className="font-display text-xs uppercase tracking-tight text-accent">Problem</div>
      <div className={`font-display text-sm uppercase tracking-tight ${unknown ? "text-ink/50" : "text-ink"}`}>
        {unknown ? "Unrecognized problem" : problemName}
      </div>
      {problemSummary && <p className="font-body text-sm text-ink/80">{problemSummary}</p>}
      {constraints && constraints.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {constraints.map((c, i) => (
            <span
              key={i}
              className="font-mono text-[11px] border-neo shadow-neo-sm rounded-md px-2 py-0.5 bg-paper text-ink/80"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
