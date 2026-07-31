// master.md §14 — problem tracker (localStorage only, zero backend).
export type TrackerDifficulty = "easy" | "medium" | "hard";
export type TrackerStatus = "solved" | "revisit" | "stuck";

export interface TrackerEntry {
  id: string;
  name: string;
  link?: string;
  topic: string;
  difficulty: TrackerDifficulty;
  timeMinutes: number;
  intuition: string;
  notes: string;
  status: TrackerStatus;
  createdAt: string;
}

export type TrackerEntryInput = Omit<TrackerEntry, "id" | "createdAt">;
