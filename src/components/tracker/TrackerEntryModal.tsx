"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/trace/meta";
import { useTrackerStore } from "@/lib/store/trackerStore";
import type { TrackerDifficulty, TrackerEntry, TrackerEntryInput, TrackerStatus } from "@/lib/tracker/types";

interface TrackerEntryModalProps {
  entry: TrackerEntry | null;
  onClose: () => void;
}

const EMPTY: TrackerEntryInput = {
  name: "",
  link: "",
  topic: TOPICS[0],
  difficulty: "easy",
  timeMinutes: 0,
  intuition: "",
  notes: "",
  status: "solved",
};

export default function TrackerEntryModal({ entry, onClose }: TrackerEntryModalProps) {
  const addEntry = useTrackerStore((s) => s.addEntry);
  const updateEntry = useTrackerStore((s) => s.updateEntry);
  const [form, setForm] = useState<TrackerEntryInput>(entry ?? EMPTY);

  function set<K extends keyof TrackerEntryInput>(key: K, value: TrackerEntryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (entry) {
      updateEntry(entry.id, form);
    } else {
      addEntry(form);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="card-neo bg-paper p-5 w-full max-w-md flex flex-col gap-3 max-h-[90vh] overflow-y-auto"
      >
        <div className="font-display uppercase text-lg">{entry ? "Edit problem" : "Add problem"}</div>

        <label className="flex flex-col gap-1 text-xs font-mono">
          Name
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="border-neo rounded-lg px-2 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-mono">
          Link (optional)
          <input
            value={form.link ?? ""}
            onChange={(e) => set("link", e.target.value)}
            className="border-neo rounded-lg px-2 py-1.5"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs font-mono">
            Topic
            <select
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              className="border-neo rounded-lg px-2 py-1.5"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono">
            Difficulty
            <select
              value={form.difficulty}
              onChange={(e) => set("difficulty", e.target.value as TrackerDifficulty)}
              className="border-neo rounded-lg px-2 py-1.5"
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono">
            Time (minutes)
            <input
              type="number"
              min={0}
              value={form.timeMinutes}
              onChange={(e) => set("timeMinutes", Number(e.target.value))}
              className="border-neo rounded-lg px-2 py-1.5"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-mono">
            Status
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as TrackerStatus)}
              className="border-neo rounded-lg px-2 py-1.5"
            >
              <option value="solved">solved</option>
              <option value="revisit">revisit</option>
              <option value="stuck">stuck</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-xs font-mono">
          Intuition
          <textarea
            value={form.intuition}
            onChange={(e) => set("intuition", e.target.value)}
            rows={2}
            className="border-neo rounded-lg px-2 py-1.5"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-mono">
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className="border-neo rounded-lg px-2 py-1.5"
          />
        </label>

        <div className="flex gap-2 justify-end mt-2">
          <button type="button" onClick={onClose} className="btn-neo text-xs py-1.5">
            Cancel
          </button>
          <button type="submit" className="btn-neo-accent text-xs py-1.5">
            {entry ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
