"use client";

import { useState } from "react";
import { useTrackerStore } from "@/lib/store/trackerStore";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function TrackerSummary() {
  const entries = useTrackerStore((s) => s.entries);
  // Date.now() is impure — a useState lazy initializer is React's
  // sanctioned escape hatch for one-time non-deterministic values (unlike
  // useMemo, whose callback still runs during the render phase itself).
  const [weekAgo] = useState(() => Date.now() - SEVEN_DAYS_MS);

  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  let totalMinutes = 0;
  let solvedThisWeek = 0;

  for (const e of entries) {
    byDifficulty[e.difficulty] += 1;
    totalMinutes += e.timeMinutes;
    if (e.status === "solved" && new Date(e.createdAt).getTime() >= weekAgo) solvedThisWeek += 1;
  }

  const stats = [
    { label: "Easy", value: byDifficulty.easy, color: "bg-go/30" },
    { label: "Medium", value: byDifficulty.medium, color: "bg-pop/30" },
    { label: "Hard", value: byDifficulty.hard, color: "bg-alarm/30" },
    { label: "Total time", value: `${totalMinutes}m`, color: "bg-paper" },
    { label: "Solved this week", value: solvedThisWeek, color: "bg-accent/20" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <div key={s.label} className={`card-neo px-4 py-2 flex flex-col items-center ${s.color}`}>
          <div className="font-display text-xl">{s.value}</div>
          <div className="font-mono text-[10px] uppercase text-ink/60">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
