"use client";

import { TOPICS } from "@/lib/trace/meta";
import { useTrackerStore } from "@/lib/store/trackerStore";
import type { TrackerStatus } from "@/lib/tracker/types";

const STATUSES: TrackerStatus[] = ["solved", "revisit", "stuck"];

export default function TrackerFilters() {
  const filterTopic = useTrackerStore((s) => s.filterTopic);
  const filterStatus = useTrackerStore((s) => s.filterStatus);
  const setFilterTopic = useTrackerStore((s) => s.setFilterTopic);
  const setFilterStatus = useTrackerStore((s) => s.setFilterStatus);

  return (
    <div className="flex flex-wrap gap-3 items-center font-mono text-xs">
      <select
        value={filterTopic ?? ""}
        onChange={(e) => setFilterTopic(e.target.value || null)}
        className="border-neo rounded-lg px-2 py-1.5 bg-paper"
      >
        <option value="">All topics</option>
        {TOPICS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={filterStatus ?? ""}
        onChange={(e) => setFilterStatus((e.target.value || null) as TrackerStatus | null)}
        className="border-neo rounded-lg px-2 py-1.5 bg-paper"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {(filterTopic || filterStatus) && (
        <button
          type="button"
          onClick={() => {
            setFilterTopic(null);
            setFilterStatus(null);
          }}
          className="text-ink/60 underline"
        >
          clear filters
        </button>
      )}
    </div>
  );
}
