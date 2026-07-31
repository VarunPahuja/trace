"use client";

import { create } from "zustand";
import type { TrackerEntry, TrackerEntryInput, TrackerStatus } from "@/lib/tracker/types";
import { loadEntries, saveEntries } from "@/lib/tracker/storage";

const UNDO_WINDOW_MS = 6000;

interface PendingDelete {
  entry: TrackerEntry;
  index: number;
}

interface TrackerState {
  entries: TrackerEntry[];
  hydrated: boolean;
  filterTopic: string | null;
  filterStatus: TrackerStatus | null;
  pendingDelete: PendingDelete | null;

  hydrate: () => void;
  addEntry: (input: TrackerEntryInput) => void;
  updateEntry: (id: string, patch: Partial<TrackerEntryInput>) => void;
  deleteEntry: (id: string) => void;
  undoDelete: () => void;
  dismissUndo: () => void;
  setFilterTopic: (topic: string | null) => void;
  setFilterStatus: (status: TrackerStatus | null) => void;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let undoTimer: ReturnType<typeof setTimeout> | null = null;

export const useTrackerStore = create<TrackerState>((set, get) => ({
  entries: [],
  hydrated: false,
  filterTopic: null,
  filterStatus: null,
  pendingDelete: null,

  // localStorage isn't available during SSR — start empty (matches server
  // render) and load for real once mounted client-side.
  hydrate: () => {
    if (get().hydrated) return;
    set({ entries: loadEntries(), hydrated: true });
  },

  addEntry: (input) => {
    const entry: TrackerEntry = { ...input, id: newId(), createdAt: new Date().toISOString() };
    const entries = [entry, ...get().entries];
    set({ entries });
    saveEntries(entries);
  },

  updateEntry: (id, patch) => {
    const entries = get().entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    set({ entries });
    saveEntries(entries);
  },

  deleteEntry: (id) => {
    const current = get().entries;
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) return;
    const entry = current[index];
    const entries = current.filter((e) => e.id !== id);
    set({ entries, pendingDelete: { entry, index } });
    saveEntries(entries);

    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      set((s) => (s.pendingDelete?.entry.id === id ? { pendingDelete: null } : s));
    }, UNDO_WINDOW_MS);
  },

  undoDelete: () => {
    const pending = get().pendingDelete;
    if (!pending) return;
    if (undoTimer) clearTimeout(undoTimer);
    const entries = [...get().entries];
    entries.splice(Math.min(pending.index, entries.length), 0, pending.entry);
    set({ entries, pendingDelete: null });
    saveEntries(entries);
  },

  dismissUndo: () => {
    if (undoTimer) clearTimeout(undoTimer);
    set({ pendingDelete: null });
  },

  setFilterTopic: (topic) => set({ filterTopic: topic }),
  setFilterStatus: (status) => set({ filterStatus: status }),
}));
