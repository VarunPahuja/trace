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
  | { kind: "stack"; varName: string };

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

export function resolveScene(meta: PreprocessMeta | null): Scene {
  const primary: RendererSpec[] = [];
  const secondary: RendererSpec[] = [];
  if (!meta) return { primary, secondary };

  const mainArrays = varsByRole(meta, "mainArray");
  const secondaryArrays = varsByRole(meta, "secondaryArray");
  const hashMaps = varsByRole(meta, "hashMap");
  const stacks = varsByRole(meta, "stack");
  const pointers = varsByRole(meta, "pointer");
  const [windowStart] = varsByRole(meta, "windowStart");
  const [windowEnd] = varsByRole(meta, "windowEnd");

  switch (meta.topic) {
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
