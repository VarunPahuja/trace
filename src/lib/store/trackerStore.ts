"use client";

import { create } from "zustand";
import type { TrackerEntry, TrackerEntryInput, TrackerStatus } from "@/lib/tracker/types";
import {
  clearLocalEntries,
  hasBeenPromptedForImport,
  loadEntries,
  markImportPrompted,
  saveEntries,
} from "@/lib/tracker/storage";
import {
  deleteCloudEntry,
  fetchCloudEntries,
  importCloudEntries,
  insertCloudEntry,
  restoreCloudEntry,
  updateCloudEntry,
} from "@/lib/tracker/supabaseStorage";
import { useAuthStore } from "@/lib/store/authStore";

const UNDO_WINDOW_MS = 6000;

interface PendingDelete {
  entry: TrackerEntry;
  index: number;
}

export type TrackerMode = "local" | "cloud";

interface ImportPrompt {
  localEntries: TrackerEntry[];
}

interface TrackerState {
  entries: TrackerEntry[];
  hydrated: boolean;
  mode: TrackerMode;
  filterTopic: string | null;
  filterStatus: TrackerStatus | null;
  pendingDelete: PendingDelete | null;
  importPrompt: ImportPrompt | null;
  importing: boolean;

  hydrate: () => void;
  addEntry: (input: TrackerEntryInput) => void;
  updateEntry: (id: string, patch: Partial<TrackerEntryInput>) => void;
  deleteEntry: (id: string) => void;
  undoDelete: () => void;
  dismissUndo: () => void;
  setFilterTopic: (topic: string | null) => void;
  setFilterStatus: (status: TrackerStatus | null) => void;

  /** Internal — called by the auth-state subscription below. */
  switchToCloud: () => Promise<void>;
  switchToLocal: () => void;
  confirmImport: () => Promise<void>;
  dismissImportPrompt: () => void;
}

function newLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

let undoTimer: ReturnType<typeof setTimeout> | null = null;

/** True once a real signed-in Supabase user exists — the one signal that
 * decides which storage backend every tracker op targets. */
function currentUserId(): string | null {
  const { status, user } = useAuthStore.getState();
  return status === "signed-in" ? (user?.id ?? null) : null;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  entries: [],
  hydrated: false,
  mode: "local",
  filterTopic: null,
  filterStatus: null,
  pendingDelete: null,
  importPrompt: null,
  importing: false,

  // localStorage isn't available during SSR — start empty (matches server
  // render) and load for real once mounted client-side. Mode is decided by
  // auth state at the moment of hydration; if the user signs in/out later
  // while the tracker is open, the auth-store subscription below reacts.
  hydrate: () => {
    if (get().hydrated) return;
    const userId = currentUserId();
    if (userId) {
      set({ hydrated: true, mode: "cloud" });
      void get().switchToCloud();
    } else {
      set({ entries: loadEntries(), hydrated: true, mode: "local" });
    }
  },

  addEntry: (input) => {
    const userId = currentUserId();
    if (get().mode === "cloud" && userId) {
      // Optimistic: show it immediately under a temp id, reconcile once
      // the real row (real uuid) comes back.
      const tempId = `pending-${newLocalId()}`;
      const optimistic: TrackerEntry = { ...input, id: tempId, createdAt: new Date().toISOString() };
      set({ entries: [optimistic, ...get().entries] });
      void insertCloudEntry(userId, input).then((real) => {
        if (!real) return; // insert failed — optimistic row stays, already logged
        set({ entries: get().entries.map((e) => (e.id === tempId ? real : e)) });
      });
      return;
    }
    const entry: TrackerEntry = { ...input, id: newLocalId(), createdAt: new Date().toISOString() };
    const entries = [entry, ...get().entries];
    set({ entries });
    saveEntries(entries);
  },

  updateEntry: (id, patch) => {
    const entries = get().entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    set({ entries });
    if (get().mode === "cloud") {
      void updateCloudEntry(id, patch);
    } else {
      saveEntries(entries);
    }
  },

  deleteEntry: (id) => {
    const current = get().entries;
    const index = current.findIndex((e) => e.id === id);
    if (index === -1) return;
    const entry = current[index];
    const entries = current.filter((e) => e.id !== id);
    set({ entries, pendingDelete: { entry, index } });

    if (get().mode === "cloud") {
      void deleteCloudEntry(id);
    } else {
      saveEntries(entries);
    }

    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      set((s) => (s.pendingDelete?.entry.id === id ? { pendingDelete: null } : s));
    }, UNDO_WINDOW_MS);
  },

  undoDelete: () => {
    const pending = get().pendingDelete;
    if (!pending) return;
    if (undoTimer) clearTimeout(undoTimer);
    const userId = currentUserId();

    if (get().mode === "cloud" && userId) {
      const entries = [...get().entries];
      entries.splice(Math.min(pending.index, entries.length), 0, pending.entry);
      set({ entries, pendingDelete: null });
      void restoreCloudEntry(userId, pending.entry).then((real) => {
        if (!real) return;
        set({ entries: get().entries.map((e) => (e.id === pending.entry.id ? real : e)) });
      });
      return;
    }

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

  switchToCloud: async () => {
    const userId = currentUserId();
    if (!userId) return;
    const cloudEntries = await fetchCloudEntries();

    if (cloudEntries.length === 0 && !hasBeenPromptedForImport()) {
      const localEntries = loadEntries();
      if (localEntries.length > 0) {
        set({ mode: "local", entries: localEntries, importPrompt: { localEntries }, hydrated: true });
        return;
      }
    }

    set({ mode: "cloud", entries: cloudEntries, importPrompt: null, hydrated: true });
  },

  switchToLocal: () => {
    if (undoTimer) clearTimeout(undoTimer);
    set({ mode: "local", entries: loadEntries(), pendingDelete: null, importPrompt: null, hydrated: true });
  },

  confirmImport: async () => {
    const prompt = get().importPrompt;
    const userId = currentUserId();
    if (!prompt || !userId) return;
    set({ importing: true });
    const imported = await importCloudEntries(userId, prompt.localEntries);
    markImportPrompted();
    if (imported.length > 0) {
      clearLocalEntries();
    }
    set({ mode: "cloud", entries: imported, importPrompt: null, importing: false });
  },

  dismissImportPrompt: () => {
    markImportPrompted();
    const userId = currentUserId();
    set({ mode: "cloud", entries: [], importPrompt: null });
    if (userId) void fetchCloudEntries().then((entries) => set({ entries }));
  },
}));

// Reacts to sign-in/sign-out happening while the tracker store is already
// hydrated (e.g. the user signs in from another tab, or from the tracker
// page itself) — switches backend without a page reload. On first load,
// `hydrate()` alone decides the correct starting mode, so this only needs
// to handle *changes* after that.
if (typeof window !== "undefined") {
  let lastStatus = useAuthStore.getState().status;
  useAuthStore.subscribe((state) => {
    if (state.status === lastStatus || state.status === "loading") return;
    const wasSignedIn = lastStatus === "signed-in";
    lastStatus = state.status;

    const tracker = useTrackerStore.getState();
    if (!tracker.hydrated) return; // hydrate() will pick the right mode itself

    if (state.status === "signed-in" && !wasSignedIn) {
      void useTrackerStore.getState().switchToCloud();
    } else if (state.status === "signed-out" && wasSignedIn) {
      useTrackerStore.getState().switchToLocal();
    }
  });
}
