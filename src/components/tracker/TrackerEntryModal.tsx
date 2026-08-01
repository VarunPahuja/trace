"use client";

import { useState } from "react";
import { TOPICS } from "@/lib/trace/meta";
import { useTrackerStore } from "@/lib/store/trackerStore";
import type { TrackerDifficulty, TrackerEntry, TrackerEntryInput, TrackerStatus } from "@/lib/tracker/types";
import type { LeetCodeAutofillResponse, LeetCodeErrorBody } from "@/lib/leetcode/types";

type AutofillState = "idle" | "loading" | "error" | "success";

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
  const [autofillState, setAutofillState] = useState<AutofillState>("idle");

  function set<K extends keyof TrackerEntryInput>(key: K, value: TrackerEntryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAutofill() {
    const url = (form.link ?? "").trim();
    if (!url) return;
    setAutofillState("loading");
    try {
      const res = await fetch("/api/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: LeetCodeAutofillResponse | LeetCodeErrorBody = await res.json();
      if (!res.ok || "error" in data) {
        setAutofillState("error");
        return;
      }
      setForm((f) => ({
        ...f,
        name: data.name,
        difficulty: data.difficulty,
        topic: data.topic ?? f.topic,
      }));
      setAutofillState("success");
    } catch {
      setAutofillState("error");
    }
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
          <div className="flex gap-2">
            <input
              value={form.link ?? ""}
              onChange={(e) => {
                set("link", e.target.value);
                if (autofillState !== "idle") setAutofillState("idle");
              }}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="border-neo rounded-lg px-2 py-1.5 flex-1"
            />
            <button
              type="button"
              onClick={() => void handleAutofill()}
              disabled={!form.link?.trim() || autofillState === "loading"}
              className="btn-neo text-xs px-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {autofillState === "loading" ? "…" : "Autofill"}
            </button>
          </div>
          {autofillState === "error" && (
            <span className="text-alarm font-mono text-[11px]">couldn&apos;t fetch — fill in manually</span>
          )}
          {autofillState === "success" && (
            <span className="text-go font-mono text-[11px]">autofilled from LeetCode</span>
          )}
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
