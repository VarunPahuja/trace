// Cloud persistence for the tracker — mirrors storage.ts's shape (load/save
// primitives) but async, since every op is a network round trip. Callers
// (trackerStore) only reach this module when signed in with Supabase
// configured; every function here assumes that's already true.
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TrackerDifficulty, TrackerEntry, TrackerEntryInput, TrackerStatus } from "./types";

const TABLE = "tracker_entries";

interface TrackerRow {
  id: string;
  name: string;
  link: string | null;
  topic: string;
  difficulty: string;
  time_minutes: number;
  intuition: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

function rowToEntry(row: TrackerRow): TrackerEntry {
  return {
    id: row.id,
    name: row.name,
    link: row.link ?? undefined,
    topic: row.topic,
    difficulty: row.difficulty as TrackerDifficulty,
    timeMinutes: row.time_minutes,
    intuition: row.intuition ?? "",
    notes: row.notes ?? "",
    status: row.status as TrackerStatus,
    createdAt: row.created_at,
  };
}

function inputToRow(input: TrackerEntryInput) {
  return {
    name: input.name,
    link: input.link || null,
    topic: input.topic,
    difficulty: input.difficulty,
    time_minutes: input.timeMinutes,
    intuition: input.intuition,
    notes: input.notes,
    status: input.status,
  };
}

export async function fetchCloudEntries(): Promise<TrackerEntry[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) {
    if (error) console.error("tracker: fetch failed", error.message);
    return [];
  }
  return (data as TrackerRow[]).map(rowToEntry);
}

/** Insert a brand-new entry — lets Postgres generate the id/created_at. */
export async function insertCloudEntry(userId: string, input: TrackerEntryInput): Promise<TrackerEntry | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ user_id: userId, ...inputToRow(input) })
    .select()
    .single();
  if (error || !data) {
    if (error) console.error("tracker: insert failed", error.message);
    return null;
  }
  return rowToEntry(data as TrackerRow);
}

/** Re-insert a previously-deleted entry (undo) preserving its exact id and
 * created_at — both are already valid uuid/timestamptz values since the
 * entry came from this same table originally. */
export async function restoreCloudEntry(userId: string, entry: TrackerEntry): Promise<TrackerEntry | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { id, createdAt, ...rest } = entry;
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ id, user_id: userId, created_at: createdAt, ...inputToRow(rest) })
    .select()
    .single();
  if (error || !data) {
    if (error) console.error("tracker: restore failed", error.message);
    return null;
  }
  return rowToEntry(data as TrackerRow);
}

export async function updateCloudEntry(id: string, patch: Partial<TrackerEntryInput>): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.link !== undefined) dbPatch.link = patch.link || null;
  if (patch.topic !== undefined) dbPatch.topic = patch.topic;
  if (patch.difficulty !== undefined) dbPatch.difficulty = patch.difficulty;
  if (patch.timeMinutes !== undefined) dbPatch.time_minutes = patch.timeMinutes;
  if (patch.intuition !== undefined) dbPatch.intuition = patch.intuition;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  const { error } = await supabase.from(TABLE).update(dbPatch).eq("id", id);
  if (error) console.error("tracker: update failed", error.message);
}

export async function deleteCloudEntry(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) console.error("tracker: delete failed", error.message);
}

/** Bulk-import localStorage entries on first sign-in. Fresh ids/timestamps
 * aren't reused (local ids aren't valid uuids) but created_at is preserved
 * for chronological accuracy. */
export async function importCloudEntries(userId: string, entries: TrackerEntry[]): Promise<TrackerEntry[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || entries.length === 0) return [];
  const rows = entries.map((e) => ({ user_id: userId, created_at: e.createdAt, ...inputToRow(e) }));
  const { data, error } = await supabase.from(TABLE).insert(rows).select();
  if (error || !data) {
    if (error) console.error("tracker: import failed", error.message);
    return [];
  }
  return (data as TrackerRow[]).map(rowToEntry);
}
