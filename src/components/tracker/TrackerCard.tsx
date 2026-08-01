"use client";

import { useTrackerStore } from "@/lib/store/trackerStore";
import type { TrackerEntry, TrackerStatus } from "@/lib/tracker/types";

interface TrackerCardProps {
  entry: TrackerEntry;
  onEdit: () => void;
}

const DIFFICULTY_COLOR: Record<TrackerEntry["difficulty"], string> = {
  easy: "bg-go/30",
  medium: "bg-pop/30",
  hard: "bg-alarm/30",
};

const STATUS_CYCLE: Record<TrackerStatus, TrackerStatus> = {
  solved: "revisit",
  revisit: "stuck",
  stuck: "solved",
};

const STATUS_COLOR: Record<TrackerStatus, string> = {
  solved: "bg-go text-paper",
  revisit: "bg-pop text-ink",
  stuck: "bg-alarm text-paper",
};

export default function TrackerCard({ entry, onEdit }: TrackerCardProps) {
  const updateEntry = useTrackerStore((s) => s.updateEntry);
  const deleteEntry = useTrackerStore((s) => s.deleteEntry);

  return (
    <div className="card-neo p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          {entry.link ? (
            <a
              href={entry.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-sm uppercase hover:text-accent underline"
            >
              {entry.name}
            </a>
          ) : (
            <span className="font-display text-sm uppercase">{entry.name}</span>
          )}
          <div className="font-mono text-[10px] text-ink/60">{entry.topic}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-ink ${DIFFICULTY_COLOR[entry.difficulty]}`}>
            {entry.difficulty}
          </span>
          <button
            type="button"
            onClick={() => updateEntry(entry.id, { status: STATUS_CYCLE[entry.status] })}
            title="Click to cycle status"
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full border border-ink press-neo ${STATUS_COLOR[entry.status]}`}
          >
            {entry.status}
          </button>
        </div>
      </div>

      {entry.intuition && <p className="font-body text-xs text-ink/70">{entry.intuition}</p>}
      {entry.notes && <p className="font-mono text-[11px] text-ink/60 whitespace-pre-wrap">{entry.notes}</p>}

      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-[10px] text-ink/60">{entry.timeMinutes}m</span>
        <div className="flex gap-2">
          <button type="button" onClick={onEdit} className="font-mono text-[10px] underline text-ink/60">
            edit
          </button>
          <button
            type="button"
            onClick={() => deleteEntry(entry.id)}
            className="font-mono text-[10px] underline text-alarm"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}
