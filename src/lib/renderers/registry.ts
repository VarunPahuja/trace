// Scene composition — master.md §9 "Scene composition rule": inspect
// meta.roles, pick the primary renderer by topic, stack secondary
// renderers below/beside. Extended per-topic as more renderers land in
// Phase 3; only the Phase 2 topics (array-family) are handled richly here.
import type { PreprocessMeta, VariableRole } from "@/lib/trace/meta";

export type RendererSpec =
  | {
      kind: "array";
      varName: string;
      windowStartVar?: string;
      windowEndVar?: string;
      dimRangeStartVar?: string;
      dimRangeEndVar?: string;
    }
  | { kind: "hashmap"; varName: string }
  | { kind: "stack"; varName: string }
  | { kind: "linkedlist"; headVars: string[]; pointerVars: string[] }
  | { kind: "tree"; rootVars: string[]; pointerVars: string[] }
  | { kind: "grid"; varName: string; rowVar?: string; colVar?: string }
  | { kind: "graph"; graphVar: string; visitedVar?: string; pointerVars: string[]; distanceVar?: string }
  | { kind: "interval"; varName: string }
  | { kind: "bits"; varNames: string[] }
  | { kind: "calltree" };

export interface Scene {
  primary: RendererSpec[];
  secondary: RendererSpec[];
}

function varsByRole(meta: PreprocessMeta, role: VariableRole): string[] {
  return Object.entries(meta.roles)
    .filter(([, r]) => r === role)
    .map(([name]) => name);
}

const LOWER_BOUND_NAMES = new Set(["l", "left", "lo"]);
const UPPER_BOUND_NAMES = new Set(["r", "right", "hi"]);
const ROW_NAMES = new Set(["r", "row"]);
const COL_NAMES = new Set(["c", "col", "column"]);

export function resolveScene(meta: PreprocessMeta | null): Scene {
  const primary: RendererSpec[] = [];
  const secondary: RendererSpec[] = [];
  if (!meta) return { primary, secondary };

  const mainArrays = varsByRole(meta, "mainArray");
  const secondaryArrays = varsByRole(meta, "secondaryArray");
  const hashMaps = varsByRole(meta, "hashMap");
  const stacks = varsByRole(meta, "stack");
  const pointers = varsByRole(meta, "pointer");
  const linkedListHeads = varsByRole(meta, "linkedListHead");
  const treeRoots = varsByRole(meta, "treeRoot");
  const dpTables1D = varsByRole(meta, "dpTable1D");
  const dpTables2D = varsByRole(meta, "dpTable2D");
  const graphs = varsByRole(meta, "graph");
  const visitedSets = varsByRole(meta, "visitedSet");
  const queues = varsByRole(meta, "queue");
  const intervalLists = varsByRole(meta, "intervalList");
  const bitValues = varsByRole(meta, "bitValue");
  const [windowStart] = varsByRole(meta, "windowStart");
  const [windowEnd] = varsByRole(meta, "windowEnd");

  switch (meta.topic) {
    case "Linked List":
      if (linkedListHeads.length > 0) {
        primary.push({ kind: "linkedlist", headVars: linkedListHeads, pointerVars: pointers });
      }
      break;

    case "Trees":
      if (treeRoots.length > 0) {
        primary.push({ kind: "tree", rootVars: treeRoots, pointerVars: pointers });
      }
      break;

    case "1-D DP":
      dpTables1D.forEach((v) => primary.push({ kind: "array", varName: v }));
      mainArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      break;

    case "2-D DP":
      dpTables2D.forEach((v) => primary.push({ kind: "grid", varName: v }));
      break;

    case "Math & Geometry":
      dpTables2D.forEach((v) => primary.push({ kind: "grid", varName: v }));
      mainArrays.forEach((v) => (dpTables2D.length > 0 ? secondary : primary).push({ kind: "array", varName: v }));
      break;

    case "Graphs":
    case "Advanced Graphs": {
      if (graphs.length > 0) {
        const distanceVar = meta.topic === "Advanced Graphs" ? hashMaps[0] : undefined;
        graphs.forEach((v) =>
          primary.push({ kind: "graph", graphVar: v, visitedVar: visitedSets[0], pointerVars: pointers, distanceVar }),
        );
      } else {
        // Grid-shaped graph input (e.g. Number of Islands) — GridRenderer,
        // not GraphRenderer, per the grid/graph split.
        const rowVar = pointers.find((p) => ROW_NAMES.has(p));
        const colVar = pointers.find((p) => COL_NAMES.has(p));
        dpTables2D.forEach((v) => primary.push({ kind: "grid", varName: v, rowVar, colVar }));
      }
      mainArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      queues.forEach((v) => secondary.push({ kind: "array", varName: v }));
      break;
    }

    case "Intervals":
      intervalLists.forEach((v) => primary.push({ kind: "interval", varName: v }));
      break;

    case "Backtracking":
      primary.push({ kind: "calltree" });
      mainArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      break;

    case "Bit Manipulation":
      if (bitValues.length > 0) primary.push({ kind: "bits", varNames: bitValues });
      dpTables1D.forEach((v) => secondary.push({ kind: "array", varName: v }));
      mainArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      break;

    case "Stack":
      stacks.forEach((v) => primary.push({ kind: "stack", varName: v }));
      mainArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      break;

    case "Sliding Window":
      mainArrays.forEach((v) =>
        primary.push({ kind: "array", varName: v, windowStartVar: windowStart, windowEndVar: windowEnd }),
      );
      hashMaps.forEach((v) => secondary.push({ kind: "hashmap", varName: v }));
      break;

    case "Binary Search": {
      const lower = pointers.find((p) => LOWER_BOUND_NAMES.has(p));
      const upper = pointers.find((p) => UPPER_BOUND_NAMES.has(p));
      mainArrays.forEach((v) =>
        primary.push({ kind: "array", varName: v, dimRangeStartVar: lower, dimRangeEndVar: upper }),
      );
      break;
    }

    case "Arrays & Hashing":
      mainArrays.forEach((v) => primary.push({ kind: "array", varName: v }));
      hashMaps.forEach((v) => (mainArrays.length > 0 ? secondary : primary).push({ kind: "hashmap", varName: v }));
      break;

    case "Two Pointers":
    default:
      mainArrays.forEach((v) => primary.push({ kind: "array", varName: v }));
      secondaryArrays.forEach((v) => secondary.push({ kind: "array", varName: v }));
      hashMaps.forEach((v) => secondary.push({ kind: "hashmap", varName: v }));
      stacks.forEach((v) => secondary.push({ kind: "stack", varName: v }));
      break;
  }

  return { primary, secondary };
}
