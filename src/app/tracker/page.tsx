"use client";

import { useEffect, useState } from "react";
import { useTrackerStore } from "@/lib/store/trackerStore";
import type { TrackerEntry } from "@/lib/tracker/types";
import TrackerSummary from "@/components/tracker/TrackerSummary";
import TrackerFilters from "@/components/tracker/TrackerFilters";
import TrackerCard from "@/components/tracker/TrackerCard";
import TrackerEntryModal from "@/components/tracker/TrackerEntryModal";
import TrackerExportButton from "@/components/tracker/TrackerExportButton";
import UndoToast from "@/components/tracker/UndoToast";

export default function TrackerPage() {
  const hydrate = useTrackerStore((s) => s.hydrate);
  const hydrated = useTrackerStore((s) => s.hydrated);
  const entries = useTrackerStore((s) => s.entries);
  const filterTopic = useTrackerStore((s) => s.filterTopic);
  const filterStatus = useTrackerStore((s) => s.filterStatus);

  const [modalEntry, setModalEntry] = useState<TrackerEntry | null | "new">(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const filtered = entries.filter(
    (e) => (!filterTopic || e.topic === filterTopic) && (!filterStatus || e.status === filterStatus),
  );

  return (
    <div className="flex-1 flex flex-col gap-4 p-6 max-w-5xl w-full mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-3xl uppercase">Tracker</h1>
        <div className="flex gap-2">
          <TrackerExportButton />
          <button type="button" onClick={() => setModalEntry("new")} className="btn-neo-accent text-xs py-1.5">
            + Add problem
          </button>
        </div>
      </div>

      <TrackerSummary />
      <TrackerFilters />

      {!hydrated ? (
        <div className="card-neo p-6 font-body text-ink/50">loading…</div>
      ) : filtered.length === 0 ? (
        <div className="card-neo p-6 font-body text-ink/50 text-center">
          {entries.length === 0 ? "No problems logged yet — add your first one." : "Nothing matches these filters."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((entry) => (
            <TrackerCard key={entry.id} entry={entry} onEdit={() => setModalEntry(entry)} />
          ))}
        </div>
      )}

      {modalEntry !== null && (
        <TrackerEntryModal
          entry={modalEntry === "new" ? null : modalEntry}
          onClose={() => setModalEntry(null)}
        />
      )}
      <UndoToast />
    </div>
  );
}
