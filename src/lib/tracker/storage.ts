import type { TrackerEntry } from "./types";

const STORAGE_KEY = "trace.tracker.v1";
const IMPORT_PROMPTED_KEY = "trace.tracker.importPrompted.v1";

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

export function clearLocalEntries(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore — nothing to clean up if storage is unavailable
  }
}

/** The cloud-import prompt (Phase 8) only ever shows once per browser,
 * regardless of whether the user imports or dismisses it. */
export function hasBeenPromptedForImport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(IMPORT_PROMPTED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markImportPrompted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(IMPORT_PROMPTED_KEY, "1");
  } catch {
    // ignore
  }
}
