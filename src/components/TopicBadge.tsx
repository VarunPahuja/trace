"use client";

import { useTraceStore } from "@/lib/store/traceStore";

export default function TopicBadge() {
  const meta = useTraceStore((s) => s.meta);

  return (
    <span className="hidden sm:inline-block font-body text-xs uppercase tracking-wide border-neo rounded-full px-3 py-1 bg-paper text-ink/60">
      {meta ? meta.topic : "no topic loaded"}
    </span>
  );
}
