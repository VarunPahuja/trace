"use client";

import { useTraceStore } from "@/lib/store/traceStore";

export default function IntuitionCard() {
  const activeExample = useTraceStore((s) => s.activeExample);
  if (!activeExample) return null;

  return (
    <div className="card-neo p-3 flex flex-col gap-1">
      <div className="font-display text-xs uppercase tracking-tight text-accent">Intuition</div>
      <p className="font-body text-sm text-ink/80">{activeExample.intuition}</p>
    </div>
  );
}
