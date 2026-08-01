// LLM preprocessing contract shapes — master.md §6 — plus the Example
// shape hand-authored examples use (§13). Shared by the LLM route (Phase
// 4), examples library, and the renderer registry (roles drive binding).

export const TOPICS = [
  "Arrays & Hashing",
  "Two Pointers",
  "Stack",
  "Binary Search",
  "Sliding Window",
  "Linked List",
  "Trees",
  "Tries",
  "Heap/Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D DP",
  "2-D DP",
  "Intervals",
  "Greedy",
  "Bit Manipulation",
  "Math & Geometry",
] as const;

export type Topic = (typeof TOPICS)[number];

export const VARIABLE_ROLES = [
  "mainArray",
  "secondaryArray",
  "pointer",
  "windowStart",
  "windowEnd",
  "target",
  "hashMap",
  "stack",
  "heap",
  "linkedListHead",
  "treeRoot",
  "graph",
  "dpTable1D",
  "dpTable2D",
  "intervalList",
  "bitValue",
  "resultVar",
  "counter",
  "visitedSet",
  "queue",
  "other",
] as const;

export type VariableRole = (typeof VARIABLE_ROLES)[number];

export interface PreprocessMeta {
  topic: Topic;
  subPattern: string;
  roles: Record<string, VariableRole>;
  inputDescription: string;
  problemName: string;
  problemSummary: string;
  constraints: string[];
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Example {
  id: string;
  topic: Topic;
  name: string;
  difficulty: Difficulty;
  code: string;
  input: string;
  intuition: string;
  meta: PreprocessMeta;
}
