import type { TraceStep } from "@/lib/trace/types";

/** While execution is inside an unrelated nested call (e.g. a small helper
 * or a `__init__`), `step.locals` is that inner frame's locals only — none
 * of the structure-holding variables a renderer tracks are keys in it at
 * all, not just "unchanged." Computing renderer state straight from such a
 * step reads as the whole structure going out of scope and popping back
 * every time a helper gets called. Fall back to the nearest earlier step
 * where at least one tracked variable is actually a local of the active
 * frame, so brief dips into nested calls don't flicker anything. Used by
 * LinkedListRenderer and TrieRenderer, both of which resolve their
 * structure from named locals rather than a merged multi-step view. */
export function nearestRelevantStepIndex(steps: TraceStep[], currentStep: number, varNames: string[]): number {
  for (let i = currentStep; i >= 0; i--) {
    if (varNames.some((name) => name in steps[i].locals)) return i;
  }
  return currentStep;
}
