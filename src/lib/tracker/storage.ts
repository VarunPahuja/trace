import type { TrackerEntry } from "./types";

const STORAGE_KEY = "trace.tracker.v1";

export function loadEntries(): TrackerEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrackerEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: TrackerEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full/unavailable — silently ignore, in-memory state still works this session
  }
}
