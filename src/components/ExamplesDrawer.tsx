"use client";

import { useState } from "react";
import { EXAMPLES, groupExamplesByTopic } from "@/lib/examples";
import { useTraceStore } from "@/lib/store/traceStore";
import type { Example } from "@/lib/trace/meta";

const DIFFICULTY_COLOR: Record<Example["difficulty"], string> = {
  Easy: "bg-go/30",
  Medium: "bg-pop/30",
  Hard: "bg-alarm/30",
};

export default function ExamplesDrawer() {
  const [open, setOpen] = useState(false);
  const loadExample = useTraceStore((s) => s.loadExample);
  const activeExample = useTraceStore((s) => s.activeExample);
  const groups = groupExamplesByTopic(EXAMPLES);

  return (
    <div className="card-neo overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 font-display text-xs uppercase tracking-tight"
      >
        Examples
        <span className="font-mono text-ink/60">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t-2 border-ink max-h-72 overflow-y-auto p-2 flex flex-col gap-3">
          {[...groups.entries()].map(([topic, examples]) => (
            <div key={topic} className="flex flex-col gap-1">
              <div className="font-mono text-[10px] uppercase tracking-wide text-ink/60 px-1">{topic}</div>
              {examples.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => loadExample(example)}
                  className={`flex items-center justify-between px-2 py-1.5 rounded border-2 border-ink text-left text-sm press-neo ${
                    activeExample?.id === example.id ? "bg-accent text-paper" : "bg-paper text-ink"
                  }`}
                >
                  <span>{example.name}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-ink ${DIFFICULTY_COLOR[example.difficulty]}`}
                  >
                    {example.difficulty}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
